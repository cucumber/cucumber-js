import _ from 'lodash'
import { formatIssue, formatSummary } from './helpers'
import Formatter from './'
import Status from '../status'

export default class SummaryFormatter extends Formatter {
  constructor(options) {
    super(options)
    options.eventBroadcaster.on('test-run-finished', ::this.logSummary)
  }

  isTestCaseFailure(testCaseAttempt) {
    return (
      testCaseAttempt.result.status === Status.AMBIGUOUS ||
      (testCaseAttempt.result.status === Status.FAILED &&
        !testCaseAttempt.result.retried)
    )
  }

  isTestCaseWarning(testCaseAttempt) {
    return (
      _.includes(
        [Status.PENDING, Status.UNDEFINED],
        testCaseAttempt.result.status
      ) ||
      (testCaseAttempt.result.status === Status.FAILED &&
        testCaseAttempt.result.retried)
    )
  }

  logSummary(testRun) {
    const failures = []
    const warnings = []
    _.each(this.eventDataCollector.testCaseAttemptMap, testCaseAttempt => {
      if (this.isTestCaseFailure(testCaseAttempt)) {
        failures.push(testCaseAttempt)
      } else if (this.isTestCaseWarning(testCaseAttempt)) {
        warnings.push(testCaseAttempt)
      }
    })
    if (failures.length > 0) {
      this.logIssues({ issues: failures, title: 'Failures' })
    }
    if (warnings.length > 0) {
      this.logIssues({ issues: warnings, title: 'Warnings' })
    }
    this.log(
      formatSummary({
        colorFns: this.colorFns,
        testCaseAttemptMap: this.eventDataCollector.testCaseAttemptMap,
        testRun,
      })
    )
  }

  logIssues({ issues, title }) {
    this.log(`${title}:\n\n`)
    issues.forEach((testCaseAttempt, index) => {
      const {
        gherkinDocument,
        pickle,
      } = this.eventDataCollector.getTestCaseData(
        testCaseAttempt.testCase.sourceLocation
      )
      this.log(
        formatIssue({
          colorFns: this.colorFns,
          gherkinDocument,
          number: index + 1,
          pickle,
          snippetBuilder: this.snippetBuilder,
          testCaseAttempt,
        })
      )
    })
  }
}
