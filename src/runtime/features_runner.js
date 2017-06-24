import Event from './event'
import FeaturesResult from '../models/features_result'
import Promise from 'bluebird'
import ScenarioResult from '../models/scenario_result'
import ScenarioRunner from './scenario_runner'
import Status from '../status'
import _ from 'lodash'

export default class FeaturesRunner {
  constructor({eventBroadcaster, features, options, supportCodeLibrary}) {
    this.eventBroadcaster = eventBroadcaster
    this.features = features
    this.options = options
    this.supportCodeLibrary = supportCodeLibrary
    this.featuresResult = new FeaturesResult(options.strict)
  }

  async run() {
    const event = new Event({data: this.features, name: Event.FEATURES_EVENT_NAME})
    await this.eventBroadcaster.broadcastAroundEvent(event, async() => {
      const scenarios = _.chain(this.features).map('scenarios').flatten().value()
      await Promise.map(scenarios, ::this.runScenario, {concurrency: this.options.maximumConcurrentScenarios})
      await this.broadcastFeaturesResult()
    })
    return this.featuresResult.success
  }

  async broadcastFeaturesResult() {
    const event = new Event({data: this.featuresResult, name: Event.FEATURES_RESULT_EVENT_NAME})
    await this.eventBroadcaster.broadcastEvent(event)
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
    const scenarioResult = await scenarioRunner.run()
    this.featuresResult.witnessScenarioResult(scenarioResult)
  }
}
