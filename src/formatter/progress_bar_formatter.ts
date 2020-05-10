import { formatSummary } from './helpers'
import Formatter, { IFormatterOptions } from './'
import ProgressBar from 'progress'
import { WriteStream as TtyWriteStream } from 'tty'
import { messages } from '@cucumber/messages'
import { doesHaveValue, valueOrDefault } from '../value_checker'

// Inspired by https://github.com/thekompanee/fuubar and https://github.com/martinciu/fuubar-cucumber
export default class ProgressBarFormatter extends Formatter {
  private numberOfSteps: number
  private readonly issueCount: number
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
  }: messages.ITestStepFinished): void {
    const { testCase } = this.eventDataCollector.getTestCaseAttempt(
      testCaseStartedId
    )
    const testStep = testCase.testSteps.find(s => s.id === testStepId)
    if (testStep.pickleStepId !== '') {
      this.progressBar.tick()
    }
  }

  logErrorIfNeeded(testCaseFinished: messages.ITestCaseFinished): void {
    // TODO derive from steps, figure out willBeRetried
    // if (isIssue(testCaseFinished.testResult)) {
    //   this.issueCount += 1
    //   const testCaseAttempt = this.eventDataCollector.getTestCaseAttempt(
    //     testCaseFinished.testCaseStartedId
    //   )
    //   this.progressBar.interrupt(
    //     formatIssue({
    //       colorFns: this.colorFns,
    //       cwd: this.cwd,
    //       number: this.issueCount,
    //       snippetBuilder: this.snippetBuilder,
    //       supportCodeLibrary: this.supportCodeLibrary,
    //       testCaseAttempt,
    //     })
    //   )
    //   if (testCaseFinished.testResult.willBeRetried) {
    //     const stepsToRetry = testCaseAttempt.pickle.steps.length
    //     this.progressBar.tick(-stepsToRetry)
    //   }
    // }
  }

  logSummary(): void {
    this.log(
      formatSummary({
        colorFns: this.colorFns,
        testCaseAttempts: this.eventDataCollector.getTestCaseAttempts(),
      })
    )
  }

  parseEnvelope(envelope: messages.IEnvelope): void {
    if (doesHaveValue(envelope.pickle)) {
      this.incrementStepCount(envelope.pickle.id)
    } else if (doesHaveValue(envelope.testStepStarted)) {
      this.initializeProgressBar()
    } else if (doesHaveValue(envelope.testStepFinished)) {
      this.logProgress(envelope.testStepFinished)
    } else if (doesHaveValue(envelope.testCaseFinished)) {
      this.logErrorIfNeeded(envelope.testCaseFinished)
    } else if (doesHaveValue(envelope.testRunFinished)) {
      this.logSummary()
    }
  }
}
