import _ from 'lodash'
import { formatIssue, formatSummary, isFailure, isWarning } from './helpers'
import Formatter from './'

export default class SummaryFormatter extends Formatter {
  constructor(options) {
    super(options)
    options.eventBroadcaster.on('test-run-finished', ::this.logSummary)
  }

  logSummary(testRun) {
    const failures = []
    const warnings = []
    const collatedEvents = this.eventDataCollector.getCollatedEvents()
    _.each(collatedEvents, collatedEvent => {
      if (isFailure(collatedEvent.testCaseAttempt.result)) {
        failures.push(collatedEvent)
      } else if (isWarning(collatedEvent.testCaseAttempt.result)) {
        warnings.push(collatedEvent)
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
        collatedEvents,
        testRun,
      })
    )
  }

  logIssues({ issues, title }) {
    this.log(`${title}:\n\n`)
    issues.forEach((collatedEvent, index) => {
      this.log(
        formatIssue({
          colorFns: this.colorFns,
          collatedEvent: collatedEvent,
          number: index + 1,
          snippetBuilder: this.snippetBuilder,
        })
      )
    })
  }
}
