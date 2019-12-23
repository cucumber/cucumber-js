import SummaryFormatter from './summary_formatter'
import Status from '../status'
import { doesHaveValue } from '../value_checker'

const STATUS_CHARACTER_MAPPING = {
  [Status.AMBIGUOUS]: 'A',
  [Status.FAILED]: 'F',
  [Status.PASSED]: '.',
  [Status.PENDING]: 'P',
  [Status.SKIPPED]: '-',
  [Status.UNDEFINED]: 'U',
}

export default class ProgressFormatter extends SummaryFormatter {
  constructor(options) {
    options.eventBroadcaster.on('envelope', envelope => {
      if (doesHaveValue(envelope.testRunFinished)) {
        this.log('\n\n')
      } else if (doesHaveValue(envelope.testStepFinished)) {
        this.logProgress(envelope.testStepFinished)
      }
    })
    super(options)
  }

  logProgress({ testResult: { status } }): void {
    const character = this.colorFns.forStatus(status)(
      STATUS_CHARACTER_MAPPING[status]
    )
    this.log(character)
  }
}
