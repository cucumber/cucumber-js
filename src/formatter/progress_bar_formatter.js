import { formatIssue, formatSummary, isIssue } from './helpers'
import Formatter from './'
import ProgressBar from 'progress'

// Inspired by https://github.com/thekompanee/fuubar and https://github.com/martinciu/fuubar-cucumber
export default class ProgressBarFormatter extends Formatter {
  constructor(options) {
    super(options)
    options.eventBroadcaster.on('envelope', ::this.parseEnvelope)
    this.numberOfSteps = 0
    this.issueCount = 0
  }

  incrementStepCount(pickleId) {
    const pickle = this.eventDataCollector.pickleMap[pickleId]
    this.numberOfSteps += pickle.steps.length
  }

  initializeProgressBar() {
    if (this.progressBar) {
      return
    }
    this.progressBar = new ProgressBar(':current/:total steps [:bar] ', {
      clear: true,
      incomplete: ' ',
      stream: this.stream,
      total: this.numberOfSteps,
      width: this.stream.columns || 80,
    })
  }

  logProgress({ testStepId, testCaseStartedId }) {
    const { testCase } = this.eventDataCollector.getTestCaseAttempt(
      testCaseStartedId
    )
    const testStep = testCase.testSteps.find(s => s.id === testStepId)
    if (testStep.pickleStepId) {
      this.progressBar.tick()
    }
  }

  logErrorIfNeeded(testCaseFinished) {
    if (isIssue(testCaseFinished.testResult)) {
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
      if (testCaseFinished.testResult.willBeRetried) {
        const stepsToRetry = testCaseAttempt.pickle.steps.length
        this.progressBar.tick(-stepsToRetry)
      }
    }
  }

  logSummary(testRun) {
    this.log(
      formatSummary({
        colorFns: this.colorFns,
        testCaseAttempts: this.eventDataCollector.getTestCaseAttempts(),
        testRun,
      })
    )
  }

  parseEnvelope(envelope) {
    if (envelope.pickleAccepted) {
      this.incrementStepCount(envelope.pickleAccepted.pickleId)
    } else if (envelope.testStepStarted) {
      this.initializeProgressBar()
    } else if (envelope.testStepFinished) {
      this.logProgress(envelope.testStepFinished)
    } else if (envelope.testCaseFinished) {
      this.logErrorIfNeeded(envelope.testCaseFinished)
    } else if (envelope.testRunFinished) {
      this.logSummary(envelope.testRunFinished)
    }
  }
}
