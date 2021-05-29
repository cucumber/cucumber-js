import { formatIssue, formatSummary, isIssue } from './helpers'
import Formatter, { IFormatterOptions } from './'
import ProgressBar from 'progress'
import { WriteStream as TtyWriteStream } from 'tty'
import * as messages from '@cucumber/messages'
import { doesHaveValue, valueOrDefault } from '../value_checker'
import { formatUndefinedParameterType } from './helpers/issue_helpers'
import { durationBetweenTimestamps } from '../time'

// Inspired by https://github.com/thekompanee/fuubar and https://github.com/martinciu/fuubar-cucumber
export default class ProgressBarFormatter extends Formatter {
  private numberOfSteps: number
  private testRunStarted: messages.TestRunStarted
  private issueCount: number
  public progressBar: ProgressBar

  constructor(options: IFormatterOptions) {
    super(options)
    options.eventBroadcaster.on('envelope', this.parseEnvelope.bind(this))
    this.numberOfSteps = 0
    this.issueCount = 0
  }

  incrementStepCount(pickleId: string): void {
    const pickle = this.eventDataCollector.getPickle(pickleId)
    this.numberOfSteps += pickle.steps.length
  }

  initializeProgressBar(): void {
    if (doesHaveValue(this.progressBar)) {
      return
    }
    this.progressBar = new ProgressBar(':current/:total steps [:bar] ', {
      clear: true,
      incomplete: ' ',
      stream: this.stream,
      total: this.numberOfSteps,
      width: valueOrDefault((this.stream as TtyWriteStream).columns, 80),
    })
  }

  logProgress({
    testStepId,
    testCaseStartedId,
  }: messages.TestStepFinished): void {
    const { testCase } = this.eventDataCollector.getTestCaseAttempt(
      testCaseStartedId
    )
    const testStep = testCase.testSteps.find((s) => s.id === testStepId)
    if (doesHaveValue(testStep.pickleStepId)) {
      this.progressBar.tick()
    }
  }

  logUndefinedParametertype(
    parameterType: messages.UndefinedParameterType
  ): void {
    this.log(
      `Undefined parameter type: ${formatUndefinedParameterType(
        parameterType
      )}\n`
    )
  }

  logErrorIfNeeded(testCaseFinished: messages.TestCaseFinished): void {
    const { worstTestStepResult } = this.eventDataCollector.getTestCaseAttempt(
      testCaseFinished.testCaseStartedId
    )
    if (isIssue(worstTestStepResult)) {
      this.issueCount += 1
      const testCaseAttempt = this.eventDataCollector.getTestCaseAttempt(
        testCaseFinished.testCaseStartedId
      )
      this.progressBar.interrupt(
        formatIssue({
          colorFns: this.colorFns,
          cwd: this.cwd,
          number: this.issueCount,
          snippetBuilder: this.snippetBuilder,
          supportCodeLibrary: this.supportCodeLibrary,
          testCaseAttempt,
        })
      )
      if (worstTestStepResult.willBeRetried) {
        const stepsToRetry = testCaseAttempt.pickle.steps.length
        this.progressBar.tick(-stepsToRetry)
      }
    }
  }

  logSummary(testRunFinished: messages.TestRunFinished): void {
    const testRunDuration = durationBetweenTimestamps(
      this.testRunStarted.timestamp,
      testRunFinished.timestamp
    )
    this.log(
      formatSummary({
        colorFns: this.colorFns,
        testCaseAttempts: this.eventDataCollector.getTestCaseAttempts(),
        testRunDuration,
      })
    )
  }

  parseEnvelope(envelope: messages.Envelope): void {
    if (doesHaveValue(envelope.undefinedParameterType)) {
      this.logUndefinedParametertype(envelope.undefinedParameterType)
    } else if (doesHaveValue(envelope.pickle)) {
      this.incrementStepCount(envelope.pickle.id)
    } else if (doesHaveValue(envelope.testStepStarted)) {
      this.initializeProgressBar()
    } else if (doesHaveValue(envelope.testStepFinished)) {
      this.logProgress(envelope.testStepFinished)
    } else if (doesHaveValue(envelope.testCaseFinished)) {
      this.logErrorIfNeeded(envelope.testCaseFinished)
    } else if (doesHaveValue(envelope.testRunStarted)) {
      this.testRunStarted = envelope.testRunStarted
    } else if (doesHaveValue(envelope.testRunFinished)) {
      this.logSummary(envelope.testRunFinished)
    }
  }
}
