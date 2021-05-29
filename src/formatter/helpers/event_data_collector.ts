import _, { values } from 'lodash'
import * as messages from '@cucumber/messages'
import { doesHaveValue, doesNotHaveValue } from '../../value_checker'
import { EventEmitter } from 'events'

interface ITestCaseAttemptData {
  attempt: number
  testCaseId: string
  stepAttachments: Record<string, messages.Attachment[]>
  stepResults: Record<string, messages.TestStepResult>
  worstTestStepResult: messages.TestStepResult
}

export interface ITestCaseAttempt {
  attempt: number
  gherkinDocument: messages.GherkinDocument
  pickle: messages.Pickle
  stepAttachments: Record<string, messages.Attachment[]>
  stepResults: Record<string, messages.TestStepResult>
  testCase: messages.TestCase
  worstTestStepResult: messages.TestStepResult
}

export default class EventDataCollector {
  private gherkinDocumentMap: Record<string, messages.GherkinDocument> = {}
  private pickleMap: Record<string, messages.Pickle> = {}
  private testCaseMap: Record<string, messages.TestCase> = {}
  private testCaseAttemptDataMap: Record<string, ITestCaseAttemptData> = {}
  readonly undefinedParameterTypes: messages.UndefinedParameterType[] = []

  constructor(eventBroadcaster: EventEmitter) {
    eventBroadcaster.on('envelope', this.parseEnvelope.bind(this))
  }

  getGherkinDocument(uri: string): messages.GherkinDocument {
    return this.gherkinDocumentMap[uri]
  }

  getPickle(pickleId: string): messages.Pickle {
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
      stepAttachments: testCaseAttemptData.stepAttachments,
      stepResults: testCaseAttemptData.stepResults,
      worstTestStepResult: testCaseAttemptData.worstTestStepResult,
    }
  }

  parseEnvelope(envelope: messages.Envelope): void {
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

  private initTestCaseAttempt(testCaseStarted: messages.TestCaseStarted): void {
    this.testCaseAttemptDataMap[testCaseStarted.id] = {
      attempt: testCaseStarted.attempt,
      testCaseId: testCaseStarted.testCaseId,
      stepAttachments: {},
      stepResults: {},
      worstTestStepResult: {
        willBeRetried: false,
        duration: { seconds: 0, nanos: 0 },
        status: messages.TestStepResultStatus.UNKNOWN,
      },
    }
  }

  storeAttachment(attachment: messages.Attachment): void {
    const { testCaseStartedId, testStepId } = attachment
    // TODO: we shouldn't have to check if these properties have values - they are non-nullable
    if (doesHaveValue(testCaseStartedId) && doesHaveValue(testStepId)) {
      const { stepAttachments } = this.testCaseAttemptDataMap[testCaseStartedId]
      if (doesNotHaveValue(stepAttachments[testStepId])) {
        stepAttachments[testStepId] = []
      }
      stepAttachments[testStepId].push(attachment)
    }
  }

  storeTestStepResult({
    testCaseStartedId,
    testStepId,
    testStepResult,
  }: messages.TestStepFinished): void {
    this.testCaseAttemptDataMap[testCaseStartedId].stepResults[
      testStepId
    ] = testStepResult
  }

  storeTestCaseResult({ testCaseStartedId }: messages.TestCaseFinished): void {
    const stepResults = values(
      this.testCaseAttemptDataMap[testCaseStartedId].stepResults
    )
    this.testCaseAttemptDataMap[
      testCaseStartedId
    ].worstTestStepResult = messages.getWorstTestStepResult(stepResults)
  }
}
