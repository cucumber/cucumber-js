import { getStepLineToKeywordMap } from './gherkin_document_parser'
import { getStepLineToPickledStepMap } from './pickle_parser'

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
    this.pickleMap = {} // uri:line to {pickle, uri}
    this.testCaseMap = {} // uri:line to {sourceLocation, steps}
    this.testCaseAttemptMap = {} // uri:line:attemptNumber to {result, stepAttachments, stepResults, testCase}
  }

  getTestCaseKey({ uri, line }) {
    return `${uri}:${line}`
  }

  getTestCaseAttemptKey({ attemptNumber, sourceLocation: { uri, line } }) {
    return `${uri}:${line}:${attemptNumber}`
  }

  getTestCaseData(sourceLocation) {
    return {
      gherkinDocument: this.gherkinDocumentMap[sourceLocation.uri],
      pickle: this.pickleMap[this.getTestCaseKey(sourceLocation)],
      testCase: this.testCaseMap[this.getTestCaseKey(sourceLocation)],
    }
  }

  getTestStepData({ testCase: { sourceLocation }, index }) {
    const { gherkinDocument, pickle, testCase } = this.getTestCaseData(
      sourceLocation
    )
    const result = { testStep: testCase.steps[index] }
    if (result.testStep.sourceLocation) {
      const { line } = result.testStep.sourceLocation
      result.gherkinKeyword = getStepLineToKeywordMap(gherkinDocument)[line]
      result.pickleStep = getStepLineToPickledStepMap(pickle)[line]
    }
    return result
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
      testCase,
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
