import _, { Dictionary } from 'lodash'
import Status from '../../status'
import { getStepKeywordType, KeywordType } from './keyword_type'
import {
  getGherkinScenarioLocationMap,
  getGherkinStepMap,
} from './gherkin_document_parser'
import { getPickleStepMap, getStepKeyword } from './pickle_parser'
import path from 'path'
import { messages } from '@cucumber/messages'
import { ITestCaseAttempt } from './event_data_collector'
import StepDefinitionSnippetBuilder from '../step_definition_snippet_builder'
import { ISupportCodeLibrary } from '../../support_code_library_builder/types'
import { doesHaveValue, valueOrDefault } from '../../value_checker'
import TestCaseHookDefinition from '../../models/test_case_hook_definition'
import { ILineAndUri } from '../../types'

export interface IParsedTestStep {
  actionLocation?: ILineAndUri
  argument?: messages.IPickleStepArgument
  attachments: messages.IAttachment[]
  keyword: string
  result: messages.TestStepFinished.ITestStepResult
  snippet?: string
  sourceLocation?: ILineAndUri
  text?: string
}

export interface IParsedTestCase {
  attempt: number
  name: string
  sourceLocation?: ILineAndUri
  worstTestStepResult: messages.TestStepFinished.ITestStepResult
}

export interface IParsedTestCaseAttempt {
  testCase: IParsedTestCase
  testSteps: IParsedTestStep[]
}

interface IParseStepRequest {
  isBeforeHook: boolean
  gherkinStepMap: Dictionary<messages.GherkinDocument.Feature.IStep>
  keyword: string
  keywordType: KeywordType
  pickleStep: messages.Pickle.IPickleStep
  pickleUri: string
  snippetBuilder: StepDefinitionSnippetBuilder
  supportCodeLibrary: ISupportCodeLibrary
  testStep: messages.TestCase.ITestStep
  testStepResult: messages.TestStepFinished.ITestStepResult
  testStepAttachments: messages.IAttachment[]
}

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
}: IParseStepRequest): IParsedTestStep {
  const out: IParsedTestStep = {
    attachments: testStepAttachments,
    keyword:
      testStep.pickleStepId !== ''
        ? keyword
        : isBeforeHook
        ? 'Before'
        : 'After',
    result: testStepResult,
  }
  if (testStep.hookId !== '') {
    let hookDefinition: TestCaseHookDefinition
    if (isBeforeHook) {
      hookDefinition = supportCodeLibrary.beforeTestCaseHookDefinitions.find(
        (x) => x.id === testStep.hookId
      )
    } else {
      hookDefinition = supportCodeLibrary.afterTestCaseHookDefinitions.find(
        (x) => x.id === testStep.hookId
      )
    }
    out.actionLocation = {
      uri: hookDefinition.uri,
      line: hookDefinition.line,
    }
  }
  if (
    doesHaveValue(testStep.stepDefinitionIds) &&
    testStep.stepDefinitionIds.length === 1
  ) {
    const stepDefinition = supportCodeLibrary.stepDefinitions.find(
      (x) => x.id === testStep.stepDefinitionIds[0]
    )
    out.actionLocation = {
      uri: stepDefinition.uri,
      line: stepDefinition.line,
    }
  }
  if (testStep.pickleStepId !== '') {
    out.sourceLocation = {
      uri: pickleUri,
      line: gherkinStepMap[pickleStep.astNodeIds[0]].location.line,
    }
    out.text = pickleStep.text
    if (doesHaveValue(pickleStep.argument)) {
      out.argument = pickleStep.argument
    }
  }
  if (testStepResult.status === Status.UNDEFINED) {
    out.snippet = snippetBuilder.build({ keywordType, pickleStep })
  }
  return out
}

export interface IParseTestCaseAttemptRequest {
  cwd: string
  testCaseAttempt: ITestCaseAttempt
  snippetBuilder: StepDefinitionSnippetBuilder
  supportCodeLibrary: ISupportCodeLibrary
}

// Converts a testCaseAttempt into a json object with all data needed for
// displaying it in a pretty format
export function parseTestCaseAttempt({
  cwd,
  testCaseAttempt,
  snippetBuilder,
  supportCodeLibrary,
}: IParseTestCaseAttemptRequest): IParsedTestCaseAttempt {
  const { testCase, pickle, gherkinDocument } = testCaseAttempt
  const gherkinStepMap = getGherkinStepMap(gherkinDocument)
  const gherkinScenarioLocationMap = getGherkinScenarioLocationMap(
    gherkinDocument
  )
  const pickleStepMap = getPickleStepMap(pickle)
  const relativePickleUri = path.relative(cwd, pickle.uri)
  const parsedTestCase: IParsedTestCase = {
    attempt: testCaseAttempt.attempt,
    name: pickle.name,
    sourceLocation: {
      uri: relativePickleUri,
      line: gherkinScenarioLocationMap[_.last(pickle.astNodeIds)].line,
    },
    worstTestStepResult: testCaseAttempt.worstTestStepResult,
  }
  const parsedTestSteps: IParsedTestStep[] = []
  let isBeforeHook = true
  let previousKeywordType = KeywordType.Precondition
  _.each(testCase.testSteps, (testStep) => {
    const testStepResult = testCaseAttempt.stepResults[testStep.id]
    isBeforeHook = isBeforeHook && testStep.hookId !== ''
    let keyword, keywordType, pickleStep
    if (testStep.pickleStepId !== '') {
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
      testStepAttachments: valueOrDefault(
        testCaseAttempt.stepAttachments[testStep.id],
        []
      ),
    })
    parsedTestSteps.push(parsedStep)
    previousKeywordType = keywordType
  })
  return {
    testCase: parsedTestCase,
    testSteps: parsedTestSteps,
  }
}
