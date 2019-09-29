import Formatter from './'
import Status from '../status'
import { parseCollatedEvent } from './helpers'

export default class SnippetsFormatter extends Formatter {
  constructor(options) {
    super(options)
    options.eventBroadcaster.on('test-run-finished', ::this.logSnippets)
  }

  logSnippets() {
    const snippets = []
    const collatedEvents = this.eventDataCollector.getCollatedEvents()
    collatedEvents.map(collatedEvent => {
      const parsed = parseCollatedEvent({
        collatedEvent,
        snippetBuilder: this.snippetBuilder,
      })
      parsed.testSteps.forEach(testStep => {
        if (testStep.result.status === Status.UNDEFINED) {
          snippets.push(testStep.snippet)
        }
      })
    })
    this.log(snippets.join('\n\n'))
  }
}
