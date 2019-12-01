import Formatter from './'
import { parseTestCaseAttempt } from './helpers'
import { messages } from 'cucumber-messages'

const { Status } = messages.TestResult

export default class SnippetsFormatter extends Formatter {
  constructor(options) {
    super(options)
    options.eventBroadcaster.on('envelope', envelope => {
      if (envelope.testRunFinished) {
        this.logSnippets()
      }
    })
  }

  logSnippets() {
    const snippets = []
    this.eventDataCollector.getTestCaseAttempts().map(testCaseAttempt => {
      const parsed = parseTestCaseAttempt({
        cwd: this.cwd,
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
