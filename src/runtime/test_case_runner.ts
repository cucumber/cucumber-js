import { EventEmitter } from 'node:events'
import * as messages from '@cucumber/messages'
import {
  Envelope,
  getWorstTestStepResult,
  IdGenerator,
} from '@cucumber/messages'
import { JsonObject } from 'type-fest'
import {
  ITestCaseHookParameter,
  ITestStepHookParameter,
  SupportCodeLibrary,
} from '../support_code_library_builder/types'
import TestCaseHookDefinition from '../models/test_case_hook_definition'
import TestStepHookDefinition from '../models/test_step_hook_definition'
import { IDefinition } from '../models/definition'
import { doesHaveValue, doesNotHaveValue } from '../value_checker'
import StepDefinition from '../models/step_definition'
import { IWorldOptions } from '../support_code_library_builder/world'
import StepDefinitionSnippetBuilder from '../formatter/step_definition_snippet_builder'
import { timestamp } from './stopwatch'
import StepRunner, { RunStepResult } from './step_runner'
import AttachmentManager from './attachment_manager'
import { getAmbiguousStepException } from './helpers'
import { makeSuggestion } from './make_suggestion'

export interface INewTestCaseRunnerOptions {
  workerId?: string
  eventBroadcaster: EventEmitter
  gherkinDocument: messages.GherkinDocument
  newId: IdGenerator.NewId
  pickle: messages.Pickle
  testCase: messages.TestCase
  retries: number
  skip: boolean
  filterStackTraces: boolean
  supportCodeLibrary: SupportCodeLibrary
  worldParameters: JsonObject
  snippetBuilder: StepDefinitionSnippetBuilder
}

export default class TestCaseRunner {
  private readonly workerId: string | undefined
  private readonly attachmentManager: AttachmentManager
  private currentTestCaseStartedId: string
  private currentTestStepId: string
  private readonly eventBroadcaster: EventEmitter
  private readonly gherkinDocument: messages.GherkinDocument
  private readonly newId: IdGenerator.NewId
  private readonly pickle: messages.Pickle
  private readonly testCase: messages.TestCase
  private readonly maxAttempts: number
  private readonly skip: boolean
  private readonly filterStackTraces: boolean
  private readonly supportCodeLibrary: SupportCodeLibrary
  private readonly snippetBuilder: StepDefinitionSnippetBuilder
  private testStepResults: messages.TestStepResult[]
  private world: any
  private readonly worldParameters: JsonObject

  constructor({
    workerId,
    eventBroadcaster,
    gherkinDocument,
    newId,
    pickle,
    testCase,
    retries = 0,
    skip,
    filterStackTraces,
    supportCodeLibrary,
    worldParameters,
    snippetBuilder,
  }: INewTestCaseRunnerOptions) {
    this.workerId = workerId
    this.attachmentManager = new AttachmentManager(
      ({ data, media, fileName }) => {
        if (doesNotHaveValue(this.currentTestStepId)) {
          throw new Error(
            'Cannot attach when a step/hook is not running. Ensure your step/hook waits for the attach to finish.'
          )
        }
        const attachment: messages.Envelope = {
          attachment: {
            body: data,
            contentEncoding: media.encoding,
            mediaType: media.contentType,
            fileName,
            testCaseStartedId: this.currentTestCaseStartedId,
            testStepId: this.currentTestStepId,
            timestamp: timestamp(),
          },
        }
        this.eventBroadcaster.emit('envelope', attachment)
      }
    )
    this.eventBroadcaster = eventBroadcaster
    this.gherkinDocument = gherkinDocument
    this.maxAttempts = 1 + (skip ? 0 : retries)
    this.newId = newId
    this.pickle = pickle
    this.testCase = testCase
    this.skip = skip
    this.filterStackTraces = filterStackTraces
    this.supportCodeLibrary = supportCodeLibrary
    this.worldParameters = worldParameters
    this.snippetBuilder = snippetBuilder
    this.resetTestProgressData()
  }

  resetTestProgressData(): void {
    this.world = new this.supportCodeLibrary.World({
      attach: this.attachmentManager.create.bind(this.attachmentManager),
      log: this.attachmentManager.log.bind(this.attachmentManager),
      link: this.attachmentManager.link.bind(this.attachmentManager),
      parameters: structuredClone(this.worldParameters),
    } satisfies IWorldOptions)
    this.testStepResults = []
  }

  getBeforeStepHookDefinitions(): TestStepHookDefinition[] {
    return this.supportCodeLibrary.beforeTestStepHookDefinitions.filter(
      (hookDefinition) => hookDefinition.appliesToTestCase(this.pickle)
    )
  }

  getAfterStepHookDefinitions(): TestStepHookDefinition[] {
    return this.supportCodeLibrary.afterTestStepHookDefinitions
      .slice(0)
      .reverse()
      .filter((hookDefinition) => hookDefinition.appliesToTestCase(this.pickle))
  }

  getWorstStepResult(): messages.TestStepResult {
    if (this.testStepResults.length === 0) {
      return {
        status: this.skip
          ? messages.TestStepResultStatus.SKIPPED
          : messages.TestStepResultStatus.PASSED,
        duration: messages.TimeConversion.millisecondsToDuration(0),
      }
    }
    return getWorstTestStepResult(this.testStepResults)
  }

  async invokeStep(
    step: messages.PickleStep,
    stepDefinition: IDefinition,
    hookParameter?: ITestCaseHookParameter
  ): Promise<RunStepResult> {
    return await StepRunner.run({
      defaultTimeout: this.supportCodeLibrary.defaultTimeout,
      filterStackTraces: this.filterStackTraces,
      hookParameter,
      step,
      stepDefinition,
      world: this.world,
    })
  }

  isSkippingSteps(): boolean {
    return (
      this.getWorstStepResult().status !== messages.TestStepResultStatus.PASSED
    )
  }

  shouldSkipHook(isBeforeHook: boolean): boolean {
    return this.skip || (this.isSkippingSteps() && isBeforeHook)
  }

  async aroundTestStep(
    testStepId: string,
    runStepFn: () => Promise<messages.TestStepResult>
  ): Promise<void> {
    const testStepStarted: messages.Envelope = {
      testStepStarted: {
        testCaseStartedId: this.currentTestCaseStartedId,
        testStepId,
        timestamp: timestamp(),
      },
    }
    this.eventBroadcaster.emit('envelope', testStepStarted)
    this.currentTestStepId = testStepId
    const testStepResult = await runStepFn()
    this.currentTestStepId = null
    this.testStepResults.push(testStepResult)
    const testStepFinished: messages.Envelope = {
      testStepFinished: {
        testCaseStartedId: this.currentTestCaseStartedId,
        testStepId,
        testStepResult,
        timestamp: timestamp(),
      },
    }
    this.eventBroadcaster.emit('envelope', testStepFinished)
  }

  async run(): Promise<messages.TestStepResultStatus> {
    for (let attempt = 0; attempt < this.maxAttempts; attempt++) {
      const moreAttemptsRemaining = attempt + 1 < this.maxAttempts

      const willBeRetried = await this.runAttempt(
        attempt,
        moreAttemptsRemaining
      )

      if (!willBeRetried) {
        break
      }
      this.resetTestProgressData()
    }
    return this.getWorstStepResult().status
  }

  async runAttempt(
    attempt: number,
    moreAttemptsRemaining: boolean
  ): Promise<boolean> {
    this.currentTestCaseStartedId = this.newId()
    const testCaseStarted: messages.Envelope = {
      testCaseStarted: {
        attempt,
        testCaseId: this.testCase.id,
        id: this.currentTestCaseStartedId,
        timestamp: timestamp(),
      },
    }
    if (this.workerId) {
      testCaseStarted.testCaseStarted.workerId = this.workerId
    }
    this.eventBroadcaster.emit('envelope', testCaseStarted)
    // used to determine whether a hook is a Before or After
    let didWeRunStepsYet = false
    let error = false
    for (const testStep of this.testCase.testSteps) {
      await this.aroundTestStep(testStep.id, async () => {
        if (doesHaveValue(testStep.hookId)) {
          const hookParameter: ITestCaseHookParameter = {
            gherkinDocument: this.gherkinDocument,
            pickle: this.pickle,
            testCaseStartedId: this.currentTestCaseStartedId,
          }
          if (didWeRunStepsYet) {
            hookParameter.result = this.getWorstStepResult()
            hookParameter.error = error
            hookParameter.willBeRetried =
              this.getWorstStepResult().status ===
                messages.TestStepResultStatus.FAILED && moreAttemptsRemaining
          }
          return await this.runHook(
            findHookDefinition(testStep.hookId, this.supportCodeLibrary),
            hookParameter,
            !didWeRunStepsYet
          )
        } else {
          const pickleStep = this.pickle.steps.find(
            (pickleStep) => pickleStep.id === testStep.pickleStepId
          )
          const testStepResult = await this.runStep(pickleStep, testStep)
          didWeRunStepsYet = true
          error = testStepResult.error
          return testStepResult.result
        }
      })
    }

    const willBeRetried =
      this.getWorstStepResult().status ===
        messages.TestStepResultStatus.FAILED && moreAttemptsRemaining
    const testCaseFinished: messages.Envelope = {
      testCaseFinished: {
        testCaseStartedId: this.currentTestCaseStartedId,
        timestamp: timestamp(),
        willBeRetried,
      },
    }
    this.eventBroadcaster.emit('envelope', testCaseFinished)

    return willBeRetried
  }

  async runHook(
    hookDefinition: TestCaseHookDefinition,
    hookParameter: ITestCaseHookParameter,
    isBeforeHook: boolean
  ): Promise<messages.TestStepResult> {
    if (this.shouldSkipHook(isBeforeHook)) {
      return {
        status: messages.TestStepResultStatus.SKIPPED,
        duration: messages.TimeConversion.millisecondsToDuration(0),
      }
    }
    const { result } = await this.invokeStep(
      null,
      hookDefinition,
      hookParameter
    )
    return result
  }

  async runStepHooks(
    stepHooks: TestStepHookDefinition[],
    pickleStep: messages.PickleStep,
    stepResult?: RunStepResult
  ): Promise<messages.TestStepResult[]> {
    const stepHooksResult = []
    const hookParameter: ITestStepHookParameter = {
      gherkinDocument: this.gherkinDocument,
      pickle: this.pickle,
      pickleStep,
      testCaseStartedId: this.currentTestCaseStartedId,
      testStepId: this.currentTestStepId,
      result: stepResult?.result,
      error: stepResult?.error,
    }
    for (const stepHookDefinition of stepHooks) {
      const { result } = await this.invokeStep(
        null,
        stepHookDefinition,
        hookParameter
      )
      stepHooksResult.push(result)
    }
    return stepHooksResult
  }

  async runStep(
    pickleStep: messages.PickleStep,
    testStep: messages.TestStep
  ): Promise<RunStepResult> {
    const stepDefinitions = testStep.stepDefinitionIds.map(
      (stepDefinitionId) => {
        return findStepDefinition(stepDefinitionId, this.supportCodeLibrary)
      }
    )
    if (stepDefinitions.length === 0) {
      this.eventBroadcaster.emit('envelope', {
        suggestion: makeSuggestion({
          newId: this.newId,
          snippetBuilder: this.snippetBuilder,
          pickleStep,
        }),
      } satisfies Envelope)
      return {
        result: {
          status: messages.TestStepResultStatus.UNDEFINED,
          duration: messages.TimeConversion.millisecondsToDuration(0),
        },
      }
    } else if (stepDefinitions.length > 1) {
      return {
        result: {
          message: getAmbiguousStepException(stepDefinitions),
          status: messages.TestStepResultStatus.AMBIGUOUS,
          duration: messages.TimeConversion.millisecondsToDuration(0),
        },
      }
    } else if (this.isSkippingSteps()) {
      return {
        result: {
          status: messages.TestStepResultStatus.SKIPPED,
          duration: messages.TimeConversion.millisecondsToDuration(0),
        },
      }
    }

    let stepResult
    let error
    let stepResults = await this.runStepHooks(
      this.getBeforeStepHookDefinitions(),
      pickleStep
    )
    if (
      getWorstTestStepResult(stepResults).status !==
      messages.TestStepResultStatus.FAILED
    ) {
      stepResult = await this.invokeStep(pickleStep, stepDefinitions[0])
      stepResults.push(stepResult.result)
      error = stepResult.error
    }
    const afterStepHookResults = await this.runStepHooks(
      this.getAfterStepHookDefinitions(),
      pickleStep,
      stepResult
    )
    stepResults = stepResults.concat(afterStepHookResults)

    const finalStepResult = getWorstTestStepResult(stepResults)
    let finalDuration = messages.TimeConversion.millisecondsToDuration(0)
    for (const result of stepResults) {
      finalDuration = messages.TimeConversion.addDurations(
        finalDuration,
        result.duration
      )
    }
    finalStepResult.duration = finalDuration
    return {
      result: finalStepResult,
      error,
    }
  }
}

function findHookDefinition(
  id: string,
  supportCodeLibrary: SupportCodeLibrary
): TestCaseHookDefinition {
  return [
    ...supportCodeLibrary.beforeTestCaseHookDefinitions,
    ...supportCodeLibrary.afterTestCaseHookDefinitions,
  ].find((definition) => definition.id === id)
}

function findStepDefinition(
  id: string,
  supportCodeLibrary: SupportCodeLibrary
): StepDefinition {
  return supportCodeLibrary.stepDefinitions.find(
    (definition) => definition.id === id
  )
}
