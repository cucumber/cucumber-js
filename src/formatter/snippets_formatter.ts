import Formatter, { IFormatterOptions } from './'
import Status from '../status'
import { parseTestCaseAttempt } from './helpers'
import { doesHaveValue } from '../value_checker'
import { messages } from '@cucumber/messages'
import IEnvelope = messages.IEnvelope

export default class SnippetsFormatter extends Formatter {
  constructor(options: IFormatterOptions) {
    super(options)
    options.eventBroadcaster.on('envelope', (envelope: IEnvelope) => {
      if (doesHaveValue(envelope.testRunFinished)) {
        this.logSnippets()
      }
    })
  }

  logSnippets(): void {
    const snippets: string[] = []
    this.eventDataCollector.getTestCaseAttempts().forEach((testCaseAttempt) => {
      const parsed = parseTestCaseAttempt({
        cwd: this.cwd,
        snippetBuilder: this.snippetBuilder,
        supportCodeLibrary: this.supportCodeLibrary,
        testCaseAttempt,
      })
      parsed.testSteps.forEach((testStep) => {
        if (testStep.result.status === Status.UNDEFINED) {
          snippets.push(testStep.snippet)
        }
      })
    })
    this.log(snippets.join('\n\n'))
  }
}
