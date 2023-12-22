import * as messages from '@cucumber/messages'
import { TestStepResult } from '@cucumber/messages'
import StepDefinitionSnippetBuilder from '../step_definition_snippet_builder'
import { SupportCodeLibrary } from '../../support_code_library_builder/types'
import { doesHaveValue, valueOrDefault } from '../../value_checker'
import TestCaseHookDefinition from '../../models/test_case_hook_definition'
import { ILineAndUri } from '../../types'
import { getStepKeywordType, KeywordType } from './keyword_type'
import {
  getGherkinScenarioLocationMap,
  getGherkinStepMap,
} from './gherkin_document_parser'
import { getPickleStepMap, getStepKeyword } from './pickle_parser'
import { ITestCaseAttempt } from './event_data_collector'

export interface IParsedTestStep {
  actionLocation?: ILineAndUri
  argument?: messages.PickleStepArgument
  attachments: messages.Attachment[]
  keyword: string
  name?: string
  result: messages.TestStepResult
  snippet?: string
  sourceLocation?: ILineAndUri
  text?: string
}

export interface IParsedTestCase {
  attempt: number
  name: string
  sourceLocation?: ILineAndUri
  worstTestStepResult: messages.TestStepResult
}

export interface IParsedTestCaseAttempt {
  testCase: IParsedTestCase
  testSteps: IParsedTestStep[]
}

interface IParseStepRequest {
  isBeforeHook: boolean
  gherkinStepMap: Record<string, messages.Step>
  keyword: string
  keywordType: KeywordType
  pickleStep: messages.PickleStep
  pickleUri: string
  snippetBuilder: StepDefinitionSnippetBuilder
  supportCodeLibrary: SupportCodeLibrary
  testStep: messages.TestStep
  testStepResult: messages.TestStepResult
  testStepAttachments: messages.Attachment[]
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
    keyword: doesHaveValue(testStep.pickleStepId)
      ? keyword
      : isBeforeHook
      ? 'Before'
      : 'After',
    result: testStepResult,
  }
  if (doesHaveValue(testStep.hookId)) {
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
    out.name = hookDefinition.name
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
  if (doesHaveValue(testStep.pickleStepId)) {
    out.sourceLocation = {
      uri: pickleUri,
      line: gherkinStepMap[pickleStep.astNodeIds[0]].location.line,
    }
    out.text = pickleStep.text
    if (doesHaveValue(pickleStep.argument)) {
      out.argument = pickleStep.argument
    }
  }
  if (testStepResult.status === messages.TestStepResultStatus.UNDEFINED) {
    out.snippet = snippetBuilder.build({ keywordType, pickleStep })
  }
  return out
}

export interface IParseTestCaseAttemptRequest {
  testCaseAttempt: ITestCaseAttempt
  snippetBuilder: StepDefinitionSnippetBuilder
  supportCodeLibrary: SupportCodeLibrary
}

// Converts a testCaseAttempt into a json object with all data needed for
// displaying it in a pretty format
export function parseTestCaseAttempt({
  testCaseAttempt,
  snippetBuilder,
  supportCodeLibrary,
}: IParseTestCaseAttemptRequest): IParsedTestCaseAttempt {
  const { testCase, pickle, gherkinDocument } = testCaseAttempt
  const gherkinStepMap = getGherkinStepMap(gherkinDocument)
  const gherkinScenarioLocationMap =
    getGherkinScenarioLocationMap(gherkinDocument)
  const pickleStepMap = getPickleStepMap(pickle)
  const relativePickleUri = pickle.uri
  const parsedTestCase: IParsedTestCase = {
    attempt: testCaseAttempt.attempt,
    name: pickle.name,
    sourceLocation: {
      uri: relativePickleUri,
      line: gherkinScenarioLocationMap[
        pickle.astNodeIds[pickle.astNodeIds.length - 1]
      ].line,
    },
    worstTestStepResult: testCaseAttempt.worstTestStepResult,
  }
  const parsedTestSteps: IParsedTestStep[] = []
  let isBeforeHook = true
  let previousKeywordType = KeywordType.Precondition

  testCase.testSteps.forEach((testStep) => {
    const testStepResult =
      testCaseAttempt.stepResults[testStep.id] || new TestStepResult()

    isBeforeHook = isBeforeHook && doesHaveValue(testStep.hookId)

    let keyword, keywordType, pickleStep
    if (doesHaveValue(testStep.pickleStepId)) {
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
