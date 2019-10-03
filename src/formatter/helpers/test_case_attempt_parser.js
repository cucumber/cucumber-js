import _ from 'lodash'
import Status from '../../status'
import KeywordType, { getStepKeywordType } from './keyword_type'
import { buildStepArgumentIterator } from '../../step_arguments'
import { getStepLineToKeywordMap } from './gherkin_document_parser'
import { getStepLineToPickledStepMap, getStepKeyword } from './pickle_parser'

function parseDataTable(arg) {
  const rows = arg.rows.map(row =>
    row.cells.map(cell =>
      cell.value.replace(/\\/g, '\\\\').replace(/\n/g, '\\n')
    )
  )
  return { rows }
}

function parseDocString(arg) {
  return { content: arg.content }
}

function parseStep({
  isBeforeHook,
  keyword,
  keywordType,
  pickleStep,
  snippetBuilder,
  testStep,
  testStepResult,
  testStepAttachments,
}) {
  const out = {
    attachments: testStepAttachments,
    result: testStepResult,
  }
  if (testStep.actionLocation) {
    out.actionLocation = testStep.actionLocation
  }
  if (testStep.sourceLocation) {
    out.keyword = keyword
    out.sourceLocation = testStep.sourceLocation
    out.text = pickleStep.text
  } else {
    out.keyword = isBeforeHook ? 'Before' : 'After'
  }
  if (pickleStep) {
    const iterator = buildStepArgumentIterator({
      dataTable: arg => parseDataTable(arg),
      docString: arg => parseDocString(arg),
    })
    out.arguments = pickleStep.arguments.map(iterator)
  }
  if (testStepResult.status === Status.UNDEFINED) {
    out.snippet = snippetBuilder.build({ keywordType, pickleStep })
  }
  return out
}

// Converts a testCaseAttempt into a json object with all data needed for
// displaying it in a pretty format
//
// Returns the following
// {
//   testCase: {sourceLocation, name, attemptNumber, result: { status, retried, duration}},
//   testSteps: [
//     {attachments, keyword, text?, result: {status, duration}, arguments?, snippet?, sourceLocation?, actionLocation?}
//     ...
//   ]
// }
export function parseTestCaseAttempt({ testCaseAttempt, snippetBuilder }) {
  const { testCase, pickle, gherkinDocument } = testCaseAttempt
  const out = {
    testCase: {
      attemptNumber: testCaseAttempt.attemptNumber,
      name: pickle.name,
      result: testCaseAttempt.result,
      sourceLocation: testCase.sourceLocation,
    },
    testSteps: [],
  }
  const stepLineToKeywordMap = getStepLineToKeywordMap(gherkinDocument)
  const stepLineToPickledStepMap = getStepLineToPickledStepMap(pickle)
  let isBeforeHook = true
  let previousKeywordType = KeywordType.PRECONDITION
  _.each(testCaseAttempt.stepResults, (testStepResult, index) => {
    const testStep = testCase.steps[index]
    isBeforeHook = isBeforeHook && !testStep.sourceLocation
    let keyword, keywordType, pickleStep
    if (testStep.sourceLocation) {
      pickleStep = stepLineToPickledStepMap[testStep.sourceLocation.line]
      keyword = getStepKeyword({ pickleStep, stepLineToKeywordMap })
      keywordType = getStepKeywordType({
        keyword,
        language: gherkinDocument.feature.language,
        previousKeywordType,
      })
    }
    const parsedStep = parseStep({
      isBeforeHook,
      keyword,
      keywordType,
      pickleStep,
      snippetBuilder,
      testStep,
      testStepResult,
      testStepAttachments: testCaseAttempt.stepAttachments[index],
    })
    out.testSteps.push(parsedStep)
    previousKeywordType = keywordType
  })
  return out
}
