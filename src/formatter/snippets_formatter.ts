import Formatter from './'
import Status from '../status'
import { parseTestCaseAttempt } from './helpers'
import { doesHaveValue } from '../value_checker'

export default class SnippetsFormatter extends Formatter {
  constructor(options) {
    super(options)
    options.eventBroadcaster.on('envelope', envelope => {
      if (doesHaveValue(envelope.testRunFinished)) {
        this.logSnippets()
      }
    })
  }

  logSnippets(): void {
    const snippets = []
    this.eventDataCollector.getTestCaseAttempts().map(testCaseAttempt => {
      const parsed = parseTestCaseAttempt({
        cwd: this.cwd,
        snippetBuilder: this.snippetBuilder,
        supportCodeLibrary: this.supportCodeLibrary,
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
