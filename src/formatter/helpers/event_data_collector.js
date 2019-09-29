import _ from 'lodash'

export default class EventDataCollector {
  constructor(eventBroadcaster) {
    eventBroadcaster
      .on('gherkin-document', ::this.storeGherkinDocument)
      .on('pickle-accepted', ::this.storePickle)
      .on('test-case-prepared', ::this.storeTestCase)
      .on('test-step-attachment', ::this.storeTestStepAttachment)
      .on('test-case-started', ::this.initTestCaseResult)
      .on('test-step-finished', ::this.storeTestStepResult)
      .on('test-case-finished', ::this.storeTestCaseResult)
    this.gherkinDocumentMap = {} // uri to gherkinDocument
    this.pickleMap = {} // uri:line to pickle
    this.testCaseMap = {} // uri:line to {sourceLocation, steps}
    this.testCaseAttemptMap = {} // uri:line:attemptNumber to {result, stepAttachments, stepResults}
  }

  export() {
    return {
      gherkinDocumentMap: this.gherkinDocumentMap,
      pickleMap: this.pickleMap,
      testCaseMap: this.testCaseMap,
      testCaseAttemptMap: this.testCaseAttemptMap,
    }
  }

  getCollatedEvents() {
    return _.keys(this.testCaseAttemptMap).map(testCaseAttemptKey => {
      const [uri, line] = testCaseAttemptKey.split(':')
      const testCaseKey = this.getTestCaseKey({ uri, line })
      return this.internalGetCollatedEvent({
        uri,
        testCaseKey,
        testCaseAttemptKey,
      })
    })
  }

  getCollatedEvent({ attemptNumber, sourceLocation }) {
    const testCaseKey = this.getTestCaseKey(sourceLocation)
    const testCaseAttemptKey = this.getTestCaseAttemptKey({
      attemptNumber,
      sourceLocation,
    })
    return this.internalGetCollatedEvent({
      uri: sourceLocation.uri,
      testCaseKey,
      testCaseAttemptKey,
    })
  }

  internalGetCollatedEvent({ uri, testCaseKey, testCaseAttemptKey }) {
    return {
      gherkinDocument: this.gherkinDocumentMap[uri],
      pickle: this.pickleMap[testCaseKey],
      testCase: this.testCaseMap[testCaseKey],
      testCaseAttempt: this.testCaseAttemptMap[testCaseAttemptKey],
    }
  }

  getTestCaseKey({ uri, line }) {
    return `${uri}:${line}`
  }

  getTestCaseAttemptKey({ attemptNumber, sourceLocation: { uri, line } }) {
    return `${uri}:${line}:${attemptNumber}`
  }

  storeGherkinDocument({ document, uri }) {
    this.gherkinDocumentMap[uri] = document
  }

  storePickle({ pickle, uri }) {
    this.pickleMap[`${uri}:${pickle.locations[0].line}`] = pickle
  }

  storeTestCase({ sourceLocation, steps }) {
    const key = this.getTestCaseKey(sourceLocation)
    this.testCaseMap[key] = { sourceLocation, steps }
  }

  initTestCaseResult(testCaseStartedEvent) {
    const testCaseKey = this.getTestCaseKey(testCaseStartedEvent.sourceLocation)
    const testCase = this.testCaseMap[testCaseKey]
    const testCaseAttemptKey = this.getTestCaseAttemptKey(testCaseStartedEvent)
    this.testCaseAttemptMap[testCaseAttemptKey] = {
      attemptNumber: testCaseStartedEvent.attemptNumber,
      result: {},
      stepAttachments: testCase.steps.map(_ => []),
      stepResults: testCase.steps.map(_ => null),
    }
  }

  storeTestStepAttachment({ index, testCase, data, media }) {
    const key = this.getTestCaseAttemptKey(testCase)
    this.testCaseAttemptMap[key].stepAttachments[index].push({ data, media })
  }

  storeTestStepResult({ index, testCase, result }) {
    const key = this.getTestCaseAttemptKey(testCase)
    this.testCaseAttemptMap[key].stepResults[index] = result
  }

  storeTestCaseResult(testCaseFinishedEvent) {
    const key = this.getTestCaseAttemptKey(testCaseFinishedEvent)
    this.testCaseAttemptMap[key].result = testCaseFinishedEvent.result
  }
}
