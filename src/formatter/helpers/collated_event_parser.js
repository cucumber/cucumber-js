import _ from 'lodash'
import { formatLocation } from './location_helpers'
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

function parseCollatedEventStep({
  isBeforeHook,
  keyword,
  keywordType,
  pickleStep,
  snippetBuilder,
  testStep,
  testStepResult,
  testStepAttachments,
}) {
  const result = {
    attachments: testStepAttachments,
    result: testStepResult,
  }

  if (testStep.sourceLocation) {
    result.keyword = keyword
    result.text = pickleStep.text
    result.sourceLocation = formatLocation(testStep.sourceLocation)
  } else {
    result.keyword = isBeforeHook ? 'Before' : 'After'
  }

  if (testStep.actionLocation) {
    result.actionLocation = formatLocation(testStep.actionLocation)
  }

  if (pickleStep) {
    const iterator = buildStepArgumentIterator({
      dataTable: arg => parseDataTable(arg),
      docString: arg => parseDocString(arg),
    })
    result.arguments = pickleStep.arguments.map(iterator)
  }

  if (testStepResult.status === Status.UNDEFINED) {
    result.snippet = snippetBuilder.build({ keywordType, pickleStep })
  }

  return result
}

// Converts a collated event into a json object with all data needed for
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
export function parseCollatedEvent({
  collatedEvent: { gherkinDocument, pickle, testCase, testCaseAttempt },
  snippetBuilder,
}) {
  const result = {
    testCase: {
      sourceLocation: formatLocation(testCase.sourceLocation),
      name: pickle.name,
      attemptNumber: testCaseAttempt.attemptNumber,
      result: testCaseAttempt.result,
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
    const parsedStep = parseCollatedEventStep({
      isBeforeHook,
      keyword,
      keywordType,
      pickleStep,
      snippetBuilder,
      testStep,
      testStepResult,
      testStepAttachments: testCaseAttempt.stepAttachments[index],
    })
    result.testSteps.push(parsedStep)
    previousKeywordType = keywordType
  })
  return result
}
