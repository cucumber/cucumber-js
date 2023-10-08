import util from 'node:util'
import * as messages from '@cucumber/messages'
import { Query } from '@cucumber/query'
import { getWorstTestStepResult } from '@cucumber/messages'
import { doesHaveValue, doesNotHaveValue } from '../../src/value_checker'
import {
  getPickleStepMap,
  getStepKeyword,
} from '../../src/formatter/helpers/pickle_parser'
import { getGherkinStepMap } from '../../src/formatter/helpers/gherkin_document_parser'

export interface IStepTextAndResult {
  text: string
  result: messages.TestStepResult
}

export function getPickleNamesInOrderOfExecution(
  envelopes: messages.Envelope[]
): string[] {
  const pickleNameMap: Record<string, string> = {}
  const testCaseToPickleNameMap: Record<string, string> = {}
  const result: string[] = []
  envelopes.forEach((e) => {
    if (e.pickle != null) {
      pickleNameMap[e.pickle.id] = e.pickle.name
    } else if (e.testCase != null) {
      testCaseToPickleNameMap[e.testCase.id] =
        pickleNameMap[e.testCase.pickleId]
    } else if (e.testCaseStarted != null) {
      result.push(testCaseToPickleNameMap[e.testCaseStarted.testCaseId])
    }
  })
  return result
}

export function getPickleStep(
  envelopes: messages.Envelope[],
  pickleName: string,
  stepText: string
): messages.PickleStep {
  const pickle = getAcceptedPickle(envelopes, pickleName)
  const gherkinDocument = getGherkinDocument(envelopes, pickle.uri)
  return getPickleStepByStepText(pickle, gherkinDocument, stepText)
}

export function getTestCaseResult(
  envelopes: messages.Envelope[],
  pickleName: string
): messages.TestStepResult {
  const query = new Query()
  envelopes.forEach((envelope) => query.update(envelope))
  const pickle = getAcceptedPickle(envelopes, pickleName)
  return getWorstTestStepResult(query.getPickleTestStepResults([pickle.id]))
}

export function getTestStepResults(
  envelopes: messages.Envelope[],
  pickleName: string,
  attempt = 0
): IStepTextAndResult[] {
  const pickle = getAcceptedPickle(envelopes, pickleName)
  const gherkinDocument = getGherkinDocument(envelopes, pickle.uri)
  const testCase = getTestCase(envelopes, pickle.id)
  const testCaseStarted = getTestCaseStarted(envelopes, testCase.id, attempt)
  const testStepIdToResultMap: Record<string, messages.TestStepResult> = {}
  envelopes.forEach((e) => {
    if (
      e.testStepFinished != null &&
      e.testStepFinished.testCaseStartedId === testCaseStarted.id
    ) {
      testStepIdToResultMap[e.testStepFinished.testStepId] =
        e.testStepFinished.testStepResult
    }
  })
  const gherkinStepMap = getGherkinStepMap(gherkinDocument)
  const pickleStepMap = getPickleStepMap(pickle)
  let isBeforeHook = true
  return testCase.testSteps.map((testStep) => {
    let text = ''
    if (!doesHaveValue(testStep.pickleStepId)) {
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
  envelopes: messages.Envelope[],
  pickleName: string,
  stepText: string
): messages.Attachment[] {
  const pickle = getAcceptedPickle(envelopes, pickleName)
  const gherkinDocument = getGherkinDocument(envelopes, pickle.uri)
  const testCase = getTestCase(envelopes, pickle.id)
  const pickleStep = getPickleStepByStepText(pickle, gherkinDocument, stepText)
  const testStep = testCase.testSteps.find(
    (s) => s.pickleStepId === pickleStep.id
  )
  const testCaseStarted = getTestCaseStarted(envelopes, testCase.id)
  return getTestStepAttachments(envelopes, testCaseStarted.id, testStep.id)
}

export function getTestStepAttachmentsForHook(
  envelopes: messages.Envelope[],
  pickleName: string,
  isBeforeHook: boolean
): messages.Attachment[] {
  const pickle = getAcceptedPickle(envelopes, pickleName)
  const testCase = getTestCase(envelopes, pickle.id)
  const testStepIndex = isBeforeHook ? 0 : testCase.testSteps.length - 1
  const testStep = testCase.testSteps[testStepIndex]
  const testCaseStarted = getTestCaseStarted(envelopes, testCase.id)
  return getTestStepAttachments(envelopes, testCaseStarted.id, testStep.id)
}

function getAcceptedPickle(
  envelopes: messages.Envelope[],
  pickleName: string
): messages.Pickle {
  const pickleEnvelope = envelopes.find(
    (e) => doesHaveValue(e.pickle) && e.pickle.name === pickleName
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
  envelopes: messages.Envelope[],
  uri: string
): messages.GherkinDocument {
  const gherkinDocumentEnvelope = envelopes.find(
    (e) => doesHaveValue(e.gherkinDocument) && e.gherkinDocument.uri === uri
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
  envelopes: messages.Envelope[],
  pickleId: string
): messages.TestCase {
  const testCaseEnvelope = envelopes.find(
    (e) => doesHaveValue(e.testCase) && e.testCase.pickleId === pickleId
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
  envelopes: messages.Envelope[],
  testCaseId: string,
  attempt = 0
): messages.TestCaseStarted {
  const testCaseStartedEnvelope = envelopes.find(
    (e) =>
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
  pickle: messages.Pickle,
  gherkinDocument: messages.GherkinDocument,
  stepText: string
): messages.PickleStep {
  const gherkinStepMap = getGherkinStepMap(gherkinDocument)
  return pickle.steps.find((s) => {
    const keyword = getStepKeyword({ pickleStep: s, gherkinStepMap })
    return `${keyword}${s.text}` === stepText
  })
}

function getTestStepAttachments(
  envelopes: messages.Envelope[],
  testCaseStartedId: string,
  testStepId: string
): messages.Attachment[] {
  return envelopes
    .filter(
      (e) =>
        doesHaveValue(e.attachment) &&
        e.attachment.testCaseStartedId === testCaseStartedId &&
        e.attachment.testStepId === testStepId
    )
    .map((e) => e.attachment)
}
