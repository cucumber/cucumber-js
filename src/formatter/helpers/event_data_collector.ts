import _ from 'lodash'
import { messages } from 'cucumber-messages'

interface IGherkinDocumentMap {
  [uri: string]: messages.IGherkinDocument
}

interface IPickleMap {
  [pickleId: string]: messages.IPickle
}

interface ITestCaseMap {
  [testCaseId: string]: messages.ITestCase
}

interface ITestStepAttachmentsMap {
  [testStepId: string]: messages.IAttachment[]
}

interface ITestStepResultMap {
  [testStepId: string]: messages.ITestResult
}

interface ITestCaseAttemptData {
  attempt: number
  testCaseId: string
  result: messages.ITestResult
  stepAttachments: ITestStepAttachmentsMap
  stepResults: ITestStepResultMap
}

interface ITestCaseAttemptDataMap {
  [testCaseStartedId: string]: ITestCaseAttemptData
}

export interface ITestCaseAttempt {
  attempt: number
  gherkinDocument: messages.IGherkinDocument
  pickle: messages.IPickle
  result: messages.ITestResult
  stepAttachments: ITestStepAttachmentsMap
  stepResults: ITestStepResultMap
  testCase: messages.ITestCase
}

export default class EventDataCollector {
  private gherkinDocumentMap: IGherkinDocumentMap
  private pickleMap: IPickleMap
  private testCaseMap: ITestCaseMap
  private testCaseAttemptMap: ITestCaseAttemptDataMap

  constructor(eventBroadcaster) {
    eventBroadcaster.on('envelope', this.parseEnvelope.bind(this))
    this.gherkinDocumentMap = {}
    this.pickleMap = {}
    this.testCaseMap = {}
    this.testCaseAttemptMap = {}
  }

  getGherkinDocument(uri: string): messages.IGherkinDocument {
    return this.gherkinDocumentMap[uri]
  }

  getPickle(pickleId: string): messages.IPickle {
    return this.pickleMap[pickleId]
  }

  getTestCaseAttempts(): ITestCaseAttempt[] {
    return _.keys(this.testCaseAttemptMap).map(testCaseStartedId => {
      return this.getTestCaseAttempt(testCaseStartedId)
    })
  }

  getTestCaseAttempt(testCaseStartedId: string): ITestCaseAttempt {
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

  getTestRunDuration() {
    return _.chain(this.testCaseAttemptMap)
      .map(testCaseAttempt => testCaseAttempt.result.duration)
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
    this.testCaseAttemptMap[testCaseStarted.id] = {
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
      const { stepAttachments } = this.testCaseAttemptMap[testCaseStartedId]
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
    this.testCaseAttemptMap[testCaseStartedId].stepResults[
      testStepId
    ] = testResult
  }

  storeTestCaseResult({
    testCaseStartedId,
    testResult,
  }: messages.ITestCaseFinished) {
    this.testCaseAttemptMap[testCaseStartedId].result = testResult
  }
}
