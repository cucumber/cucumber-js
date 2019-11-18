import _ from 'lodash'
import Formatter from './'
import path from 'path'
import { messages } from 'cucumber-messages'

const { Status } = messages.TestResult

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
      const relativeUri = path.relative(this.cwd, uri)
      if (!this.mapping[relativeUri]) {
        this.mapping[relativeUri] = []
      }
      this.mapping[relativeUri].push(line)
    }
  }

  logFailedTestCases() {
    const text = _.chain(this.mapping)
      .map((lines, uri) => `${uri}:${lines.join(':')}`)
      .join(this.separator)
      .value()
    this.log(text)
  }
}
