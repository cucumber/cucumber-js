import SummaryFormatter from './summary_formatter'
import { doesHaveValue } from '../value_checker'
import { IFormatterOptions } from './index'
import * as messages from '@cucumber/messages'
import IEnvelope = messages.Envelope
import ITestStepFinished = messages.TestStepFinished

const STATUS_CHARACTER_MAPPING: Map<
  messages.TestStepResultStatus,
  string
> = new Map([
  [messages.TestStepResultStatus.AMBIGUOUS, 'A'],
  [messages.TestStepResultStatus.FAILED, 'F'],
  [messages.TestStepResultStatus.PASSED, '.'],
  [messages.TestStepResultStatus.PENDING, 'P'],
  [messages.TestStepResultStatus.SKIPPED, '-'],
  [messages.TestStepResultStatus.UNDEFINED, 'U'],
])

export default class ProgressFormatter extends SummaryFormatter {
  constructor(options: IFormatterOptions) {
    options.eventBroadcaster.on('envelope', (envelope: IEnvelope) => {
      if (doesHaveValue(envelope.testRunFinished)) {
        this.log('\n\n')
      } else if (doesHaveValue(envelope.testStepFinished)) {
        this.logProgress(envelope.testStepFinished)
      }
    })
    super(options)
  }

  logProgress({ testStepResult: { status } }: ITestStepFinished): void {
    const character = this.colorFns.forStatus(status)(
      STATUS_CHARACTER_MAPPING.get(status)
    )
    this.log(character)
  }
}
