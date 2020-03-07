import SummaryFormatter from './summary_formatter'
import Status from '../status'
import { doesHaveValue } from '../value_checker'
import { IFormatterOptions } from './index'
import { messages } from 'cucumber-messages'
import IEnvelope = messages.IEnvelope
import ITestStepFinished = messages.ITestStepFinished

const STATUS_CHARACTER_MAPPING: { [key: number]: string } = {
  [Status.AMBIGUOUS]: 'A',
  [Status.FAILED]: 'F',
  [Status.PASSED]: '.',
  [Status.PENDING]: 'P',
  [Status.SKIPPED]: '-',
  [Status.UNDEFINED]: 'U',
}

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

  logProgress({ testResult: { status } }: ITestStepFinished): void {
    const character = this.colorFns.forStatus(status)(
      STATUS_CHARACTER_MAPPING[status]
    )
    this.log(character)
  }
}
