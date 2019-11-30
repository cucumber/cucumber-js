import _ from 'lodash'
import {
  getStepLineToKeywordMap,
  getGherkinStepMap,
} from '../../src/formatter/helpers/gherkin_document_parser'
import {
  getStepKeyword,
  getPickleStepMap,
} from '../../src/formatter/helpers/pickle_parser'
import util from 'util'

export function getPickleNamesInOrderOfExecution(envelopes) {
  const pickleNameMap = _.chain(envelopes)
    .filter(e => e.pickle)
    .map(e => [e.pickle.id, e.pickle.name])
    .fromPairs()
    .value()
  const testCaseToPickleNameMap = _.chain(envelopes)
    .filter(e => e.testCase)
    .map(e => [e.testCase.id, pickleNameMap[e.testCase.pickleId]])
    .fromPairs()
    .value()
  return _.chain(envelopes)
    .filter(e => e.testCaseStarted)
    .map(e => testCaseToPickleNameMap[e.testCaseStarted.testCaseId])
    .value()
}

export function getPickleStep(events, pickleName, stepText) {
  const pickleEvent = getPickleAcceptedEvent(events, pickleName)
  const gherkinDocumentEvent = getGherkinDocumentEvent(events, pickleEvent)
  return getPickleStepByStepText(pickleEvent, gherkinDocumentEvent, stepText)
}

export function getTestCaseResult(envelopes, pickleName) {
  const pickle = getAcceptedPickle(envelopes, pickleName)
  const testCase = getTestCase(envelopes, pickle.id)
  const testCaseStartedId = getTestCaseStarted(envelopes, testCase.id).id
  const testCaseFinishedEnvelope = _.find(
    envelopes,
    e =>
      e.testCaseFinished &&
      e.testCaseFinished.testCaseStartedId === testCaseStartedId
  )
  return testCaseFinishedEnvelope.testCaseFinished.testResult
}

export function getTestStepResults(envelopes, pickleName) {
  const pickle = getAcceptedPickle(envelopes, pickleName)
  const gherkinDocument = getGherkinDocument(envelopes, pickle.uri)
  const testCase = getTestCase(envelopes, pickle.id)
  const testCaseStartedId = getTestCaseStarted(envelopes, testCase.id).id
  const testStepIdToResultMap = _.chain(envelopes)
    .filter(
      e =>
        e.testStepFinished &&
        e.testStepFinished.testCaseStartedId == testCaseStartedId
    )
    .map(e => [e.testStepFinished.testStepId, e.testStepFinished.testResult])
    .fromPairs()
    .value()
  const gherkinStepMap = getGherkinStepMap(gherkinDocument)
  const pickleStepMap = getPickleStepMap(pickle)
  let isBeforeHook = true
  return testCase.testSteps.map(testStep => {
    let text = ''
    if (!testStep.pickleStepId) {
      text = isBeforeHook ? 'Before' : 'After'
    } else {
      isBeforeHook = false
      const pickleStep = pickleStepMap[testStep.pickleStepId]
      const keyword = getStepKeyword({ pickleStep, gherkinStepMap })
      text = `${keyword}${pickleStep.text}`
    }
    return { text, result: testStepIdToResultMap[testStep.id] }
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
  const testCasePreparedEvent = getTestCasePreparedEvent(events, pickleEvent)
  const testStepIndex = _.findIndex(
    testCasePreparedEvent.steps,
    s => s.pickleStepId === pickleStep.id
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

function getAcceptedPickle(envelopes, pickleName) {
  const pickleEnvelope = _.find(
    envelopes,
    e => e.pickle && e.pickle.name === pickleName
  )
  if (!pickleEnvelope) {
    throw new Error(
      `No pickle with name "${pickleName}" in envelopes:\n ${util.inspect(
        envelopes
      )}`
    )
  }
  const acceptedPickleEnvelope = _.find(
    envelopes,
    e =>
      e.pickleAccepted && e.pickleAccepted.pickleId == pickleEnvelope.pickle.id
  )
  if (!acceptedPickleEnvelope) {
    throw new Error(
      `Pickle with name "${pickleName}" not accepted in envelopes:\n ${util.inspect(
        envelopes
      )}`
    )
  }
  return pickleEnvelope.pickle
}

function getGherkinDocument(envelopes, uri) {
  const gherkinDocumentEnvelope = _.find(
    envelopes,
    e => e.gherkinDocument && e.gherkinDocument.uri === uri
  )
  if (!gherkinDocumentEnvelope) {
    throw new Error(
      `No gherkinDocument with uri "${uri}" in envelopes:\n ${util.inspect(
        envelopes
      )}`
    )
  }
  return gherkinDocumentEnvelope.gherkinDocument
}

function getTestCase(envelopes, pickleId) {
  const testCaseEnvelope = _.find(
    envelopes,
    e => e.testCase && e.testCase.pickleId === pickleId
  )
  if (!testCaseEnvelope) {
    throw new Error(
      `No testCase with pickleId "${pickleId}" in envelopes:\n ${util.inspect(
        envelopes
      )}`
    )
  }
  return testCaseEnvelope.testCase
}

function getTestCaseStarted(envelopes, testCaseId) {
  const testCaseStartedEnvelope = _.find(
    envelopes,
    e => e.testCaseStarted && e.testCaseStarted.testCaseId === testCaseId
  )
  if (!testCaseStartedEnvelope) {
    throw new Error(
      `No testCaseStarted with testCaseId "${testCaseId}" in envelopes:\n ${util.inspect(
        envelopes
      )}`
    )
  }
  return testCaseStartedEnvelope.testCaseStarted
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
