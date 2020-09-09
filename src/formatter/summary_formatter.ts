import _ from 'lodash'
import { formatIssue, formatSummary, isFailure, isWarning } from './helpers'
import Formatter, { IFormatterOptions } from './'
import { doesHaveValue, doesNotHaveValue } from '../value_checker'
import { messages, TimeConversion } from '@cucumber/messages'
import { ITestCaseAttempt } from './helpers/event_data_collector'
import { formatUndefinedParameterTypes } from './helpers/issue_helpers'

interface ILogIssuesRequest {
  issues: ITestCaseAttempt[]
  title: string
}

export default class SummaryFormatter extends Formatter {
  private testRunStartedTimestamp: messages.ITimestamp

  constructor(options: IFormatterOptions) {
    super(options)
    options.eventBroadcaster.on('envelope', (envelope: messages.IEnvelope) => {
      if (doesHaveValue(envelope.testRunStarted)) {
        this.testRunStartedTimestamp = envelope.testRunStarted.timestamp
      } else if (doesHaveValue(envelope.testRunFinished)) {
        if (doesNotHaveValue(this.testRunStartedTimestamp)) {
          throw new Error('No timestamp for testRunStarted')
        }
        if (doesNotHaveValue(envelope.testRunFinished.timestamp)) {
          throw new Error('No timestamp for testRunStarted')
        }

        const testRunDurationMillis =
          TimeConversion.timestampToMillisecondsSinceEpoch(
            envelope.testRunFinished.timestamp
          ) -
          TimeConversion.timestampToMillisecondsSinceEpoch(
            this.testRunStartedTimestamp
          )
        const testRunDuration = TimeConversion.millisecondsToDuration(
          testRunDurationMillis
        )

        this.logSummary(testRunDuration)
      }
    })
  }

  logSummary(testRunDuration: messages.IDuration): void {
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
