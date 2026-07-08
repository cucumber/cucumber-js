import type { Duration, Envelope, Timestamp } from '@cucumber/messages'
import { durationBetweenTimestamps } from '../time'
import { doesHaveValue } from '../value_checker'
import Formatter, { type IFormatterOptions } from './'
import { formatIssue, formatSummary, isFailure, isWarning } from './helpers'
import type { ITestCaseAttempt } from './helpers/event_data_collector'
import { formatUndefinedParameterTypes } from './helpers/issue_helpers'

interface ILogIssuesRequest {
  issues: ITestCaseAttempt[]
  title: string
}

/**
 * @deprecated the built-in `summary` formatter is now plugin-based and no longer uses this class; see https://github.com/cucumber/cucumber-js/blob/main/docs/deprecations.md
 */
export default class SummaryFormatter extends Formatter {
  public static readonly documentation: string = 'Summary output of feature and scenarios'

  constructor(options: IFormatterOptions) {
    super(options)
    let testRunStartedTimestamp: Timestamp
    options.eventBroadcaster.on('envelope', (envelope: Envelope) => {
      if (doesHaveValue(envelope.testRunStarted)) {
        testRunStartedTimestamp = envelope.testRunStarted.timestamp
      }
      if (doesHaveValue(envelope.testRunFinished)) {
        const testRunFinishedTimestamp = envelope.testRunFinished.timestamp
        this.logSummary(
          durationBetweenTimestamps(testRunStartedTimestamp, testRunFinishedTimestamp)
        )
      }
    })
  }

  logSummary(testRunDuration: Duration): void {
    const failures: ITestCaseAttempt[] = []
    const warnings: ITestCaseAttempt[] = []
    const testCaseAttempts = this.eventDataCollector.getTestCaseAttempts()
    testCaseAttempts.forEach((testCaseAttempt) => {
      if (isFailure(testCaseAttempt.worstTestStepResult, testCaseAttempt.willBeRetried)) {
        failures.push(testCaseAttempt)
      } else if (isWarning(testCaseAttempt.worstTestStepResult, testCaseAttempt.willBeRetried)) {
        warnings.push(testCaseAttempt)
      }
    })
    if (this.eventDataCollector.undefinedParameterTypes.length > 0) {
      this.log(formatUndefinedParameterTypes(this.eventDataCollector.undefinedParameterTypes))
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
          number: index + 1,
          snippetBuilder: this.snippetBuilder,
          supportCodeLibrary: this.supportCodeLibrary,
          testCaseAttempt,
          printAttachments: this.printAttachments,
        })
      )
    })
  }
}
