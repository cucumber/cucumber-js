import _ from 'lodash'
import { getAmbiguousStepException } from './helpers'
import AttachmentManager from './attachment_manager'
import StepRunner from './step_runner'
import { messages, IdGenerator } from 'cucumber-messages'
import { addDurations, getZeroDuration } from '../time'
import { EventEmitter } from 'events'
import {
  ISupportCodeLibrary,
  ITestCaseHookParameter,
} from '../support_code_library_builder/types'
import TestCaseHookDefinition from '../models/test_case_hook_definition'
import StepDefinition from '../models/step_definition'
import { IDefinition } from '../models/definition'
import { doesNotHaveValue } from '../value_checker'

const { Status } = messages.TestResult

interface ITestStep {
  id: string
  isBeforeHook?: boolean
  isHook: boolean
  hookDefinition?: TestCaseHookDefinition
  pickleStep?: messages.Pickle.IPickleStep
  stepDefinitions?: StepDefinition[]
}

export interface INewPickleRunnerOptions {
  eventBroadcaster: EventEmitter
  gherkinDocument: messages.IGherkinDocument
  newId: IdGenerator.NewId
  pickle: messages.IPickle
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
  private readonly gherkinDocument: messages.IGherkinDocument
  private readonly newId: IdGenerator.NewId
  private readonly pickle: messages.IPickle
  private readonly maxAttempts: number
  private result: messages.ITestResult
  private readonly skip: boolean
  private readonly supportCodeLibrary: ISupportCodeLibrary
  private readonly testCaseId: string
  private readonly testSteps: ITestStep[]
  private world: any
  private readonly worldParameters: any

  constructor({
    eventBroadcaster,
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
      this.eventBroadcaster.emit(
        'envelope',
        messages.Envelope.fromObject({
          attachment: {
            data,
            media,
            testCaseStartedId: this.currentTestCaseStartedId,
            testStepId: this.currentTestStepId,
          },
        })
      )
    })
    this.eventBroadcaster = eventBroadcaster
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
      parameters: this.worldParameters,
    })
    this.result = messages.TestResult.fromObject({
      duration: getZeroDuration(),
      status: this.skip ? Status.SKIPPED : Status.PASSED,
    })
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
          }
        }
      }),
    }
    this.eventBroadcaster.emit(
      'envelope',
      messages.Envelope.fromObject({ testCase })
    )
  }

  getAfterHookDefinitions(): TestCaseHookDefinition[] {
    return this.supportCodeLibrary.afterTestCaseHookDefinitions.filter(
      (hookDefinition) => hookDefinition.appliesToTestCase(this.pickle)
    )
  }

  getBeforeHookDefinitions(): TestCaseHookDefinition[] {
    return this.supportCodeLibrary.beforeTestCaseHookDefinitions.filter(
      (hookDefinition) => hookDefinition.appliesToTestCase(this.pickle)
    )
  }

  getStepDefinitions(
    pickleStep: messages.Pickle.IPickleStep
  ): StepDefinition[] {
    return this.supportCodeLibrary.stepDefinitions.filter((stepDefinition) =>
      stepDefinition.matchesStepName(pickleStep.text)
    )
  }

  async invokeStep(
    step: messages.Pickle.IPickleStep,
    stepDefinition: IDefinition,
    hookParameter?: any
  ): Promise<messages.ITestResult> {
    return await StepRunner.run({
      defaultTimeout: this.supportCodeLibrary.defaultTimeout,
      hookParameter,
      step,
      stepDefinition,
      world: this.world,
    })
  }

  isSkippingSteps(): boolean {
    return this.result.status !== Status.PASSED
  }

  shouldSkipHook(isBeforeHook: boolean): boolean {
    return this.skip || (this.isSkippingSteps() && isBeforeHook)
  }

  shouldUpdateStatus(testStepResult: messages.ITestResult): boolean {
    switch (testStepResult.status) {
      case Status.UNDEFINED:
      case Status.FAILED:
      case Status.AMBIGUOUS:
        return !_.some(
          [Status.FAILED, Status.AMBIGUOUS, Status.UNDEFINED],
          this.result.status
        )
      default:
        return this.result.status === Status.PASSED
    }
  }

  async aroundTestStep(
    testStepId: string,
    attempt: number,
    runStepFn: () => Promise<messages.ITestResult>
  ): Promise<void> {
    this.eventBroadcaster.emit(
      'envelope',
      messages.Envelope.fromObject({
        testStepStarted: {
          testCaseStartedId: this.currentTestCaseStartedId,
          testStepId,
        },
      })
    )
    this.currentTestStepId = testStepId
    const testStepResult = await runStepFn()
    this.currentTestStepId = null
    this.result.duration = addDurations(
      this.result.duration,
      testStepResult.duration
    )
    if (this.shouldUpdateStatus(testStepResult)) {
      this.result.status = testStepResult.status
    }
    if (
      this.result.status === Status.FAILED &&
      attempt + 1 < this.maxAttempts
    ) {
      this.result.willBeRetried = true
    }
    if (testStepResult.message !== '') {
      this.result.message = testStepResult.message
    }
    this.eventBroadcaster.emit(
      'envelope',
      messages.Envelope.fromObject({
        testStepFinished: {
          testCaseStartedId: this.currentTestCaseStartedId,
          testStepId,
          testResult: testStepResult,
        },
      })
    )
  }

  async run(): Promise<messages.ITestResult> {
    this.emitTestCase()
    for (let attempt = 0; attempt < this.maxAttempts; attempt++) {
      this.currentTestCaseStartedId = this.newId()
      this.eventBroadcaster.emit(
        'envelope',
        messages.Envelope.fromObject({
          testCaseStarted: {
            attempt,
            testCaseId: this.testCaseId,
            id: this.currentTestCaseStartedId,
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
              hookParameter.result = this.result
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
            testResult: this.result,
          },
        })
      )
      if (!this.result.willBeRetried) {
        break
      }
      this.resetTestProgressData()
    }
    return this.result
  }

  async runHook(
    hookDefinition: TestCaseHookDefinition,
    hookParameter: ITestCaseHookParameter,
    isBeforeHook: boolean
  ): Promise<messages.ITestResult> {
    if (this.shouldSkipHook(isBeforeHook)) {
      return messages.TestResult.fromObject({ status: Status.SKIPPED })
    }
    return await this.invokeStep(null, hookDefinition, hookParameter)
  }

  async runStep(testStep: ITestStep): Promise<messages.ITestResult> {
    if (testStep.stepDefinitions.length === 0) {
      return messages.TestResult.fromObject({ status: Status.UNDEFINED })
    } else if (testStep.stepDefinitions.length > 1) {
      return messages.TestResult.fromObject({
        message: getAmbiguousStepException(testStep.stepDefinitions),
        status: Status.AMBIGUOUS,
      })
    } else if (this.isSkippingSteps()) {
      return messages.TestResult.fromObject({ status: Status.SKIPPED })
    }
    return await this.invokeStep(
      testStep.pickleStep,
      testStep.stepDefinitions[0]
    )
  }
}
