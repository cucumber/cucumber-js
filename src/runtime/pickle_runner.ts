import { clone } from 'lodash'
import { getAmbiguousStepException } from './helpers'
import AttachmentManager from './attachment_manager'
import StepRunner from './step_runner'
import { IdGenerator, messages } from '@cucumber/messages'
import { addDurations, getZeroDuration } from '../time'
import { EventEmitter } from 'events'
import {
  ISupportCodeLibrary,
  ITestCaseHookParameter,
  ITestStepHookParameter,
} from '../support_code_library_builder/types'
import TestCaseHookDefinition from '../models/test_case_hook_definition'
import TestStepHookDefinition from '../models/test_step_hook_definition'
import { IDefinition } from '../models/definition'
import { doesNotHaveValue } from '../value_checker'
import { ITestRunStopwatch } from './stopwatch'
import { Query } from '@cucumber/query'
import { ITestStep } from './assemble_test_cases'

const { Status } = messages.TestStepFinished.TestStepResult

export interface INewPickleRunnerOptions {
  eventBroadcaster: EventEmitter
  stopwatch: ITestRunStopwatch
  gherkinDocument: messages.IGherkinDocument
  newId: IdGenerator.NewId
  pickle: messages.IPickle
  testCase: messages.ITestCase
  testSteps: ITestStep[]
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
  private readonly gherkinDocument: messages.IGherkinDocument
  private readonly newId: IdGenerator.NewId
  private readonly pickle: messages.IPickle
  private readonly testCase: messages.ITestCase
  private readonly maxAttempts: number
  private readonly skip: boolean
  private readonly supportCodeLibrary: ISupportCodeLibrary
  private readonly testSteps: ITestStep[]
  private testStepResults: messages.TestStepFinished.ITestStepResult[]
  private world: any
  private readonly worldParameters: any

  constructor({
    eventBroadcaster,
    stopwatch,
    gherkinDocument,
    newId,
    pickle,
    testCase,
    testSteps,
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
      this.eventBroadcaster.emit(
        'envelope',
        messages.Envelope.fromObject({
          attachment: {
            body: data,
            contentEncoding: media.encoding,
            mediaType: media.contentType,
            testCaseStartedId: this.currentTestCaseStartedId,
            testStepId: this.currentTestStepId,
          },
        })
      )
    })
    this.eventBroadcaster = eventBroadcaster
    this.stopwatch = stopwatch
    this.gherkinDocument = gherkinDocument
    this.maxAttempts = 1 + (skip ? 0 : retries)
    this.newId = newId
    this.pickle = pickle
    this.testCase = testCase
    this.skip = skip
    this.supportCodeLibrary = supportCodeLibrary
    this.worldParameters = worldParameters
    this.testSteps = testSteps
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

  getWorstStepResult(): messages.TestStepFinished.ITestStepResult {
    if (this.testStepResults.length === 0) {
      return messages.TestStepFinished.TestStepResult.fromObject({
        status: this.skip ? Status.SKIPPED : Status.PASSED,
      })
    }
    return new Query().getWorstTestStepResult(this.testStepResults)
  }

  async invokeStep(
    step: messages.Pickle.IPickleStep,
    stepDefinition: IDefinition,
    hookParameter?: any
  ): Promise<messages.TestStepFinished.ITestStepResult> {
    return await StepRunner.run({
      defaultTimeout: this.supportCodeLibrary.defaultTimeout,
      hookParameter,
      step,
      stepDefinition,
      world: this.world,
    })
  }

  isSkippingSteps(): boolean {
    return this.getWorstStepResult().status !== Status.PASSED
  }

  shouldSkipHook(isBeforeHook: boolean): boolean {
    return this.skip || (this.isSkippingSteps() && isBeforeHook)
  }

  async aroundTestStep(
    testStepId: string,
    attempt: number,
    runStepFn: () => Promise<messages.TestStepFinished.ITestStepResult>
  ): Promise<void> {
    this.eventBroadcaster.emit(
      'envelope',
      messages.Envelope.fromObject({
        testStepStarted: {
          testCaseStartedId: this.currentTestCaseStartedId,
          testStepId,
          timestamp: this.stopwatch.timestamp(),
        },
      })
    )
    this.currentTestStepId = testStepId
    const testStepResult = await runStepFn()
    this.currentTestStepId = null
    this.testStepResults.push(testStepResult)
    if (
      testStepResult.status === Status.FAILED &&
      attempt + 1 < this.maxAttempts
    ) {
      /*
      TODO dont rely on `testStepResult.willBeRetried`, it will be moved or removed
      see https://github.com/cucumber/cucumber/issues/902
       */
      testStepResult.willBeRetried = true
    }
    this.eventBroadcaster.emit(
      'envelope',
      messages.Envelope.fromObject({
        testStepFinished: {
          testCaseStartedId: this.currentTestCaseStartedId,
          testStepId,
          testStepResult,
          timestamp: this.stopwatch.timestamp(),
        },
      })
    )
  }

  async run(): Promise<messages.TestStepFinished.TestStepResult.Status> {
    for (let attempt = 0; attempt < this.maxAttempts; attempt++) {
      this.currentTestCaseStartedId = this.newId()
      this.eventBroadcaster.emit(
        'envelope',
        messages.Envelope.fromObject({
          testCaseStarted: {
            attempt,
            testCaseId: this.testCase.id,
            id: this.currentTestCaseStartedId,
            timestamp: this.stopwatch.timestamp(),
          },
        })
      )
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
      this.eventBroadcaster.emit(
        'envelope',
        messages.Envelope.fromObject({
          testCaseFinished: {
            testCaseStartedId: this.currentTestCaseStartedId,
            timestamp: this.stopwatch.timestamp(),
          },
        })
      )
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
  ): Promise<messages.TestStepFinished.ITestStepResult> {
    if (this.shouldSkipHook(isBeforeHook)) {
      return messages.TestStepFinished.TestStepResult.fromObject({
        status: Status.SKIPPED,
      })
    }
    return await this.invokeStep(null, hookDefinition, hookParameter)
  }

  async runStepHooks(
    stepHooks: TestStepHookDefinition[],
    stepResult?: messages.TestStepFinished.ITestStepResult
  ): Promise<messages.TestStepFinished.ITestStepResult[]> {
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

  async runStep(
    testStep: ITestStep
  ): Promise<messages.TestStepFinished.ITestStepResult> {
    if (testStep.stepDefinitions.length === 0) {
      return messages.TestStepFinished.TestStepResult.fromObject({
        status: Status.UNDEFINED,
        duration: {
          seconds: '0',
          nanos: 0,
        },
      })
    } else if (testStep.stepDefinitions.length > 1) {
      return messages.TestStepFinished.TestStepResult.fromObject({
        message: getAmbiguousStepException(testStep.stepDefinitions),
        status: Status.AMBIGUOUS,
        duration: {
          seconds: '0',
          nanos: 0,
        },
      })
    } else if (this.isSkippingSteps()) {
      return messages.TestStepFinished.TestStepResult.fromObject({
        status: Status.SKIPPED,
        duration: {
          seconds: '0',
          nanos: 0,
        },
      })
    }

    let stepResult
    let stepResults = await this.runStepHooks(
      this.getBeforeStepHookDefinitions(),
      stepResult
    )
    if (
      new Query().getWorstTestStepResult(stepResults).status !== Status.FAILED
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

    const finalStepResult = new Query().getWorstTestStepResult(stepResults)
    let finalDuration = getZeroDuration()
    for (const result of stepResults) {
      finalDuration = addDurations(finalDuration, result.duration)
    }
    finalStepResult.duration = finalDuration
    return finalStepResult
  }
}
