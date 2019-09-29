import Formatter from './'
import { parseCollatedEvent } from './helpers/collated_event_parser'
import { formatError } from './helpers/error_helpers'

export default class JsonFormatter extends Formatter {
  constructor(options) {
    super(options)
    options.eventBroadcaster.on('test-run-finished', ::this.onTestRunFinished)
  }

  formatExceptionIfNeeded(obj) {
    if (obj.result.exception) {
      obj.result.exception = formatError(obj.result.exception)
    }
  }

  onTestRunFinished() {
    const collatedEvents = this.eventDataCollector.getCollatedEvents()
    const data = collatedEvents.map(collatedEvent => {
      const parsed = parseCollatedEvent({
        collatedEvent,
        snippetBuilder: this.snippetBuilder,
      })
      this.formatExceptionIfNeeded(parsed.testCase)
      parsed.testSteps.forEach(s => this.formatExceptionIfNeeded(s))
      return parsed
    })
    this.log(JSON.stringify(data, null, 2))
  }
}
