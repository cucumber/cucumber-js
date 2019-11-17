import _ from 'lodash'
import { getAmbiguousStepException } from './helpers'
import AttachmentManager from './attachment_manager'
import Promise from 'bluebird'
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
      // TODO custom envelope need to add to cucumber-messages 
      this.eventBroadcaster('envelope', {
        testCaseAttachment: {
          data,
          media,
          testCaseStartedId: this.currentTestCaseStartedId,
          testStepId: this.currentTestStepId,
        }
      })
    })
    this.eventBroadcaster = eventBroadcaster
    this.maxAttempts = 1 + (skip ? 0 : retries)
    this.pickle = pickle
    this.skip = skip
    this.supportCodeLibrary = supportCodeLibrary
    this.worldParameters = worldParameters
    this.beforeHookDefinitions = this.getBeforeHookDefinitions()
    this.afterHookDefinitions = this.getAfterHookDefinitions()
    this.testCase = this.buildTestCase()
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

  buildTestCase() {
    const steps = [];
    this.beforeHookDefinitions.forEach(hookDefinition => {
      steps.push({
        id: uuidv4(),
        hookId: hookDefinition.id
      })
    })
    this.pickle.steps.forEach(pickleStep => {
      const stepDefinitionId = this.getStepDefinitions(step).map(definition => definition.id)
      steps.push({
        id: uuidv4(),
        pickleStepId: pickleStep.id,
        stepDefinitionId
      })
    })
    this.afterHookDefinitions.forEach(hookDefinition => {
      steps.push({
        id: uuidv4(),
        hookId: hookDefinition.id
      })
    })
    return { 
      pickleId: this.pickle.id,
      id: uuidv4(),
      steps
    }
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

  async aroundTestStep(testStepId, runStepFn) {
    this.eventBroadcaster.emit('envelope', new messages.Envelope({
      testStepStarted: {
        testCaseStartedId: this.currentTestCaseStartedId,
        testStepId
      }
    }))
    const testStepResult = await runStepFn()
    if (testStepResult.duration) {
      this.result.duration += testStepResult.duration
    }
    if (this.shouldUpdateStatus(testStepResult)) {
      this.result.status = testStepResult.status
    }
    if (testStepResult.exception) {
      this.result.exception = testStepResult.exception
    }
    this.eventBroadcaster.emit('envelope', new messages.Envelope({
      testStepFinished: {
        testCaseStartedId: this.currentTestCaseStartedId,
        testStepId,
        testResult: testStepResult
      }
    }))
    this.testStepIndex += 1
  }

  async run() {
    this.eventBroadcaster.emit('envelope', new messages.Envelope({
      testCase: this.testCase
    }))
    for (
      let attempt = 0;
      attempt <= this.maxAttempts;
      attempt++
    ) {
      this.currentTestCaseStartedId = uuidv4()
      this.eventBroadcaster.emit('envelope', new messages.Envelope({
        testCaseStarted: {
          attempt,
          testCaseId: this.testCase.id,
          id: this.currentTestCaseStartedId
        }
      }))
      await this.runHooks(
        this.beforeHookDefinitions,
        {
          sourceLocation: this.testCaseSourceLocation,
          pickle: this.testCase.pickle,
        },
        true
      )
      await this.runSteps()
      const shouldRetry =
        this.result.status === Status.FAILED &&
        this.currentAttemptNumber < this.maxAttempts
      if (shouldRetry) {
        this.result.retried = true
      }
      await this.runHooks(
        this.afterHookDefinitions,
        {
          sourceLocation: this.testCaseSourceLocation,
          pickle: this.testCase.pickle,
          result: this.result,
        },
        false
      )
      this.eventBroadcaster.emit('envelope', new messages.Envelope({
        testCaseFinished: {
          testCaseStartedId: this.currentTestCaseStartedId,
          testResult: this.result
        }
      }))
      if (!shouldRetry) {
        break
      }
      this.resetTestProgressData()
    }
    return this.result
  }

  async runHook(hookDefinition, hookParameter, isBeforeHook) {
    if (this.shouldSkipHook(isBeforeHook)) {
      return { status: Status.SKIPPED }
    }
    return this.invokeStep(null, hookDefinition, hookParameter)
  }

  async runHooks(hookDefinitions, hookParameter, isBeforeHook) {
    await Promise.each(hookDefinitions, async hookDefinition => {
      await this.aroundTestStep(() =>
        this.runHook(hookDefinition, hookParameter, isBeforeHook)
      )
    })
  }

  async runStep(step) {
    const stepDefinitions = this.getStepDefinitions(step)
    if (stepDefinitions.length === 0) {
      return { status: Status.UNDEFINED }
    } else if (stepDefinitions.length > 1) {
      return {
        exception: getAmbiguousStepException(stepDefinitions),
        status: Status.AMBIGUOUS,
      }
    } else if (this.isSkippingSteps()) {
      return { status: Status.SKIPPED }
    }
    return this.invokeStep(step, stepDefinitions[0])
  }

  async runSteps() {
    await Promise.each(this.pickle.steps, async step => {
      await this.aroundTestStep(() => this.runStep(step))
    })
  }
}
