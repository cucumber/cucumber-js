import { formatIssue, formatSummary, isIssue } from './helpers'
import Formatter from './'
import ProgressBar from 'progress'

// Inspired by https://github.com/thekompanee/fuubar and https://github.com/martinciu/fuubar-cucumber
export default class ProgressBarFormatter extends Formatter {
  constructor(options) {
    super(options)
    options.eventBroadcaster
      .on('pickle-accepted', ::this.incrementStepCount)
      .once('test-step-started', ::this.initializeProgressBar)
      .on('test-step-finished', ::this.logProgress)
      .on('test-case-finished', ::this.logErrorIfNeeded)
      .on('test-run-finished', ::this.logSummary)
    this.numberOfSteps = 0
    this.issueCount = 0
  }

  incrementStepCount({ pickle }) {
    this.numberOfSteps += pickle.steps.length
  }

  initializeProgressBar() {
    this.progressBar = new ProgressBar(':current/:total steps [:bar] ', {
      clear: true,
      incomplete: ' ',
      stream: this.stream,
      total: this.numberOfSteps,
      width: this.stream.columns || 80,
    })
  }

  logProgress({ index, testCase: { sourceLocation } }) {
    const { testCase } = this.eventDataCollector.getTestCaseData(sourceLocation)
    if (testCase.steps[index].sourceLocation) {
      this.progressBar.tick()
    }
  }

  logErrorIfNeeded(testCaseFinishedEvent) {
    if (isIssue(testCaseFinishedEvent.result.status)) {
      const key = this.eventDataCollector.getTestCaseAttemptKey(
        testCaseFinishedEvent
      )
      const testCaseAttempt = this.eventDataCollector.testCaseAttemptMap[key]
      this.issueCount += 1
      const {
        gherkinDocument,
        pickle,
      } = this.eventDataCollector.getTestCaseData(
        testCaseAttempt.testCase.sourceLocation
      )
      this.progressBar.interrupt(
        formatIssue({
          colorFns: this.colorFns,
          gherkinDocument,
          number: this.issueCount,
          pickle,
          snippetBuilder: this.snippetBuilder,
          testCaseAttempt,
        })
      )
    }
  }

  logSummary(testRun) {
    this.log(
      formatSummary({
        colorFns: this.colorFns,
        testCaseMap: this.eventDataCollector.testCaseMap,
        testRun,
      })
    )
  }
}
