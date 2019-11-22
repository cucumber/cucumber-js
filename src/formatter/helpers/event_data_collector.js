import _ from 'lodash'

export default class EventDataCollector {
  constructor(eventBroadcaster) {
    eventBroadcaster.on('envelope', ::this.parseEnvelope)
    this.gherkinDocumentMap = {} // uri to gherkinDocument
    this.pickleMap = {} // pickleId to pickle
    this.testCaseMap = {} // testCaseId to {pickleId, testSteps}
    this.testCaseAttemptMap = {} // testCaseStartedId to {attemptNumber, testCaseId, result, stepAttachments, stepResults}
  }

  getTestCaseAttempts() {
    return _.keys(this.testCaseAttemptMap).map(testCaseStartedId => {
      return this.getTestCaseAttempt(testCaseStartedId)
    })
  }

  getTestCaseAttempt(testCaseStartedId) {
    const testCaseAttempt = this.testCaseAttemptMap[testCaseStartedId]
    const testCase = this.testCaseMap[testCaseAttempt.testCaseId]
    const pickle = this.pickleMap[testCase.pickleId]
    return {
      gherkinDocument: this.gherkinDocumentMap[pickle.uri],
      pickle,
      testCase,
      attempt: testCaseAttempt.attempt,
      result: testCaseAttempt.result,
      stepAttachments: testCaseAttempt.stepAttachments,
      stepResults: testCaseAttempt.stepResults,
    }
  }

  parseEnvelope(envelope) {
    if (envelope.gherkinDocument) {
      this.gherkinDocumentMap[envelope.gherkinDocument.uri] =
        envelope.gherkinDocument
    } else if (envelope.pickle) {
      this.pickleMap[envelope.pickle.id] = envelope.pickle
    } else if (envelope.testCase) {
      this.testCaseMap[envelope.testCase.id] = envelope.testCase
    } else if (envelope.testCaseStarted) {
      this.initTestCaseAttempt(envelope.testCaseStarted)
    } else if (envelope.testStepAttachment) {
      this.storeTestStepAttachment(envelope.testStepAttachment)
    } else if (envelope.testStepFinished) {
      this.storeTestStepResult(envelope.testStepFinished)
    } else if (envelope.testCaseFinished) {
      this.storeTestCaseResult(envelope.testCaseFinished)
    }
  }

  initTestCaseAttempt(testCaseStarted) {
    this.testCaseAttemptMap[testCaseStarted.id] = {
      attempt: testCaseStarted.attempt,
      testCaseId: testCaseStarted.testCaseId,
      result: {},
      stepAttachments: {},
      stepResults: {},
    }
  }

  storeTestStepAttachment({ testCaseStartedId, testStepId, data, media }) {
    const { stepAttachments } = this.testCaseAttemptMap[testCaseStartedId]
    if (!stepAttachments[testStepId]) {
      stepAttachments[testStepId] = []
    }
    stepAttachments[testStepId].push({ data, media })
  }

  storeTestStepResult({ testCaseStartedId, testStepId, testResult }) {
    this.testCaseAttemptMap[testCaseStartedId].stepResults[
      testStepId
    ] = testResult
  }

  storeTestCaseResult({ testCaseStartedId, testResult }) {
    this.testCaseAttemptMap[testCaseStartedId].result = testResult
  }
}
