import _ from 'lodash'
import { getAmbiguousStepException } from './helpers'
import AttachmentManager from './attachment_manager'
import StepRunner from './step_runner'
import uuidv4 from 'uuid/v4'
import { messages } from 'cucumber-messages'

const { Status } = messages.TestResult

export default class PickleRunner {
  constructor({
    eventBroadcaster,
    retries = 0,
    skip,
    pickle,
    supportCodeLibrary,
    worldParameters,
  }) {
    this.attachmentManager = new AttachmentManager(({ data, media }) => {
      if (!this.isTestStepRunning) {
        throw new Error(
          'Cannot attach when a step/hook is not running. Ensure your step/hook waits for the attach to finish.'
        )
      }
      // TODO custom envelope need to update cucumber-messages
      this.eventBroadcaster('envelope', {
        testCaseAttachment: {
          data,
          media,
          testCaseStartedId: this.currentTestCaseStartedId,
          testStepId: this.currentTestStepId,
        },
      })
    })
    this.eventBroadcaster = eventBroadcaster
    this.maxAttempts = 1 + (skip ? 0 : retries)
    this.pickle = pickle
    this.skip = skip
    this.supportCodeLibrary = supportCodeLibrary
    this.worldParameters = worldParameters
    this.testCaseId = uuidv4()
    this.testSteps = this.buildTestSteps()
    this.resetTestProgressData()
  }

  resetTestProgressData() {
    this.world = new this.supportCodeLibrary.World({
      attach: ::this.attachmentManager.create,
      parameters: this.worldParameters,
    })
    this.testStepIndex = 0
    this.result = {
      duration: 0,
      status: this.skip ? Status.SKIPPED : Status.PASSED,
    }
  }

  buildTestSteps() {
    const steps = []
    this.getBeforeHookDefinitions().forEach(hookDefinition => {
      steps.push({
        id: uuidv4(),
        hookDefinition,
        isHook: true,
        isBeforeHook: true,
      })
    })
    this.pickle.steps.forEach(pickleStep => {
      const stepDefinitions = this.getStepDefinitions(pickleStep)
      steps.push({
        id: uuidv4(),
        pickleStep,
        stepDefinitions,
        isHook: false,
      })
    })
    this.getAfterHookDefinitions().forEach(hookDefinition => {
      steps.push({
        id: uuidv4(),
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
      steps: this.testSteps.map(testStep => {
        if (testStep.isHook) {
          return {
            id: testStep.id,
            hookId: testStep.hookDefinition.id,
          }
        } else {
          return {
            id: testStep.id,
            pickleStepId: testStep.pickleStep.id,
            stepDefinitionId: testStep.stepDefinitions.map(x => x.id),
          }
        }
      }),
    }
    this.eventBroadcaster.emit('envelope', new messages.Envelope({ testCase }))
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
      new messages.Envelope({
        testStepStarted: {
          testCaseStartedId: this.currentTestCaseStartedId,
          testStepId,
        },
      })
    )
    const testStepResult = await runStepFn()
    if (testStepResult.duration) {
      this.result.duration += testStepResult.duration
    }
    if (this.shouldUpdateStatus(testStepResult)) {
      this.result.status = testStepResult.status
    }
    if (
      this.result.status === Status.FAILED &&
      attempt + 1 < this.maxAttempts
    ) {
      this.result.willBeRetried = true
    }
    if (testStepResult.exception) {
      this.result.exception = testStepResult.exception
    }
    this.eventBroadcaster.emit(
      'envelope',
      new messages.Envelope({
        testStepFinished: {
          testCaseStartedId: this.currentTestCaseStartedId,
          testStepId,
          testResult: testStepResult,
        },
      })
    )
    this.testStepIndex += 1
  }

  async run() {
    this.emitTestCase()
    for (let attempt = 0; attempt < this.maxAttempts; attempt++) {
      this.currentTestCaseStartedId = uuidv4()
      this.eventBroadcaster.emit(
        'envelope',
        new messages.Envelope({
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
        new messages.Envelope({
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
      return { duration: 0, status: Status.SKIPPED }
    }
    return this.invokeStep(null, hookDefinition, hookParameter)
  }

  async runStep(step) {
    const stepDefinitions = this.getStepDefinitions(step)
    if (stepDefinitions.length === 0) {
      return { duration: 0, status: Status.UNDEFINED }
    } else if (stepDefinitions.length > 1) {
      return {
        duration: 0,
        exception: getAmbiguousStepException(stepDefinitions),
        status: Status.AMBIGUOUS,
      }
    } else if (this.isSkippingSteps()) {
      return { duration: 0, status: Status.SKIPPED }
    }
    return this.invokeStep(step, stepDefinitions[0])
  }
}
