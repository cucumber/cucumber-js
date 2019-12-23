import _ from 'lodash'
import { formatIssue, formatSummary, isFailure, isWarning } from './helpers'
import Formatter from './'
import { doesHaveValue } from '../value_checker'
import { messages } from 'cucumber-messages'
import { ITestCaseAttempt } from './helpers/event_data_collector'

interface ILogIssuesRequest {
  issues: ITestCaseAttempt[]
  title: string
}

export default class SummaryFormatter extends Formatter {
  constructor(options) {
    super(options)
    options.eventBroadcaster.on('envelope', (envelope: messages.IEnvelope) => {
      if (doesHaveValue(envelope.testRunFinished)) {
        this.logSummary()
      }
    })
  }

  logSummary(): void {
    const failures: ITestCaseAttempt[] = []
    const warnings: ITestCaseAttempt[] = []
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
