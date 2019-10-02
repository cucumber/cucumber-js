import _ from 'lodash'
import { getStepLineToKeywordMap } from '../../src/formatter/helpers/gherkin_document_parser'
import {
  getPickleStepLine,
  getStepKeyword,
  getStepLineToPickledStepMap,
} from '../../src/formatter/helpers/pickle_parser'

export function getPickleNamesInOrderOfExecution(events) {
  const pickleLocationToName = _.chain(events)
    .filter(['type', 'pickle-accepted'])
    .map(e =>
      e.locations.map(location => [`${e.uri}:${location.line}`, e.name])
    )
    .flatten()
    .fromPairs()
    .value()
  return _.chain(events)
    .filter(['type', 'test-case-started'])
    .map(e => {
      const location = `${e.sourceLocation.uri}:${e.sourceLocation.line}`
      return pickleLocationToName[location]
    })
    .value()
}

export function getPickleStep(events, pickleName, stepText) {
  const pickleEvent = getPickleAcceptedEvent(events, pickleName)
  const gherkinDocumentEvent = getGherkinDocumentEvent(events, pickleEvent)
  return getPickleStepByStepText(pickleEvent, gherkinDocumentEvent, stepText)
}

export function getTestCaseResult(events, pickleName) {
  const pickleEvent = getPickleAcceptedEvent(events, pickleName)
  const testCaseFinishedEvent = getTestCaseEvent(
    events,
    'test-case-finished',
    pickleEvent
  )
  return testCaseFinishedEvent.result
}

export function getTestStepResults(events, pickleName) {
  const pickleEvent = getPickleAcceptedEvent(events, pickleName)
  const gherkinDocumentEvent = getGherkinDocumentEvent(events, pickleEvent)
  const testCasePreparedEvent = getTestCasePreparedEvent(events, pickleEvent)
  const testStepIndexToResult = _.chain(events)
    .filter(['type', 'test-step-finished'])
    .filter(e =>
      _.isEqual(e.testCase.sourceLocation, testCasePreparedEvent.sourceLocation)
    )
    .map(e => [e.index, e.result])
    .fromPairs()
    .value()
  const stepLineToKeywordMap = getStepLineToKeywordMap(gherkinDocumentEvent)
  const stepLineToPickleStepMap = getStepLineToPickledStepMap(pickleEvent)
  let isBeforeHook = true
  return testCasePreparedEvent.steps.map((s, index) => {
    let text = ''
    if (!s.sourceLocation) {
      text = isBeforeHook ? 'Before' : 'After'
    } else {
      isBeforeHook = false
      const pickleStep = stepLineToPickleStepMap[s.sourceLocation.line]
      const keyword = getStepKeyword({ pickleStep, stepLineToKeywordMap })
      text = `${keyword}${pickleStep.text}`
    }
    return { text, result: testStepIndexToResult[index] }
  })
}

export function getTestStepAttachmentEvents(events, pickleName, stepText) {
  const pickleEvent = getPickleAcceptedEvent(events, pickleName)
  const gherkinDocumentEvent = getGherkinDocumentEvent(events, pickleEvent)
  const pickleStep = getPickleStepByStepText(
    pickleEvent,
    gherkinDocumentEvent,
    stepText
  )
  const pickleStepLine = getPickleStepLine(pickleStep)
  const testCasePreparedEvent = getTestCasePreparedEvent(events, pickleEvent)
  const testStepIndex = _.findIndex(
    testCasePreparedEvent.steps,
    s => s.sourceLocation.line === pickleStepLine
  )
  return getTestStepAttachmentEventsForIndex(
    events,
    testCasePreparedEvent,
    testStepIndex
  )
}

export function getTestStepAttachmentEventsForHook(
  events,
  pickleName,
  isBeforeHook
) {
  const pickleEvent = getPickleAcceptedEvent(events, pickleName)
  const testCasePreparedEvent = getTestCasePreparedEvent(events, pickleEvent)
  const testStepIndex = isBeforeHook
    ? 0
    : testCasePreparedEvent.steps.length - 1
  return getTestStepAttachmentEventsForIndex(
    events,
    testCasePreparedEvent,
    testStepIndex
  )
}

function getPickleAcceptedEvent(events, pickleName) {
  const pickleEvent = _.find(
    events,
    e => e.type === 'pickle-accepted' && e.name === pickleName
  )
  return pickleEvent
}

function getGherkinDocumentEvent(events, pickleEvent) {
  return _.find(
    events,
    e => e.type === 'gherkin-document' && e.uri === pickleEvent.uri
  )
}

function getTestCasePreparedEvent(events, pickleEvent) {
  return getTestCaseEvent(events, 'test-case-prepared', pickleEvent)
}

function getTestCaseEvent(events, eventName, pickleEvent) {
  return _.find(
    events,
    e =>
      e.type === eventName &&
      e.sourceLocation.uri === pickleEvent.uri &&
      _.some(pickleEvent.locations, l => l.line === e.sourceLocation.line)
  )
}

function getPickleStepByStepText(pickleEvent, gherkinDocumentEvent, stepText) {
  const stepLineToKeywordMap = getStepLineToKeywordMap(gherkinDocumentEvent)
  return _.find(pickleEvent.steps, s => {
    const keyword = getStepKeyword({ pickleStep: s, stepLineToKeywordMap })
    return `${keyword}${s.text}` === stepText
  })
}

function getTestStepAttachmentEventsForIndex(
  events,
  testCasePreparedEvent,
  testStepIndex
) {
  return _.filter(
    events,
    e =>
      e.type === 'test-step-attachment' &&
      _.isEqual(
        e.testCase.sourceLocation,
        testCasePreparedEvent.sourceLocation
      ) &&
      e.index === testStepIndex
  )
}
