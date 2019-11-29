import _ from 'lodash'
import KeywordType, { getStepKeywordType } from './keyword_type'
import {
  getGherkinStepMap,
  getGherkinScenarioMap,
} from './gherkin_document_parser'
import { getPickleStepMap, getStepKeyword } from './pickle_parser'
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
    let hookDefinition
    if (isBeforeHook) {
      hookDefinition = supportCodeLibrary.beforeTestCaseHookDefinitions.find(
        x => x.id === testStep.hookId
      )
    } else {
      hookDefinition = supportCodeLibrary.afterTestCaseHookDefinitions.find(
        x => x.id === testStep.hookId
      )
    }
    out.actionLocation = {
      uri: hookDefinition.uri,
      line: hookDefinition.line,
    }
  }
  if (testStep.stepDefinitionId && testStep.stepDefinitionId.length === 1) {
    const stepDefinition = supportCodeLibrary.stepDefinitions.find(
      x => x.id === testStep.stepDefinitionId[0]
    )
    out.actionLocation = {
      uri: stepDefinition.uri,
      line: stepDefinition.line,
    }
  }
  if (testStep.pickleStepId) {
    out.keyword = keyword
    out.sourceLocation = {
      uri: pickleUri,
      line: gherkinStepMap[pickleStep.sourceIds[0]].location.line,
    }
    out.text = pickleStep.text
    if (pickleStep.argument) {
      out.argument = pickleStep.argument
    }
  } else {
    out.keyword = isBeforeHook ? 'Before' : 'After'
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
//   testCase: {location, name, attempt, result: { status, retried, duration}, uri},
//   testSteps: [
//     {attachments, keyword, text?, result: {status, duration}, argument?, snippet?, sourceLocation?, actionLocation?}
//     ...
//   ]
// }
export function parseTestCaseAttempt({
  testCaseAttempt,
  snippetBuilder,
  supportCodeLibrary,
}) {
  const { testCase, pickle, gherkinDocument } = testCaseAttempt
  const gherkinStepMap = getGherkinStepMap(gherkinDocument)
  const gherkinScenarioMap = getGherkinScenarioMap(gherkinDocument)
  const pickleStepMap = getPickleStepMap(pickle)
  const out = {
    testCase: {
      attempt: testCaseAttempt.attempt,
      name: pickle.name,
      result: testCaseAttempt.result,
      sourceLocation: {
        uri: pickle.uri,
        line: gherkinScenarioMap[pickle.sourceIds[0]].location.line,
      },
    },
    testSteps: [],
  }
  let isBeforeHook = true
  let previousKeywordType = KeywordType.PRECONDITION
  _.each(testCase.testSteps, testStep => {
    const testStepResult = testCaseAttempt.stepResults[testStep.id]
    isBeforeHook = isBeforeHook && testStep.hookId
    let keyword, keywordType, pickleStep
    if (testStep.pickleStepId) {
      pickleStep = pickleStepMap[testStep.pickleStepId]
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
