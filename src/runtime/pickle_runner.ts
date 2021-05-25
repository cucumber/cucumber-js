import { clone } from 'lodash'
import { getAmbiguousStepException } from './helpers'
import AttachmentManager from './attachment_manager'
import StepRunner from './step_runner'
import { IdGenerator, getWorstTestStepResult } from '@cucumber/messages'
import * as messages from '@cucumber/messages'
import { EventEmitter } from 'events'
import {
  ISupportCodeLibrary,
  ITestCaseHookParameter,
  ITestStepHookParameter,
} from '../support_code_library_builder/types'
import TestCaseHookDefinition from '../models/test_case_hook_definition'
import TestStepHookDefinition from '../models/test_step_hook_definition'
import StepDefinition from '../models/step_definition'
import { IDefinition } from '../models/definition'
import { doesHaveValue, doesNotHaveValue } from '../value_checker'
import { ITestRunStopwatch } from './stopwatch'
import { Group } from '@cucumber/cucumber-expressions'

interface ITestStep {
  id: string
  isBeforeHook?: boolean
  isHook: boolean
  hookDefinition?: TestCaseHookDefinition
  stepHookDefinition?: TestStepHookDefinition
  pickleStep?: messages.PickleStep
  stepDefinitions?: StepDefinition[]
}

export interface INewPickleRunnerOptions {
  eventBroadcaster: EventEmitter
  stopwatch: ITestRunStopwatch
  gherkinDocument: messages.GherkinDocument
  newId: IdGenerator.NewId
  pickle: messages.Pickle
  retries: number
  skip: boolean
  supportCodeLibrary: ISupportCodeLibrary
  worldParameters: any
}

export default class PickleRunner {
  private readonly attachmentManager: AttachmentManager
  private currentTestCaseStartedId: string
  private currentTestStepId: string
  private readonly eventBroadcaster: EventEmitter
  private readonly stopwatch: ITestRunStopwatch
  private readonly gherkinDocument: messages.GherkinDocument
  private readonly newId: IdGenerator.NewId
  private readonly pickle: messages.Pickle
  private readonly maxAttempts: number
  private readonly skip: boolean
  private readonly supportCodeLibrary: ISupportCodeLibrary
  private readonly testCaseId: string
  private readonly testSteps: ITestStep[]
  private testStepResults: messages.TestStepResult[]
  private world: any
  private readonly worldParameters: any

  constructor({
    eventBroadcaster,
    stopwatch,
    gherkinDocument,
    newId,
    pickle,
    retries = 0,
    skip,
    supportCodeLibrary,
    worldParameters,
  }: INewPickleRunnerOptions) {
    this.attachmentManager = new AttachmentManager(({ data, media }) => {
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
          testCaseStartedId: this.currentTestCaseStartedId,
          testStepId: this.currentTestStepId,
        },
      }
      this.eventBroadcaster.emit('envelope', attachment)
    })
    this.eventBroadcaster = eventBroadcaster
    this.stopwatch = stopwatch
    this.gherkinDocument = gherkinDocument
    this.maxAttempts = 1 + (skip ? 0 : retries)
    this.newId = newId
    this.pickle = pickle
    this.skip = skip
    this.supportCodeLibrary = supportCodeLibrary
    this.worldParameters = worldParameters
    this.testCaseId = this.newId()
    this.testSteps = this.buildTestSteps()
    this.resetTestProgressData()
  }

  resetTestProgressData(): void {
    this.world = new this.supportCodeLibrary.World({
      attach: this.attachmentManager.create.bind(this.attachmentManager),
      log: this.attachmentManager.log.bind(this.attachmentManager),
      parameters: this.worldParameters,
    })
    this.testStepResults = []
  }

  buildTestSteps(): ITestStep[] {
    const testSteps: ITestStep[] = []
    this.getBeforeHookDefinitions().forEach((hookDefinition) => {
      testSteps.push({
        id: this.newId(),
        hookDefinition,
        isHook: true,
        isBeforeHook: true,
      })
    })
    this.pickle.steps.forEach((pickleStep) => {
      const stepDefinitions = this.getStepDefinitions(pickleStep)
      testSteps.push({
        id: this.newId(),
        pickleStep,
        stepDefinitions,
        isHook: false,
      })
    })
    this.getAfterHookDefinitions().forEach((hookDefinition) => {
      testSteps.push({
        id: this.newId(),
        hookDefinition,
        isHook: true,
      })
    })
    return testSteps
  }

  emitTestCase(): void {
    const testCase = {
      pickleId: this.pickle.id,
      id: this.testCaseId,
      testSteps: this.testSteps.map((testStep) => {
        if (testStep.isHook) {
          return {
            id: testStep.id,
            hookId: testStep.hookDefinition.id,
          }
        } else {
          return {
            id: testStep.id,
            pickleStepId: testStep.pickleStep.id,
            stepDefinitionIds: testStep.stepDefinitions.map((x) => x.id),
            stepMatchArgumentsLists: testStep.stepDefinitions.map((x) => {
              const result = x.expression.match(testStep.pickleStep.text)
              return {
                stepMatchArguments: result.map((arg) => {
                  return {
                    group: this.mapArgumentGroup(arg.group),
                    parameterTypeName: arg.parameterType.name,
                  }
                }),
              }
            }),
          }
        }
      }),
    }
    const envelope: messages.Envelope = { testCase }
    this.eventBroadcaster.emit('envelope', envelope)
  }

  private mapArgumentGroup(group: Group): messages.Group {
    return {
      start: group.start,
      value: group.value,
      children: doesHaveValue(group.children)
        ? group.children.map((child) => this.mapArgumentGroup(child))
        : undefined,
    }
  }

  getAfterHookDefinitions(): TestCaseHookDefinition[] {
    return clone(this.supportCodeLibrary.afterTestCaseHookDefinitions)
      .reverse()
      .filter((hookDefinition) => hookDefinition.appliesToTestCase(this.pickle))
  }

  getBeforeHookDefinitions(): TestCaseHookDefinition[] {
    return this.supportCodeLibrary.beforeTestCaseHookDefinitions.filter(
      (hookDefinition) => hookDefinition.appliesToTestCase(this.pickle)
    )
  }

  getBeforeStepHookDefinitions(): TestStepHookDefinition[] {
    return this.supportCodeLibrary.beforeTestStepHookDefinitions.filter(
      (hookDefinition) => hookDefinition.appliesToTestCase(this.pickle)
    )
  }

  getAfterStepHookDefinitions(): TestStepHookDefinition[] {
    return clone(this.supportCodeLibrary.afterTestStepHookDefinitions)
      .reverse()
      .filter((hookDefinition) => hookDefinition.appliesToTestCase(this.pickle))
  }

  getStepDefinitions(pickleStep: messages.PickleStep): StepDefinition[] {
    return this.supportCodeLibrary.stepDefinitions.filter((stepDefinition) =>
      stepDefinition.matchesStepName(pickleStep.text)
    )
  }

  getWorstStepResult(): messages.TestStepResult {
    if (this.testStepResults.length === 0) {
      return {
        status: this.skip
          ? messages.TestStepResultStatus.SKIPPED
          : messages.TestStepResultStatus.PASSED,
        willBeRetried: false,
        duration: messages.TimeConversion.millisecondsToDuration(0),
      }
    }
    return getWorstTestStepResult(this.testStepResults)
  }

  async invokeStep(
    step: messages.PickleStep,
    stepDefinition: IDefinition,
    hookParameter?: any
  ): Promise<messages.TestStepResult> {
    return await StepRunner.run({
      defaultTimeout: this.supportCodeLibrary.defaultTimeout,
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
    attempt: number,
    runStepFn: () => Promise<messages.TestStepResult>
  ): Promise<void> {
    const testStepStarted: messages.Envelope = {
      testStepStarted: {
        testCaseStartedId: this.currentTestCaseStartedId,
        testStepId,
        timestamp: this.stopwatch.timestamp(),
      },
    }
    this.eventBroadcaster.emit('envelope', testStepStarted)
    this.currentTestStepId = testStepId
    const testStepResult = await runStepFn()
    this.currentTestStepId = null
    this.testStepResults.push(testStepResult)
    if (
      testStepResult.status === messages.TestStepResultStatus.FAILED &&
      attempt + 1 < this.maxAttempts
    ) {
      /*
      TODO dont rely on `testStepResult.willBeRetried`, it will be moved or removed
      see https://github.com/cucumber/cucumber/issues/902
       */
      testStepResult.willBeRetried = true
    }
    const testStepFinished: messages.Envelope = {
      testStepFinished: {
        testCaseStartedId: this.currentTestCaseStartedId,
        testStepId,
        testStepResult,
        timestamp: this.stopwatch.timestamp(),
      },
    }
    this.eventBroadcaster.emit('envelope', testStepFinished)
  }

  async run(): Promise<messages.TestStepResultStatus> {
    this.emitTestCase()
    for (let attempt = 0; attempt < this.maxAttempts; attempt++) {
      this.currentTestCaseStartedId = this.newId()
      const testCaseStarted: messages.Envelope = {
        testCaseStarted: {
          attempt,
          testCaseId: this.testCaseId,
          id: this.currentTestCaseStartedId,
          timestamp: this.stopwatch.timestamp(),
        },
      }
      this.eventBroadcaster.emit('envelope', testCaseStarted)
      for (const testStep of this.testSteps) {
        await this.aroundTestStep(testStep.id, attempt, async () => {
          if (testStep.isHook) {
            const hookParameter: ITestCaseHookParameter = {
              gherkinDocument: this.gherkinDocument,
              pickle: this.pickle,
              testCaseStartedId: this.currentTestCaseStartedId,
            }
            if (!testStep.isBeforeHook) {
              hookParameter.result = this.getWorstStepResult()
            }
            return await this.runHook(
              testStep.hookDefinition,
              hookParameter,
              testStep.isBeforeHook
            )
          } else {
            return await this.runStep(testStep)
          }
        })
      }
      const testCaseFinished: messages.Envelope = {
        testCaseFinished: {
          testCaseStartedId: this.currentTestCaseStartedId,
          timestamp: this.stopwatch.timestamp(),
        },
      }
      this.eventBroadcaster.emit('envelope', testCaseFinished)
      if (!this.getWorstStepResult().willBeRetried) {
        break
      }
      this.resetTestProgressData()
    }
    return this.getWorstStepResult().status
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
        willBeRetried: false,
      }
    }
    return await this.invokeStep(null, hookDefinition, hookParameter)
  }

  async runStepHooks(
    stepHooks: TestStepHookDefinition[],
    stepResult?: messages.TestStepResult
  ): Promise<messages.TestStepResult[]> {
    const stepHooksResult = []
    const hookParameter: ITestStepHookParameter = {
      gherkinDocument: this.gherkinDocument,
      pickle: this.pickle,
      testCaseStartedId: this.currentTestCaseStartedId,
      testStepId: this.currentTestStepId,
      result: stepResult,
    }
    for (const stepHookDefinition of stepHooks) {
      stepHooksResult.push(
        await this.invokeStep(null, stepHookDefinition, hookParameter)
      )
    }
    return stepHooksResult
  }

  async runStep(testStep: ITestStep): Promise<messages.TestStepResult> {
    if (testStep.stepDefinitions.length === 0) {
      return {
        status: messages.TestStepResultStatus.UNDEFINED,
        duration: messages.TimeConversion.millisecondsToDuration(0),
        willBeRetried: false,
      }
    } else if (testStep.stepDefinitions.length > 1) {
      return {
        message: getAmbiguousStepException(testStep.stepDefinitions),
        status: messages.TestStepResultStatus.AMBIGUOUS,
        duration: messages.TimeConversion.millisecondsToDuration(0),
        willBeRetried: false,
      }
    } else if (this.isSkippingSteps()) {
      return {
        status: messages.TestStepResultStatus.SKIPPED,
        duration: messages.TimeConversion.millisecondsToDuration(0),
        willBeRetried: false,
      }
    }

    let stepResult
    let stepResults = await this.runStepHooks(
      this.getBeforeStepHookDefinitions()
    )
    if (
      getWorstTestStepResult(stepResults).status !==
      messages.TestStepResultStatus.FAILED
    ) {
      stepResult = await this.invokeStep(
        testStep.pickleStep,
        testStep.stepDefinitions[0]
      )
      stepResults.push(stepResult)
    }
    const afterStepHookResults = await this.runStepHooks(
      this.getAfterStepHookDefinitions(),
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
    return finalStepResult
  }
}
