import _ from 'lodash'
import { getAmbiguousStepException } from './helpers'
import AttachmentManager from './attachment_manager'
import StepRunner from './step_runner'
import { messages } from 'cucumber-messages'
import { addDurations, getZeroDuration } from '../time'

const { Status } = messages.TestResult

export default class PickleRunner {
  constructor({
    eventBroadcaster,
    gherkinDocument,
    newId,
    pickle,
    retries = 0,
    skip,
    supportCodeLibrary,
    worldParameters,
  }) {
    this.attachmentManager = new AttachmentManager(({ data, media }) => {
      if (!this.currentTestStepId) {
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

  resetTestProgressData() {
    this.world = new this.supportCodeLibrary.World({
      attach: ::this.attachmentManager.create,
      parameters: this.worldParameters,
    })
    this.result = messages.TestResult.fromObject({
      duration: getZeroDuration(),
      status: this.skip ? Status.SKIPPED : Status.PASSED,
    })
  }

  buildTestSteps() {
    const steps = []
    this.getBeforeHookDefinitions().forEach(hookDefinition => {
      steps.push({
        id: this.newId(),
        hookDefinition,
        isHook: true,
        isBeforeHook: true,
      })
    })
    this.pickle.steps.forEach(pickleStep => {
      const stepDefinitions = this.getStepDefinitions(pickleStep)
      steps.push({
        id: this.newId(),
        pickleStep,
        stepDefinitions,
        isHook: false,
      })
    })
    this.getAfterHookDefinitions().forEach(hookDefinition => {
      steps.push({
        id: this.newId(),
        hookDefinition,
        isHook: true,
        isAfterHook: false,
      })
    })
    return steps
  }

  emitTestCase() {
    const testCase = {
      pickleId: this.pickle.id,
      id: this.testCaseId,
      testSteps: this.testSteps.map(testStep => {
        if (testStep.isHook) {
          return {
            id: testStep.id,
            hookId: testStep.hookDefinition.id,
          }
        } else {
          return {
            id: testStep.id,
            pickleStepId: testStep.pickleStep.id,
            stepDefinitionIds: testStep.stepDefinitions.map(x => x.id),
          }
        }
      }),
    }
    this.eventBroadcaster.emit(
      'envelope',
      messages.Envelope.fromObject({ testCase })
    )
  }

  getAfterHookDefinitions() {
    return this.supportCodeLibrary.afterTestCaseHookDefinitions.filter(
      hookDefinition => hookDefinition.appliesToTestCase(this.pickle)
    )
  }

  getBeforeHookDefinitions() {
    return this.supportCodeLibrary.beforeTestCaseHookDefinitions.filter(
      hookDefinition => hookDefinition.appliesToTestCase(this.pickle)
    )
  }

  getStepDefinitions(step) {
    return this.supportCodeLibrary.stepDefinitions.filter(stepDefinition =>
      stepDefinition.matchesStepName(step.text)
    )
  }

  invokeStep(step, stepDefinition, hookParameter) {
    return StepRunner.run({
      defaultTimeout: this.supportCodeLibrary.defaultTimeout,
      hookParameter,
      step,
      stepDefinition,
      world: this.world,
    })
  }

  isSkippingSteps() {
    return this.result.status !== Status.PASSED
  }

  shouldSkipHook(isBeforeHook) {
    return this.skip || (this.isSkippingSteps() && isBeforeHook)
  }

  shouldUpdateStatus(testStepResult) {
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

  async aroundTestStep(testStepId, attempt, runStepFn) {
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
    if (testStepResult.message) {
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

  async run() {
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
            const hookParameter = {
              gherkinDocument: this.gherkinDocument,
              pickle: this.pickle,
            }
            if (!testStep.isBeforeHook) {
              hookParameter.result = this.result
            }
            return this.runHook(
              testStep.hookDefinition,
              hookParameter,
              testStep.isBeforeHook
            )
          } else {
            return this.runStep(testStep)
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

  async runHook(hookDefinition, hookParameter, isBeforeHook) {
    if (this.shouldSkipHook(isBeforeHook)) {
      return messages.TestResult.fromObject({ status: Status.SKIPPED })
    }
    return this.invokeStep(null, hookDefinition, hookParameter)
  }

  async runStep(testStep) {
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
    return this.invokeStep(testStep.pickleStep, testStep.stepDefinitions[0])
  }
}
