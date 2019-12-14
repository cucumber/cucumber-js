import _ from 'lodash'
import Status from '../../status'
import KeywordType, { getStepKeywordType } from './keyword_type'
import {
  getGherkinStepMap,
  getGherkinScenarioLocationMap,
} from './gherkin_document_parser'
import { getPickleStepMap, getStepKeyword } from './pickle_parser'
import path from 'path'

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
  if (testStep.stepDefinitionIds && testStep.stepDefinitionIds.length === 1) {
    const stepDefinition = supportCodeLibrary.stepDefinitions.find(
      x => x.id === testStep.stepDefinitionIds[0]
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
      line: gherkinStepMap[pickleStep.astNodeIds[0]].location.line,
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
//   testCase: {location, name, attempt, result: { status, willBeRetried, duration}, uri},
//   testSteps: [
//     {attachments, keyword, text?, result: {status, duration}, argument?, snippet?, sourceLocation?, actionLocation?}
//     ...
//   ]
// }
export function parseTestCaseAttempt({
  cwd,
  testCaseAttempt,
  snippetBuilder,
  supportCodeLibrary,
}) {
  const { testCase, pickle, gherkinDocument } = testCaseAttempt
  const gherkinStepMap = getGherkinStepMap(gherkinDocument)
  const gherkinScenarioLocationMap = getGherkinScenarioLocationMap(
    gherkinDocument
  )
  const pickleStepMap = getPickleStepMap(pickle)
  const relativePickleUri = path.relative(cwd, pickle.uri)
  const out = {
    testCase: {
      attempt: testCaseAttempt.attempt,
      name: pickle.name,
      result: testCaseAttempt.result,
      sourceLocation: {
        uri: relativePickleUri,
        line: gherkinScenarioLocationMap[_.last(pickle.astNodeIds)].line,
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
      pickleUri: relativePickleUri,
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
