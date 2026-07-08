import { type Envelope, TestStepResultStatus } from '@cucumber/messages'
import { doesHaveValue } from '../value_checker'
import Formatter, { type IFormatterOptions } from './'
import { parseTestCaseAttempt } from './helpers'

type IEnvelope = Envelope

export default class SnippetsFormatter extends Formatter {
  public static readonly documentation: string =
    "The Snippets Formatter doesn't output anything regarding the test run; it just prints snippets to implement any undefined steps"

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
        snippetBuilder: this.snippetBuilder,
        supportCodeLibrary: this.supportCodeLibrary,
        testCaseAttempt,
      })
      parsed.testSteps.forEach((testStep) => {
        if (testStep.result.status === TestStepResultStatus.UNDEFINED) {
          snippets.push(testStep.snippet)
        }
      })
    })
    this.log(snippets.join('\n\n'))
  }
}
