import _ from 'lodash'
import KeywordType, { getStepKeywordType } from './keyword_type'
import { buildStepArgumentIterator } from '../../step_arguments'
import { getGherkinStepMap } from './gherkin_document_parser'
import { getStepIdToPickledStepMap, getStepKeyword } from './pickle_parser'
import { messages } from 'cucumber-messages'

const { Status } = messages.TestResult


function parseStep({
  isBeforeHook,
  gherkinStepMap,
  keyword,
  keywordType,
  pickleStep,
  pickleUri,
  snippetBuilder,
  supportCodeLibrary,
  testStep,
  testStepResult,
  testStepAttachments,
}) {
  const out = {
    attachments: testStepAttachments,
    result: testStepResult,
  }
  if (testStep.hookId) {
    let hookDefinition;
    if (isBeforeHook) {
      hookDefinition = supportCodeLibrary.beforeHookDefinitions.find(x => x.id == testStep.hookId)
    } else {
      hookDefinition = supportCodeLibrary.afterHookDefinitions.find(x => x.id == testStep.hookId)
    }
    out.actionLocation = {
      uri: hookDefinition.uri,
      line: hookDefinition.line
    }
  }
  if (testStep.stepDefinitionId.length == 1) {
    const stepDefinition = supportCodeLibrary.stepDefinitions.find(x => x.id == testStep.stepDefinitionId[0])
    out.actionLocation = {
      uri: stepDefinition.uri,
      line: stepDefinition.line
    }
  }
  if (testStep.pickleStepId) {
    out.keyword = keyword
    out.sourceLocation = {
      uri: pickleUri,
      line: gherkinStepMap[pickleStep.sourceIds[0]].location.line
    }
    out.text = pickleStep.text
  } else {
    out.keyword = isBeforeHook ? 'Before' : 'After'
  }
  if (pickleStep.argument) {
    out.argument = pickleStep.argument
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
//   testCase: {location, name, attemptNumber, result: { status, retried, duration}, uri},
//   testSteps: [
//     {attachments, keyword, text?, result: {status, duration}, argument?, snippet?, sourceLocation?, actionLocation?}
//     ...
//   ]
// }
export function parseTestCaseAttempt({ testCaseAttempt, snippetBuilder, supportCodeLibrary }) {
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
  const gherkinStepMap = getGherkinStepMap(gherkinDocument)
  const pickleStepIdToPickleStepMap = getStepIdToPickledStepMap(pickle)
  let isBeforeHook = true
  let previousKeywordType = KeywordType.PRECONDITION
  _.each(testCaseAttempt.testCase.steps, (testStep) => {
    const testStepResult = testCaseAttempt.stepResults[testStep.id]
    isBeforeHook = isBeforeHook && testStep.hookId
    let keyword, keywordType, pickleStep
    if (testStep.pickleStepId) {
      pickleStep = pickleStepIdToPickleStepMap[testStep.pickleStepId]
      keyword = getStepKeyword({ pickleStep, gherkinStepMap })
      keywordType = getStepKeywordType({
        keyword,
        language: gherkinDocument.feature.language,
        previousKeywordType,
      })
    }
    const parsedStep = parseStep({
      isBeforeHook,
      gherkinStepMap,
      keyword,
      keywordType,
      pickleStep,
      pickleUri: pickle.uri,
      snippetBuilder,
      supportCodeLibrary,
      testStep,
      testStepResult,
      testStepAttachments: testCaseAttempt.stepAttachments[testStep.id] || [],
    })
    out.testSteps.push(parsedStep)
    previousKeywordType = keywordType
  })
  return out
}
