import _ from 'lodash'
import { formatIssue, formatSummary, isFailure, isWarning } from './helpers'
import Formatter from './'

export default class SummaryFormatter extends Formatter {
  constructor(options) {
    super(options)
    options.eventBroadcaster.on('envelope', envelope => {
      if (envelope.testRunFinished) {
        this.logSummary(envelope.testRunFinished)
      }
    })
  }

  logSummary(testRun) {
    const failures = []
    const warnings = []
    const testCaseAttempts = this.eventDataCollector.getTestCaseAttempts()
    _.each(testCaseAttempts, testCaseAttempt => {
      if (isFailure(testCaseAttempt.result)) {
        failures.push(testCaseAttempt)
      } else if (isWarning(testCaseAttempt.result)) {
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
        testCaseAttempts,
        testRun,
      })
    )
  }

  logIssues({ issues, title }) {
    this.log(`${title}:\n\n`)
    issues.forEach((testCaseAttempt, index) => {
      this.log(
        formatIssue({
          colorFns: this.colorFns,
          number: index + 1,
          snippetBuilder: this.snippetBuilder,
          supportCodeLibrary: this.supportCodeLibrary,
          testCaseAttempt,
        })
      )
    })
  }
}
