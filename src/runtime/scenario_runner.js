import AttachmentManager from './attachment_manager'
import Event from './event'
import Hook from '../models/hook'
import Promise from 'bluebird'
import ScenarioResult from '../models/scenario_result'
import Status from '../status'
import StepResult from '../models/step_result'
import StepRunner from './step_runner'

export default class ScenarioRunner {
  constructor({eventBroadcaster, options, scenario, supportCodeLibrary}) {
    this.attachmentManager = new AttachmentManager()
    this.eventBroadcaster = eventBroadcaster
    this.options = options
    this.scenario = scenario
    this.supportCodeLibrary = supportCodeLibrary
    this.scenarioResult = new ScenarioResult(scenario)
    this.world = new supportCodeLibrary.World({
      attach: ::this.attachmentManager.create,
      parameters: options.worldParameters
    })
  }

  async broadcastScenarioResult() {
    const event = new Event({data: this.scenarioResult, name: Event.SCENARIO_RESULT_EVENT_NAME})
    await this.eventBroadcaster.broadcastEvent(event)
  }

  async broadcastStepResult(stepResult) {
    this.scenarioResult.witnessStepResult(stepResult)
    const event = new Event({data: stepResult, name: Event.STEP_RESULT_EVENT_NAME})
    await this.eventBroadcaster.broadcastEvent(event)
  }

  invokeStep(step, stepDefinition) {
    return StepRunner.run({
      attachmentManager: this.attachmentManager,
      defaultTimeout: this.supportCodeLibrary.defaultTimeout,
      scenarioResult: this.scenarioResult,
      step,
      stepDefinition,
      parameterRegistry: this.supportCodeLibrary.parameterRegistry,
      world: this.world
    })
  }

  isSkippingSteps() {
    return this.scenarioResult.status !== Status.PASSED
  }

  async run() {
    const event = new Event({data: this.scenario, name: Event.SCENARIO_EVENT_NAME})
    await this.eventBroadcaster.broadcastAroundEvent(event, async() => {
      await this.runBeforeHooks()
      await this.runSteps()
      await this.runAfterHooks()
      await this.broadcastScenarioResult()
    })
    return this.scenarioResult
  }

  async runAfterHooks() {
    await this.runHooks({
      hookDefinitions: this.supportCodeLibrary.afterHookDefinitions,
      hookKeyword: Hook.AFTER_STEP_KEYWORD
    })
  }

  async runBeforeHooks() {
    await this.runHooks({
      hookDefinitions: this.supportCodeLibrary.beforeHookDefinitions,
      hookKeyword: Hook.BEFORE_STEP_KEYWORD
    })
  }

  async runHook(hook, hookDefinition) {
    if (this.options.dryRun) {
      return new StepResult({
        step: hook,
        stepDefinition: hookDefinition,
        status: Status.SKIPPED
      })
    } else {
      return await this.invokeStep(hook, hookDefinition)
    }
  }

  async runHooks({hookDefinitions, hookKeyword}) {
    await Promise.each(hookDefinitions, async (hookDefinition) => {
      if (!hookDefinition.appliesToScenario(this.scenario)) {
        return
      }
      const hook = new Hook({keyword: hookKeyword, scenario: this.scenario})
      const event = new Event({data: hook, name: Event.STEP_EVENT_NAME})
      await this.eventBroadcaster.broadcastAroundEvent(event, async() => {
        const stepResult = await this.runHook(hook, hookDefinition)
        await this.broadcastStepResult(stepResult)
      })
    })
  }

  async runStep(step) {
    const stepDefinitions = this.supportCodeLibrary.stepDefinitions.filter((stepDefinition) => {
      return stepDefinition.matchesStepName({
        stepName: step.name,
        parameterRegistry: this.supportCodeLibrary.parameterRegistry
      })
    })
    if (stepDefinitions.length === 0) {
      return new StepResult({
        step,
        status: Status.UNDEFINED
      })
    } else if (stepDefinitions.length > 1) {
      return new StepResult({
        ambiguousStepDefinitions: stepDefinitions,
        step,
        status: Status.AMBIGUOUS
      })
    } else if (this.options.dryRun || this.isSkippingSteps()) {
      return new StepResult({
        step,
        stepDefinition: stepDefinitions[0],
        status: Status.SKIPPED
      })
    } else {
      return await this.invokeStep(step, stepDefinitions[0])
    }
  }

  async runSteps() {
    await Promise.each(this.scenario.steps, async(step) => {
      const event = new Event({data: step, name: Event.STEP_EVENT_NAME})
      await this.eventBroadcaster.broadcastAroundEvent(event, async() => {
        const stepResult = await this.runStep(step)
        await this.broadcastStepResult(stepResult)
      })
    })
  }
}
