import _ from 'lodash'
import { formatIssue, formatSummary, isFailure, isWarning } from './helpers'
import Formatter, { IFormatterOptions } from './'
import { doesHaveValue } from '../value_checker'
import * as messages from '@cucumber/messages'
import { ITestCaseAttempt } from './helpers/event_data_collector'
import { formatUndefinedParameterTypes } from './helpers/issue_helpers'
import { durationBetweenTimestamps } from '../time'

interface ILogIssuesRequest {
  issues: ITestCaseAttempt[]
  title: string
}

export default class SummaryFormatter extends Formatter {
  constructor(options: IFormatterOptions) {
    super(options)
    let testRunStartedTimestamp: messages.Timestamp
    options.eventBroadcaster.on('envelope', (envelope: messages.Envelope) => {
      if (doesHaveValue(envelope.testRunStarted)) {
        testRunStartedTimestamp = envelope.testRunStarted.timestamp
      }
      if (doesHaveValue(envelope.testRunFinished)) {
        const testRunFinishedTimestamp = envelope.testRunFinished.timestamp
        this.logSummary(
          durationBetweenTimestamps(
            testRunStartedTimestamp,
            testRunFinishedTimestamp
          )
        )
      }
    })
  }

  logSummary(testRunDuration: messages.Duration): void {
    const failures: ITestCaseAttempt[] = []
    const warnings: ITestCaseAttempt[] = []
    const testCaseAttempts = this.eventDataCollector.getTestCaseAttempts()
    _.each(testCaseAttempts, (testCaseAttempt) => {
      if (isFailure(testCaseAttempt.worstTestStepResult)) {
        failures.push(testCaseAttempt)
      } else if (isWarning(testCaseAttempt.worstTestStepResult)) {
        warnings.push(testCaseAttempt)
      }
    })
    if (this.eventDataCollector.undefinedParameterTypes.length > 0) {
      this.log(
        formatUndefinedParameterTypes(
          this.eventDataCollector.undefinedParameterTypes
        )
      )
    }
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
        testRunDuration,
      })
    )
  }

  logIssues({ issues, title }: ILogIssuesRequest): void {
    this.log(`${title}:\n\n`)
    issues.forEach((testCaseAttempt, index) => {
      this.log(
        formatIssue({
          colorFns: this.colorFns,
          cwd: this.cwd,
          number: index + 1,
          snippetBuilder: this.snippetBuilder,
          supportCodeLibrary: this.supportCodeLibrary,
          testCaseAttempt,
        })
      )
    })
  }
}
