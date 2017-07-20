import Status from '../status'
import SummaryFormatter from './summary_formatter'

const STATUS_CHARACTER_MAPPING = {
  [Status.AMBIGUOUS]: 'A',
  [Status.FAILED]: 'F',
  [Status.PASSED]: '.',
  [Status.PENDING]: 'P',
  [Status.SKIPPED]: '-',
  [Status.UNDEFINED]: 'U'
}

export default class ProgressFormatter extends SummaryFormatter {
  constructor(options) {
    options.eventBroadcaster.on('test-run-finished', () => {
      this.log('\n\n')
    })
    super(options)
    options.eventBroadcaster.on('test-step-finished', ::this.logProgress)
  }

  logProgress({ result }) {
    const { status } = result
    const character = this.colorFns[status](STATUS_CHARACTER_MAPPING[status])
    this.log(character)
  }
}
