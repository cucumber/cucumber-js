import type { EventEmitter } from 'node:events'
import {
  type Envelope,
  type GherkinDocument,
  getWorstTestStepResult,
  type IdGenerator,
  type Pickle,
  type PickleStep,
  type TestCase,
  type TestStep,
  type TestStepResult,
  TestStepResultStatus,
  TimeConversion,
} from '@cucumber/messages'
import type { JsonObject } from 'type-fest'
import type StepDefinitionSnippetBuilder from '../formatter/step_definition_snippet_builder'
import type { IDefinition } from '../models/definition'
import type StepDefinition from '../models/step_definition'
import type TestCaseHookDefinition from '../models/test_case_hook_definition'
import type TestStepHookDefinition from '../models/test_step_hook_definition'
import type {
  ITestCaseHookParameter,
  ITestStepHookParameter,
  SupportCodeLibrary,
} from '../support_code_library_builder/types'
import type { IWorldOptions } from '../support_code_library_builder/world'
import { doesHaveValue, doesNotHaveValue } from '../value_checker'
import AttachmentManager from './attachment_manager'
import { willBeRetried } from './attempt_manager'
import { makeSuggestion } from './make_suggestion'
import StepRunner, { type RunStepResult } from './step_runner'
import { timestamp } from './stopwatch'

export interface INewTestCaseRunnerOptions {
  workerId?: string
  eventBroadcaster: EventEmitter
  gherkinDocument: GherkinDocument
  newId: IdGenerator.NewId
  pickle: Pickle
  testCase: TestCase
  attempt: number
  moreAttemptsRemaining: boolean
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
  private readonly gherkinDocument: GherkinDocument
  private readonly newId: IdGenerator.NewId
  private readonly pickle: Pickle
  private readonly testCase: TestCase
  private readonly attempt: number
  private readonly moreAttemptsRemaining: boolean
  private readonly skip: boolean
  private readonly filterStackTraces: boolean
  private readonly supportCodeLibrary: SupportCodeLibrary
  private readonly snippetBuilder: StepDefinitionSnippetBuilder
  private testStepResults: TestStepResult[]
  // biome-ignore lint/suspicious/noExplicitAny: the world is an instance of a user-supplied constructor, so it really can be anything
  private world: any
  private readonly worldParameters: JsonObject

  constructor({
    workerId,
    eventBroadcaster,
    gherkinDocument,
    newId,
    pickle,
    testCase,
    attempt,
    moreAttemptsRemaining,
    skip,
    filterStackTraces,
    supportCodeLibrary,
    worldParameters,
    snippetBuilder,
  }: INewTestCaseRunnerOptions) {
    this.workerId = workerId
    this.attachmentManager = new AttachmentManager(({ data, media, fileName }) => {
      if (doesNotHaveValue(this.currentTestStepId)) {
        throw new Error(
          'Cannot attach when a step/hook is not running. Ensure your step/hook waits for the attach to finish.'
        )
      }
      const attachment: Envelope = {
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
    })
    this.eventBroadcaster = eventBroadcaster
    this.gherkinDocument = gherkinDocument
    this.attempt = attempt
    this.moreAttemptsRemaining = moreAttemptsRemaining
    this.newId = newId
    this.pickle = pickle
    this.testCase = testCase
    this.skip = skip
    this.filterStackTraces = filterStackTraces
    this.supportCodeLibrary = supportCodeLibrary
    this.worldParameters = worldParameters
    this.snippetBuilder = snippetBuilder
    this.world = new this.supportCodeLibrary.World({
      attach: this.attachmentManager.create.bind(this.attachmentManager),
      log: this.attachmentManager.log.bind(this.attachmentManager),
      link: this.attachmentManager.link.bind(this.attachmentManager),
      parameters: structuredClone(this.worldParameters),
    } satisfies IWorldOptions)
    this.testStepResults = []
  }

  getBeforeStepHookDefinitions(): TestStepHookDefinition[] {
    return this.supportCodeLibrary.beforeTestStepHookDefinitions.filter((hookDefinition) =>
      hookDefinition.appliesToTestCase(this.pickle)
    )
  }

  getAfterStepHookDefinitions(): TestStepHookDefinition[] {
    return this.supportCodeLibrary.afterTestStepHookDefinitions
      .slice(0)
      .reverse()
      .filter((hookDefinition) => hookDefinition.appliesToTestCase(this.pickle))
  }

  getWorstStepResult(): TestStepResult {
    if (this.testStepResults.length === 0) {
      return {
        status: this.skip ? TestStepResultStatus.SKIPPED : TestStepResultStatus.PASSED,
        duration: TimeConversion.millisecondsToDuration(0),
      }
    }
    return getWorstTestStepResult(this.testStepResults)
  }

  async invokeStep(
    step: PickleStep,
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
    return this.getWorstStepResult().status !== TestStepResultStatus.PASSED
  }

  isExplicitlySkipped(): boolean {
    return !this.skip && this.getWorstStepResult().status === TestStepResultStatus.SKIPPED
  }

  shouldSkipHook(isBeforeHook: boolean): boolean {
    return this.skip || (this.isSkippingSteps() && isBeforeHook)
  }

  async aroundTestStep(
    testStepId: string,
    runStepFn: () => Promise<TestStepResult>
  ): Promise<void> {
    const testStepStarted: Envelope = {
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
    const testStepFinished: Envelope = {
      testStepFinished: {
        testCaseStartedId: this.currentTestCaseStartedId,
        testStepId,
        testStepResult,
        timestamp: timestamp(),
      },
    }
    this.eventBroadcaster.emit('envelope', testStepFinished)
  }

  async run(): Promise<TestStepResultStatus> {
    this.currentTestCaseStartedId = this.newId()
    const testCaseStarted: Envelope = {
      testCaseStarted: {
        attempt: this.attempt,
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
    let error: unknown = false
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
            hookParameter.willBeRetried = willBeRetried(
              this.getWorstStepResult().status,
              this.moreAttemptsRemaining
            )
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

    const testCaseFinished: Envelope = {
      testCaseFinished: {
        testCaseStartedId: this.currentTestCaseStartedId,
        timestamp: timestamp(),
        willBeRetried: willBeRetried(this.getWorstStepResult().status, this.moreAttemptsRemaining),
      },
    }
    this.eventBroadcaster.emit('envelope', testCaseFinished)

    return this.getWorstStepResult().status
  }

  async runHook(
    hookDefinition: TestCaseHookDefinition,
    hookParameter: ITestCaseHookParameter,
    isBeforeHook: boolean
  ): Promise<TestStepResult> {
    if (this.shouldSkipHook(isBeforeHook)) {
      return {
        status: TestStepResultStatus.SKIPPED,
        duration: TimeConversion.millisecondsToDuration(0),
      }
    }
    const { result } = await this.invokeStep(null, hookDefinition, hookParameter)
    return result
  }

  async runStepHooks(
    stepHooks: TestStepHookDefinition[],
    pickleStep: PickleStep,
    stepResult?: RunStepResult
  ): Promise<TestStepResult[]> {
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
      const { result } = await this.invokeStep(null, stepHookDefinition, hookParameter)
      stepHooksResult.push(result)
    }
    return stepHooksResult
  }

  async runStep(pickleStep: PickleStep, testStep: TestStep): Promise<RunStepResult> {
    if (this.isExplicitlySkipped()) {
      return {
        result: {
          status: TestStepResultStatus.SKIPPED,
          duration: TimeConversion.millisecondsToDuration(0),
        },
      }
    }
    const stepDefinitions = testStep.stepDefinitionIds.map((stepDefinitionId) => {
      return findStepDefinition(stepDefinitionId, this.supportCodeLibrary)
    })
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
          status: TestStepResultStatus.UNDEFINED,
          duration: TimeConversion.millisecondsToDuration(0),
        },
      }
    } else if (stepDefinitions.length > 1) {
      return {
        result: {
          status: TestStepResultStatus.AMBIGUOUS,
          duration: TimeConversion.millisecondsToDuration(0),
        },
      }
    } else if (this.isSkippingSteps()) {
      return {
        result: {
          status: TestStepResultStatus.SKIPPED,
          duration: TimeConversion.millisecondsToDuration(0),
        },
      }
    }

    let stepResult: RunStepResult
    let error: unknown
    let stepResults = await this.runStepHooks(this.getBeforeStepHookDefinitions(), pickleStep)
    if (getWorstTestStepResult(stepResults).status !== TestStepResultStatus.FAILED) {
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
    let finalDuration = TimeConversion.millisecondsToDuration(0)
    for (const result of stepResults) {
      finalDuration = TimeConversion.addDurations(finalDuration, result.duration)
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

function findStepDefinition(id: string, supportCodeLibrary: SupportCodeLibrary): StepDefinition {
  return supportCodeLibrary.stepDefinitions.find((definition) => definition.id === id)
}
