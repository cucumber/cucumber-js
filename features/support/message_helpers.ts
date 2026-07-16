import util from 'node:util'
import type {
  Attachment,
  Envelope,
  GherkinDocument,
  Pickle,
  PickleStep,
  TestCase,
  TestCaseStarted,
  TestRunHookStarted,
  TestStepResult,
} from '@cucumber/messages'
import { Query } from '@cucumber/query'
import { getGherkinStepMap } from '../../src/formatter/helpers/gherkin_document_parser'
import { getPickleStepMap, getStepKeyword } from '../../src/formatter/helpers/pickle_parser'
import { doesHaveValue, doesNotHaveValue } from '../../src/value_checker'

export interface IStepTextAndResult {
  text: string
  result: TestStepResult
}

export function getPickleNamesInOrderOfExecution(envelopes: Envelope[]): string[] {
  const pickleNameMap: Record<string, string> = {}
  const testCaseToPickleNameMap: Record<string, string> = {}
  const result: string[] = []
  envelopes.forEach((e) => {
    if (e.pickle != null) {
      pickleNameMap[e.pickle.id] = e.pickle.name
    } else if (e.testCase != null) {
      testCaseToPickleNameMap[e.testCase.id] = pickleNameMap[e.testCase.pickleId]
    } else if (e.testCaseStarted != null) {
      result.push(testCaseToPickleNameMap[e.testCaseStarted.testCaseId])
    }
  })
  return result
}

export function getPickleStep(
  envelopes: Envelope[],
  pickleName: string,
  stepText: string
): PickleStep {
  const pickle = getAcceptedPickle(envelopes, pickleName)
  const gherkinDocument = getGherkinDocument(envelopes, pickle.uri)
  return getPickleStepByStepText(pickle, gherkinDocument, stepText)
}

export function getTestCaseResult(envelopes: Envelope[], pickleName: string): TestStepResult {
  const query = new Query()
  for (const envelope of envelopes) {
    query.update(envelope)
  }
  const matched = query
    .findAllTestCaseStarted()
    .find((testCaseStarted) => query.findPickleBy(testCaseStarted).name === pickleName)
  return query.findMostSevereTestStepResultBy(matched)
}

export function getTestStepResults(
  envelopes: Envelope[],
  pickleName: string,
  attempt = 0
): IStepTextAndResult[] {
  const pickle = getAcceptedPickle(envelopes, pickleName)
  const gherkinDocument = getGherkinDocument(envelopes, pickle.uri)
  const testCase = getTestCase(envelopes, pickle.id)
  const testCaseStarted = getTestCaseStarted(envelopes, testCase.id, attempt)
  const testStepIdToResultMap: Record<string, TestStepResult> = {}
  envelopes.forEach((e) => {
    if (e.testStepFinished != null && e.testStepFinished.testCaseStartedId === testCaseStarted.id) {
      testStepIdToResultMap[e.testStepFinished.testStepId] = e.testStepFinished.testStepResult
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
  envelopes: Envelope[],
  pickleName: string,
  stepText: string
): Attachment[] {
  const pickle = getAcceptedPickle(envelopes, pickleName)
  const gherkinDocument = getGherkinDocument(envelopes, pickle.uri)
  const testCase = getTestCase(envelopes, pickle.id)
  const pickleStep = getPickleStepByStepText(pickle, gherkinDocument, stepText)
  const testStep = testCase.testSteps.find((s) => s.pickleStepId === pickleStep.id)
  const testCaseStarted = getTestCaseStarted(envelopes, testCase.id)
  return getTestStepAttachments(envelopes, testCaseStarted.id, testStep.id)
}

export function getTestStepAttachmentsForHook(
  envelopes: Envelope[],
  pickleName: string,
  isBeforeHook: boolean
): Attachment[] {
  const pickle = getAcceptedPickle(envelopes, pickleName)
  const testCase = getTestCase(envelopes, pickle.id)
  const testStepIndex = isBeforeHook ? 0 : testCase.testSteps.length - 1
  const testStep = testCase.testSteps[testStepIndex]
  const testCaseStarted = getTestCaseStarted(envelopes, testCase.id)
  return getTestStepAttachments(envelopes, testCaseStarted.id, testStep.id)
}

export function getTestRunHooksStarted(
  envelopes: Envelope[],
  hookName: string
): TestRunHookStarted[] {
  const query = new Query()
  for (const envelope of envelopes) {
    query.update(envelope)
  }
  return query
    .findAllTestRunHookStarted()
    .filter((testRunHookStarted) => query.findHookBy(testRunHookStarted).name === hookName)
}

function getAcceptedPickle(envelopes: Envelope[], pickleName: string): Pickle {
  const pickleEnvelope = envelopes.find(
    (e) => doesHaveValue(e.pickle) && e.pickle.name === pickleName
  )
  if (doesNotHaveValue(pickleEnvelope)) {
    throw new Error(
      `No pickle with name "${pickleName}" in envelopes:\n ${util.inspect(envelopes)}`
    )
  }
  return pickleEnvelope.pickle
}

function getGherkinDocument(envelopes: Envelope[], uri: string): GherkinDocument {
  const gherkinDocumentEnvelope = envelopes.find(
    (e) => doesHaveValue(e.gherkinDocument) && e.gherkinDocument.uri === uri
  )
  if (doesNotHaveValue(gherkinDocumentEnvelope)) {
    throw new Error(
      `No gherkinDocument with uri "${uri}" in envelopes:\n ${util.inspect(envelopes)}`
    )
  }
  return gherkinDocumentEnvelope.gherkinDocument
}

function getTestCase(envelopes: Envelope[], pickleId: string): TestCase {
  const testCaseEnvelope = envelopes.find(
    (e) => doesHaveValue(e.testCase) && e.testCase.pickleId === pickleId
  )
  if (doesNotHaveValue(testCaseEnvelope)) {
    throw new Error(
      `No testCase with pickleId "${pickleId}" in envelopes:\n ${util.inspect(envelopes)}`
    )
  }
  return testCaseEnvelope.testCase
}

function getTestCaseStarted(
  envelopes: Envelope[],
  testCaseId: string,
  attempt = 0
): TestCaseStarted {
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
  pickle: Pickle,
  gherkinDocument: GherkinDocument,
  stepText: string
): PickleStep {
  const gherkinStepMap = getGherkinStepMap(gherkinDocument)
  return pickle.steps.find((s) => {
    const keyword = getStepKeyword({ pickleStep: s, gherkinStepMap })
    return `${keyword}${s.text}` === stepText
  })
}

function getTestStepAttachments(
  envelopes: Envelope[],
  testCaseStartedId: string,
  testStepId: string
): Attachment[] {
  return envelopes
    .filter(
      (e) =>
        doesHaveValue(e.attachment) &&
        e.attachment.testCaseStartedId === testCaseStartedId &&
        e.attachment.testStepId === testStepId
    )
    .map((e) => e.attachment)
}
