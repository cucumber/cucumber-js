import EventBroadcaster from './event_broadcaster'
import FeaturesRunner from './features_runner'
import ScenarioFilter from '../scenario_filter'
import StackTraceFilter from './stack_trace_filter'

export default class Runtime {
  // options - {dryRun, failFast, filterStacktraces, strict}
  constructor({features, listeners, options, scenarioFilter, supportCodeLibrary}) {
    this.features = features || []
    this.listeners = listeners || []
    this.options = options || {}
    this.scenarioFilter = scenarioFilter || new ScenarioFilter({})
    this.supportCodeLibrary = supportCodeLibrary
    this.stackTraceFilter = new StackTraceFilter()
  }

  async start() {
    const eventBroadcaster = new EventBroadcaster({
      listenerDefaultTimeout: this.supportCodeLibrary.defaultTimeout,
      listeners: this.listeners.concat(this.supportCodeLibrary.listeners)
    })
    const featuresRunner = new FeaturesRunner({
      eventBroadcaster,
      features: this.features,
      options: this.options,
      scenarioFilter: this.scenarioFilter,
      supportCodeLibrary: this.supportCodeLibrary
    })

    if (this.options.filterStacktraces) {
      this.stackTraceFilter.filter()
    }

    const result = await featuresRunner.run()

    if (this.options.filterStacktraces) {
      this.stackTraceFilter.unfilter()
    }

    return result
  }

  attachListener(listener) {
    this.listeners.push(listener)
  }
}
