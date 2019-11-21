import SummaryFormatter from './summary_formatter'
import { messages } from 'cucumber-messages'

const { Status } = messages.TestResult

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
      if (envelope.testRunFinished) {
        this.log('\n\n')
      } else if (envelope.testStepFinished) {
        this.logProgress(envelope.testStepFinished)
      }
    })
    super(options)
  }

  logProgress({ testResult: {status} }) {
    const character = this.colorFns[status](STATUS_CHARACTER_MAPPING[status])
    this.log(character)
  }
}
