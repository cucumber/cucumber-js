import Event from './event'
import FeaturesResult from '../models/features_result'
import Promise from 'bluebird'
import ScenarioResult from '../models/scenario_result'
import ScenarioRunner from './scenario_runner'
import Status from '../status'
import UserCodeRunner from '../user_code_runner'
import { formatLocation } from '../formatter/helpers'
import VError from 'verror'

export default class FeaturesRunner {
  constructor({ eventBroadcaster, features, options, supportCodeLibrary }) {
    this.eventBroadcaster = eventBroadcaster
    this.features = features
    this.options = options
    this.supportCodeLibrary = supportCodeLibrary
    this.featuresResult = new FeaturesResult(options.strict)
  }

  async run() {
    await this.runFeaturesHooks('beforeFeaturesHookDefinitions', 'a BeforeAll')
    const event = new Event({
      data: this.features,
      name: Event.FEATURES_EVENT_NAME
    })
    await this.eventBroadcaster.broadcastAroundEvent(event, async () => {
      await Promise.each(this.features, ::this.runFeature)
      await this.broadcastFeaturesResult()
    })
    await this.runFeaturesHooks('afterFeaturesHookDefinitions', 'an AfterAll')
    return this.featuresResult.success
  }

  async runFeaturesHooks(key, name) {
    await Promise.each(this.supportCodeLibrary[key], async (hookDefinition) => {
      const { error } = await UserCodeRunner.run({
        argsArray: [],
        fn: hookDefinition.code,
        thisArg: null,
        timeoutInMilliseconds: hookDefinition.timeout || this.supportCodeLibrary.defaultTimeout
      })
      if (error) {
        const location = formatLocation('', hookDefinition)
        throw new VError(
          error,
          `${name} hook errored, process exiting: ${location}`
        )
      }
    })
  }

  async broadcastFeaturesResult() {
    const event = new Event({
      data: this.featuresResult,
      name: Event.FEATURES_RESULT_EVENT_NAME
    })
    await this.eventBroadcaster.broadcastEvent(event)
  }

  async runFeature(feature) {
    const event = new Event({ data: feature, name: Event.FEATURE_EVENT_NAME })
    await this.eventBroadcaster.broadcastAroundEvent(event, async () => {
      await Promise.each(feature.scenarios, async scenario => {
        const scenarioResult = await this.runScenario(scenario)
        this.featuresResult.witnessScenarioResult(scenarioResult)
      })
    })
  }

  async runScenario(scenario) {
    if (!this.featuresResult.success && this.options.failFast) {
      return new ScenarioResult(scenario, Status.SKIPPED)
    }
    const scenarioRunner = new ScenarioRunner({
      eventBroadcaster: this.eventBroadcaster,
      options: this.options,
      scenario,
      supportCodeLibrary: this.supportCodeLibrary
    })
    return await scenarioRunner.run()
  }
}
