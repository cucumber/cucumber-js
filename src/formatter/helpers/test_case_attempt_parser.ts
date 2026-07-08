import {
  type Attachment,
  type PickleStep,
  type PickleStepArgument,
  type Step,
  type TestStep,
  type TestStepResult,
  TestStepResultStatus,
} from '@cucumber/messages'
import type TestCaseHookDefinition from '../../models/test_case_hook_definition'
import type { SupportCodeLibrary } from '../../support_code_library_builder/types'
import type { ILineAndUri } from '../../types'
import { doesHaveValue, valueOrDefault } from '../../value_checker'
import type StepDefinitionSnippetBuilder from '../step_definition_snippet_builder'
import type { ITestCaseAttempt } from './event_data_collector'
import { getGherkinScenarioLocationMap, getGherkinStepMap } from './gherkin_document_parser'
import { getStepKeywordType, KeywordType } from './keyword_type'
import { getPickleStepMap, getStepKeyword } from './pickle_parser'

export interface IParsedTestStep {
  actionLocation?: ILineAndUri
  argument?: PickleStepArgument
  attachments: Attachment[]
  keyword: string
  name?: string
  result: TestStepResult
  snippet?: string
  sourceLocation?: ILineAndUri
  text?: string
}

export interface IParsedTestCase {
  attempt: number
  name: string
  sourceLocation?: ILineAndUri
  worstTestStepResult: TestStepResult
}

export interface IParsedTestCaseAttempt {
  testCase: IParsedTestCase
  testSteps: IParsedTestStep[]
}

interface IParseStepRequest {
  isBeforeHook: boolean
  gherkinStepMap: Record<string, Step>
  keyword: string
  keywordType: KeywordType
  pickleStep: PickleStep
  pickleUri: string
  snippetBuilder: StepDefinitionSnippetBuilder
  supportCodeLibrary: SupportCodeLibrary
  testStep: TestStep
  testStepResult: TestStepResult
  testStepAttachments: Attachment[]
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
    keyword: doesHaveValue(testStep.pickleStepId) ? keyword : isBeforeHook ? 'Before' : 'After',
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
  if (doesHaveValue(testStep.stepDefinitionIds) && testStep.stepDefinitionIds.length === 1) {
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
  if (testStepResult.status === TestStepResultStatus.UNDEFINED) {
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
  const gherkinScenarioLocationMap = getGherkinScenarioLocationMap(gherkinDocument)
  const pickleStepMap = getPickleStepMap(pickle)
  const relativePickleUri = pickle.uri
  const parsedTestCase: IParsedTestCase = {
    attempt: testCaseAttempt.attempt,
    name: pickle.name,
    sourceLocation: {
      uri: relativePickleUri,
      line: gherkinScenarioLocationMap[pickle.astNodeIds[pickle.astNodeIds.length - 1]].line,
    },
    worstTestStepResult: testCaseAttempt.worstTestStepResult,
  }
  const parsedTestSteps: IParsedTestStep[] = []
  let isBeforeHook = true
  let previousKeywordType = KeywordType.Precondition

  testCase.testSteps.forEach((testStep) => {
    const testStepResult: TestStepResult = testCaseAttempt.stepResults[testStep.id] || {
      duration: {
        seconds: 0,
        nanos: 0,
      },
      status: TestStepResultStatus.UNKNOWN,
    }

    isBeforeHook = isBeforeHook && doesHaveValue(testStep.hookId)

    let keyword: any, keywordType: any, pickleStep: any
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
      testStepAttachments: valueOrDefault(testCaseAttempt.stepAttachments[testStep.id], []),
    })
    parsedTestSteps.push(parsedStep)
    previousKeywordType = keywordType
  })
  return {
    testCase: parsedTestCase,
    testSteps: parsedTestSteps,
  }
}
