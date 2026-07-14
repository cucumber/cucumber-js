import type { EventEmitter } from 'node:events'
import {
  type Attachment,
  type Envelope,
  type GherkinDocument,
  getWorstTestStepResult,
  type Pickle,
  type TestCase,
  type TestCaseFinished,
  type TestCaseStarted,
  type TestStepFinished,
  type TestStepResult,
  TestStepResultStatus,
  type UndefinedParameterType,
} from '@cucumber/messages'
import { doesHaveValue, doesNotHaveValue } from '../../value_checker'

interface ITestCaseAttemptData {
  attempt: number
  willBeRetried: boolean
  testCaseId: string
  stepAttachments: Record<string, Attachment[]>
  stepResults: Record<string, TestStepResult>
  worstTestStepResult: TestStepResult
}

export interface ITestCaseAttempt {
  attempt: number
  willBeRetried: boolean
  gherkinDocument: GherkinDocument
  pickle: Pickle
  stepAttachments: Record<string, Attachment[]>
  stepResults: Record<string, TestStepResult>
  testCase: TestCase
  worstTestStepResult: TestStepResult
}

export default class EventDataCollector {
  private gherkinDocumentMap: Record<string, GherkinDocument> = {}
  private pickleMap: Record<string, Pickle> = {}
  private testCaseMap: Record<string, TestCase> = {}
  private testCaseAttemptDataMap: Record<string, ITestCaseAttemptData> = {}
  readonly undefinedParameterTypes: UndefinedParameterType[] = []

  constructor(eventBroadcaster: EventEmitter) {
    eventBroadcaster.on('envelope', this.parseEnvelope.bind(this))
  }

  getGherkinDocument(uri: string): GherkinDocument {
    return this.gherkinDocumentMap[uri]
  }

  getPickle(pickleId: string): Pickle {
    return this.pickleMap[pickleId]
  }

  getTestCaseAttempts(): ITestCaseAttempt[] {
    return Object.keys(this.testCaseAttemptDataMap).map((testCaseStartedId) => {
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
      willBeRetried: testCaseAttemptData.willBeRetried,
      stepAttachments: testCaseAttemptData.stepAttachments,
      stepResults: testCaseAttemptData.stepResults,
      worstTestStepResult: testCaseAttemptData.worstTestStepResult,
    }
  }

  parseEnvelope(envelope: Envelope): void {
    if (doesHaveValue(envelope.gherkinDocument)) {
      this.gherkinDocumentMap[envelope.gherkinDocument.uri] = envelope.gherkinDocument
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

  private initTestCaseAttempt(testCaseStarted: TestCaseStarted): void {
    // pre-seed a fallback UNKNOWN result for every step
    const stepResults: Record<string, TestStepResult> = {}
    for (const testStep of this.testCaseMap[testCaseStarted.testCaseId].testSteps) {
      stepResults[testStep.id] = {
        duration: { seconds: 0, nanos: 0 },
        status: TestStepResultStatus.UNKNOWN,
      }
    }
    this.testCaseAttemptDataMap[testCaseStarted.id] = {
      attempt: testCaseStarted.attempt,
      willBeRetried: false,
      testCaseId: testCaseStarted.testCaseId,
      stepAttachments: {},
      stepResults,
      worstTestStepResult: {
        duration: { seconds: 0, nanos: 0 },
        status: TestStepResultStatus.UNKNOWN,
      },
    }
  }

  storeAttachment(attachment: Attachment): void {
    const { testCaseStartedId, testStepId } = attachment
    if (doesHaveValue(testCaseStartedId) && doesHaveValue(testStepId)) {
      const { stepAttachments } = this.testCaseAttemptDataMap[testCaseStartedId]
      if (doesNotHaveValue(stepAttachments[testStepId])) {
        stepAttachments[testStepId] = []
      }
      stepAttachments[testStepId].push(attachment)
    }
  }

  storeTestStepResult({ testCaseStartedId, testStepId, testStepResult }: TestStepFinished): void {
    this.testCaseAttemptDataMap[testCaseStartedId].stepResults[testStepId] = testStepResult
  }

  storeTestCaseResult({ testCaseStartedId, willBeRetried }: TestCaseFinished): void {
    const stepResults = Object.values(this.testCaseAttemptDataMap[testCaseStartedId].stepResults)
    this.testCaseAttemptDataMap[testCaseStartedId].worstTestStepResult =
      getWorstTestStepResult(stepResults)
    this.testCaseAttemptDataMap[testCaseStartedId].willBeRetried = willBeRetried
  }
}
