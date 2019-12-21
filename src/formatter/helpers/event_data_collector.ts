import _, { Dictionary } from 'lodash'
import { messages } from 'cucumber-messages'

interface ITestCaseAttemptData {
  attempt: number
  testCaseId: string
  result: messages.ITestResult
  stepAttachments: Dictionary<messages.IAttachment[]>
  stepResults: Dictionary<messages.ITestResult>
}

export interface ITestCaseAttempt {
  attempt: number
  gherkinDocument: messages.IGherkinDocument
  pickle: messages.IPickle
  result: messages.ITestResult
  stepAttachments: Dictionary<messages.IAttachment[]>
  stepResults: Dictionary<messages.ITestResult>
  testCase: messages.ITestCase
}

export default class EventDataCollector {
  private gherkinDocumentMap: Dictionary<messages.IGherkinDocument> = {}
  private pickleMap: Dictionary<messages.IPickle> = {}
  private testCaseMap: Dictionary<messages.ITestCase> = {}
  private testCaseAttemptDataMap: Dictionary<ITestCaseAttemptData> = {}

  constructor(eventBroadcaster) {
    eventBroadcaster.on('envelope', this.parseEnvelope.bind(this))
  }

  getGherkinDocument(uri: string): messages.IGherkinDocument {
    return this.gherkinDocumentMap[uri]
  }

  getPickle(pickleId: string): messages.IPickle {
    return this.pickleMap[pickleId]
  }

  getTestCaseAttempts(): ITestCaseAttempt[] {
    return _.keys(this.testCaseAttemptDataMap).map(testCaseStartedId => {
      return this.getTestCaseAttempt(testCaseStartedId)
    })
  }

  getTestCaseAttempt(testCaseStartedId: string): ITestCaseAttempt {
    const testCaseAttemptData = this.testCaseAttemptDataMap[testCaseStartedId]
    const testCase = this.testCaseMap[testCaseAttemptData.testCaseId]
    const pickle = this.pickleMap[testCase.pickleId]
    return {
      gherkinDocument: this.gherkinDocumentMap[pickle.uri],
      pickle,
      testCase,
      attempt: testCaseAttemptData.attempt,
      result: testCaseAttemptData.result,
      stepAttachments: testCaseAttemptData.stepAttachments,
      stepResults: testCaseAttemptData.stepResults,
    }
  }

  getTestRunDuration() {
    return _.chain(this.testCaseAttemptDataMap)
      .map(testCaseAttemptData => testCaseAttemptData.result.duration)
      .sum()
  }

  parseEnvelope(envelope: messages.Envelope) {
    if (envelope.gherkinDocument) {
      this.gherkinDocumentMap[envelope.gherkinDocument.uri] =
        envelope.gherkinDocument
    } else if (envelope.pickle) {
      this.pickleMap[envelope.pickle.id] = envelope.pickle
    } else if (envelope.testCase) {
      this.testCaseMap[envelope.testCase.id] = envelope.testCase
    } else if (envelope.testCaseStarted) {
      this.initTestCaseAttempt(envelope.testCaseStarted)
    } else if (envelope.attachment) {
      this.storeAttachment(envelope.attachment)
    } else if (envelope.testStepFinished) {
      this.storeTestStepResult(envelope.testStepFinished)
    } else if (envelope.testCaseFinished) {
      this.storeTestCaseResult(envelope.testCaseFinished)
    }
  }

  initTestCaseAttempt(testCaseStarted: messages.ITestCaseStarted) {
    this.testCaseAttemptDataMap[testCaseStarted.id] = {
      attempt: testCaseStarted.attempt,
      testCaseId: testCaseStarted.testCaseId,
      result: {},
      stepAttachments: {},
      stepResults: {},
    }
  }

  storeAttachment({
    testCaseStartedId,
    testStepId,
    data,
    media,
  }: messages.IAttachment) {
    if (testCaseStartedId && testStepId) {
      const { stepAttachments } = this.testCaseAttemptDataMap[testCaseStartedId]
      if (!stepAttachments[testStepId]) {
        stepAttachments[testStepId] = []
      }
      stepAttachments[testStepId].push({ data, media })
    }
  }

  storeTestStepResult({
    testCaseStartedId,
    testStepId,
    testResult,
  }: messages.ITestStepFinished) {
    this.testCaseAttemptDataMap[testCaseStartedId].stepResults[
      testStepId
    ] = testResult
  }

  storeTestCaseResult({
    testCaseStartedId,
    testResult,
  }: messages.ITestCaseFinished) {
    this.testCaseAttemptDataMap[testCaseStartedId].result = testResult
  }
}
