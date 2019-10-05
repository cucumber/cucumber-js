import Formatter from './'
import Status from '../status'
import { parseTestCaseAttempt } from './helpers'

export default class SnippetsFormatter extends Formatter {
  constructor(options) {
    super(options)
    options.eventBroadcaster.on('test-run-finished', ::this.logSnippets)
  }

  logSnippets() {
    const snippets = []
    this.eventDataCollector.getTestCaseAttempts().map(testCaseAttempt => {
      const parsed = parseTestCaseAttempt({
        snippetBuilder: this.snippetBuilder,
        testCaseAttempt,
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
