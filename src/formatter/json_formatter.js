import _ from 'lodash'
import Formatter from './'
import { parseTestCaseAttempt, formatError } from './helpers'

export default class JsonFormatter extends Formatter {
  constructor(options) {
    super(options)
    options.eventBroadcaster.on('test-run-finished', ::this.onTestRunFinished)
  }

  formatExceptionIfNeeded(obj) {
    if (obj.result.exception) {
      obj.result.exception = formatError(obj.result.exception)
    }
  }

  onTestRunFinished() {
    const testCaseAttempts = this.eventDataCollector.getTestCaseAttempts()
    const testCaseAttemptsData = testCaseAttempts.map(testCaseAttempt => {
      const parsed = parseTestCaseAttempt({
        snippetBuilder: this.snippetBuilder,
        testCaseAttempt,
      })
      this.formatExceptionIfNeeded(parsed.testCase)
      parsed.testSteps.forEach(s => this.formatExceptionIfNeeded(s))
      return parsed
    })
    const data = {
      gherkinDocuments: _.values(this.eventDataCollector.gherkinDocumentMap),
      pickles: _.values(this.eventDataCollector.pickleMap),
      testCaseAttempts: testCaseAttemptsData,
    }
    this.log(JSON.stringify(data, null, 2))
  }
}
