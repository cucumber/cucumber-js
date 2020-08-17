import _, { Dictionary, values } from 'lodash'
import { messages } from '@cucumber/messages'
import { doesHaveValue, doesNotHaveValue } from '../../value_checker'
import { EventEmitter } from 'events'
import { Query } from '@cucumber/query'

interface ITestCaseAttemptData {
  attempt: number
  testCaseId: string
  result: messages.TestStepFinished.ITestStepResult
  stepAttachments: Dictionary<messages.IAttachment[]>
  stepResults: Dictionary<messages.TestStepFinished.ITestStepResult>
}

export interface ITestCaseAttempt {
  attempt: number
  gherkinDocument: messages.IGherkinDocument
  pickle: messages.IPickle
  result: messages.TestStepFinished.ITestStepResult
  stepAttachments: Dictionary<messages.IAttachment[]>
  stepResults: Dictionary<messages.TestStepFinished.ITestStepResult>
  testCase: messages.ITestCase
}

export default class EventDataCollector {
  private gherkinDocumentMap: Dictionary<messages.IGherkinDocument> = {}
  private pickleMap: Dictionary<messages.IPickle> = {}
  private testCaseMap: Dictionary<messages.ITestCase> = {}
  private testCaseAttemptDataMap: Dictionary<ITestCaseAttemptData> = {}
  readonly undefinedParameterTypes: messages.IUndefinedParameterType[] = []
  readonly query = new Query()

  constructor(eventBroadcaster: EventEmitter) {
    eventBroadcaster.on('envelope', this.parseEnvelope.bind(this))
  }

  getGherkinDocument(uri: string): messages.IGherkinDocument {
    return this.gherkinDocumentMap[uri]
  }

  getPickle(pickleId: string): messages.IPickle {
    return this.pickleMap[pickleId]
  }

  getTestCaseAttempts(): ITestCaseAttempt[] {
    return _.keys(this.testCaseAttemptDataMap).map((testCaseStartedId) => {
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

  parseEnvelope(envelope: messages.Envelope): void {
    this.query.update(envelope)
    if (doesHaveValue(envelope.gherkinDocument)) {
      this.gherkinDocumentMap[envelope.gherkinDocument.uri] =
        envelope.gherkinDocument
    } else if (doesHaveValue(envelope.pickle)) {
      this.pickleMap[envelope.pickle.id] = envelope.pickle
    } else if (doesHaveValue(envelope.undefinedParameterType)) {
      this.undefinedParameterTypes.push(envelope.undefinedParameterType)
    } else if (doesHaveValue(envelope.testCase)) {
      this.testCaseMap[envelope.testCase.id] = envelope.testCase
    } else if (doesHaveValue(envelope.testCaseStarted)) {
      this.initTestCaseAttempt(envelope.testCaseStarted)
    } else if (doesHaveValue(envelope.attachment)) {
      this.storeAttachment(envelope.attachment)
    } else if (doesHaveValue(envelope.testStepFinished)) {
      this.storeTestStepResult(envelope.testStepFinished)
    } else if (doesHaveValue(envelope.testCaseFinished)) {
      this.storeTestCaseResult(envelope.testCaseFinished)
    }
  }

  initTestCaseAttempt(testCaseStarted: messages.ITestCaseStarted): void {
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
    body,
    mediaType,
  }: messages.IAttachment): void {
    if (doesHaveValue(testCaseStartedId) && doesHaveValue(testStepId)) {
      const { stepAttachments } = this.testCaseAttemptDataMap[testCaseStartedId]
      if (doesNotHaveValue(stepAttachments[testStepId])) {
        stepAttachments[testStepId] = []
      }
      stepAttachments[testStepId].push({ body, mediaType })
    }
  }

  storeTestStepResult({
    testCaseStartedId,
    testStepId,
    testStepResult,
  }: messages.ITestStepFinished): void {
    this.testCaseAttemptDataMap[testCaseStartedId].stepResults[
      testStepId
    ] = testStepResult
  }

  storeTestCaseResult({ testCaseStartedId }: messages.ITestCaseFinished): void {
    const stepResults = values(
      this.testCaseAttemptDataMap[testCaseStartedId].stepResults
    )
    this.testCaseAttemptDataMap[
      testCaseStartedId
    ].result = this.query.getWorstTestStepResult(stepResults)
  }
}
