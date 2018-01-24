import _ from 'lodash'
import Formatter from './'
import Status from '../status'

const DEFAULT_SEPARATOR = '\n'

export default class RerunFormatter extends Formatter {
  constructor(options) {
    super(options)
    options.eventBroadcaster
      .on('test-case-finished', ::this.storeFailedTestCases)
      .on('test-run-finished', ::this.logFailedTestCases)
    this.mapping = {}
    this.separator = _.get(options, 'rerun.separator', DEFAULT_SEPARATOR)
  }

  storeFailedTestCases({ sourceLocation: { line, uri }, result: { status } }) {
    if (status !== Status.PASSED) {
      if (!this.mapping[uri]) {
        this.mapping[uri] = []
      }
      this.mapping[uri].push(line)
    }
  }

  logFailedTestCases() {
    const text = _.chain(this.mapping)
      .map((lines, uri) => uri + ':' + lines.join(':'))
      .join(this.separator)
      .value()
    this.log(text)
  }
}
