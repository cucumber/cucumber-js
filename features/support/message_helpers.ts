import _, { Dictionary } from 'lodash'
import { getGherkinStepMap } from '../../src/formatter/helpers/gherkin_document_parser'
import {
  getPickleStepMap,
  getStepKeyword,
} from '../../src/formatter/helpers/pickle_parser'
import util from 'util'
import { messages } from '@cucumber/messages'
import { Query } from '@cucumber/query'
import { doesHaveValue, doesNotHaveValue } from '../../src/value_checker'

export interface IStepTextAndResult {
  text: string
  result: messages.TestStepFinished.ITestStepResult
}

export function getPickleNamesInOrderOfExecution(
  envelopes: messages.IEnvelope[]
): string[] {
  const pickleNameMap: Dictionary<string> = _.chain(envelopes)
    .filter(e => doesHaveValue(e.pickle))
    .map(e => [e.pickle.id, e.pickle.name])
    .fromPairs()
    .value()
  const testCaseToPickleNameMap: Dictionary<string> = _.chain(envelopes)
    .filter(e => doesHaveValue(e.testCase))
    .map(e => [e.testCase.id, pickleNameMap[e.testCase.pickleId]])
    .fromPairs()
    .value()
  return _.chain(envelopes)
    .filter(e => doesHaveValue(e.testCaseStarted))
    .map(e => testCaseToPickleNameMap[e.testCaseStarted.testCaseId])
    .value()
}

export function getPickleStep(
  envelopes: messages.IEnvelope[],
  pickleName: string,
  stepText: string
): messages.Pickle.IPickleStep {
  const pickle = getAcceptedPickle(envelopes, pickleName)
  const gherkinDocument = getGherkinDocument(envelopes, pickle.uri)
  return getPickleStepByStepText(pickle, gherkinDocument, stepText)
}

export function getTestCaseResult(
  envelopes: messages.IEnvelope[],
  pickleName: string
): messages.TestStepFinished.ITestStepResult {
  const query = new Query()
  envelopes.forEach(envelope => query.update(envelope))
  const pickle = getAcceptedPickle(envelopes, pickleName)
  return query.getWorstTestStepResult(
    query.getPickleTestStepResults([pickle.id])
  )
}

export function getTestStepResults(
  envelopes: messages.IEnvelope[],
  pickleName: string,
  attempt = 0
): IStepTextAndResult[] {
  const pickle = getAcceptedPickle(envelopes, pickleName)
  const gherkinDocument = getGherkinDocument(envelopes, pickle.uri)
  const testCase = getTestCase(envelopes, pickle.id)
  const testCaseStarted = getTestCaseStarted(envelopes, testCase.id, attempt)
  const testStepIdToResultMap = _.chain(envelopes)
    .filter(
      e =>
        doesHaveValue(e.testStepFinished) &&
        e.testStepFinished.testCaseStartedId === testCaseStarted.id
    )
    .map(e => [
      e.testStepFinished.testStepId,
      e.testStepFinished.testStepResult,
    ])
    .fromPairs()
    .value()
  const gherkinStepMap = getGherkinStepMap(gherkinDocument)
  const pickleStepMap = getPickleStepMap(pickle)
  let isBeforeHook = true
  return testCase.testSteps.map(testStep => {
    let text = ''
    if (testStep.pickleStepId === '') {
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

export function getTestStepAttachmentsForStep(
  envelopes: messages.IEnvelope[],
  pickleName: string,
  stepText: string
): messages.IAttachment[] {
  const pickle = getAcceptedPickle(envelopes, pickleName)
  const gherkinDocument = getGherkinDocument(envelopes, pickle.uri)
  const testCase = getTestCase(envelopes, pickle.id)
  const pickleStep = getPickleStepByStepText(pickle, gherkinDocument, stepText)
  const testStep = _.find(
    testCase.testSteps,
    s => s.pickleStepId === pickleStep.id
  )
  const testCaseStarted = getTestCaseStarted(envelopes, testCase.id)
  return getTestStepAttachments(envelopes, testCaseStarted.id, testStep.id)
}

export function getTestStepAttachmentsForHook(
  envelopes: messages.IEnvelope[],
  pickleName: string,
  isBeforeHook: boolean
): messages.IAttachment[] {
  const pickle = getAcceptedPickle(envelopes, pickleName)
  const testCase = getTestCase(envelopes, pickle.id)
  const testStepIndex = isBeforeHook ? 0 : testCase.testSteps.length - 1
  const testStep = testCase.testSteps[testStepIndex]
  const testCaseStarted = getTestCaseStarted(envelopes, testCase.id)
  return getTestStepAttachments(envelopes, testCaseStarted.id, testStep.id)
}

function getAcceptedPickle(
  envelopes: messages.IEnvelope[],
  pickleName: string
): messages.IPickle {
  const pickleEnvelope = _.find(
    envelopes,
    e => doesHaveValue(e.pickle) && e.pickle.name === pickleName
  )
  if (doesNotHaveValue(pickleEnvelope)) {
    throw new Error(
      `No pickle with name "${pickleName}" in envelopes:\n ${util.inspect(
        envelopes
      )}`
    )
  }
  return pickleEnvelope.pickle
}

function getGherkinDocument(
  envelopes: messages.IEnvelope[],
  uri: string
): messages.IGherkinDocument {
  const gherkinDocumentEnvelope = _.find(
    envelopes,
    e => doesHaveValue(e.gherkinDocument) && e.gherkinDocument.uri === uri
  )
  if (doesNotHaveValue(gherkinDocumentEnvelope)) {
    throw new Error(
      `No gherkinDocument with uri "${uri}" in envelopes:\n ${util.inspect(
        envelopes
      )}`
    )
  }
  return gherkinDocumentEnvelope.gherkinDocument
}

function getTestCase(
  envelopes: messages.IEnvelope[],
  pickleId: string
): messages.ITestCase {
  const testCaseEnvelope = _.find(
    envelopes,
    e => doesHaveValue(e.testCase) && e.testCase.pickleId === pickleId
  )
  if (doesNotHaveValue(testCaseEnvelope)) {
    throw new Error(
      `No testCase with pickleId "${pickleId}" in envelopes:\n ${util.inspect(
        envelopes
      )}`
    )
  }
  return testCaseEnvelope.testCase
}

function getTestCaseStarted(
  envelopes: messages.IEnvelope[],
  testCaseId: string,
  attempt = 0
): messages.ITestCaseStarted {
  const testCaseStartedEnvelope = _.find(
    envelopes,
    e =>
      doesHaveValue(e.testCaseStarted) &&
      e.testCaseStarted.testCaseId === testCaseId &&
      e.testCaseStarted.attempt === attempt
  )
  if (doesNotHaveValue(testCaseStartedEnvelope)) {
    throw new Error(
      `No testCaseStarted with testCaseId "${testCaseId}" in envelopes:\n ${util.inspect(
        envelopes
      )}`
    )
  }
  return testCaseStartedEnvelope.testCaseStarted
}

function getPickleStepByStepText(
  pickle: messages.IPickle,
  gherkinDocument: messages.IGherkinDocument,
  stepText: string
): messages.Pickle.IPickleStep {
  const gherkinStepMap = getGherkinStepMap(gherkinDocument)
  return _.find(pickle.steps, s => {
    const keyword = getStepKeyword({ pickleStep: s, gherkinStepMap })
    return `${keyword}${s.text}` === stepText
  })
}

function getTestStepAttachments(
  envelopes: messages.IEnvelope[],
  testCaseStartedId: string,
  testStepId: string
): messages.IAttachment[] {
  return _.chain(envelopes)
    .filter(
      e =>
        doesHaveValue(e.attachment) &&
        e.attachment.testCaseStartedId === testCaseStartedId &&
        e.attachment.testStepId === testStepId
    )
    .map(e => e.attachment)
    .value()
}
