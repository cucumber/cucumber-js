import indentString from 'indent-string'
import * as messages from '@cucumber/messages'
import figures from 'figures'
import { formatLocation } from './location_helpers'
import {
  IParsedTestStep,
  parseTestCaseAttempt,
} from './test_case_attempt_parser'
import { formatStepArgument } from './step_argument_formatter'
import { IColorFns } from '../get_color_fns'
import { doesHaveValue, valueOrDefault } from '../../value_checker'
import { ITestCaseAttempt } from './event_data_collector'
import StepDefinitionSnippetBuilder from '../step_definition_snippet_builder'
import { ISupportCodeLibrary } from '../../support_code_library_builder/types'

const CHARACTERS: Map<messages.TestStepResultStatus, string> = new Map([
  [messages.TestStepResultStatus.AMBIGUOUS, figures.cross],
  [messages.TestStepResultStatus.FAILED, figures.cross],
  [messages.TestStepResultStatus.PASSED, figures.tick],
  [messages.TestStepResultStatus.PENDING, '?'],
  [messages.TestStepResultStatus.SKIPPED, '-'],
  [messages.TestStepResultStatus.UNDEFINED, '?'],
])

function getStepMessage(testStep: IParsedTestStep): string {
  switch (testStep.result.status) {
    case messages.TestStepResultStatus.AMBIGUOUS:
    case messages.TestStepResultStatus.FAILED:
      return testStep.result.message
    case messages.TestStepResultStatus.UNDEFINED:
      return `${
        'Undefined. Implement with the following snippet:' + '\n\n'
      }${indentString(testStep.snippet, 2)}\n`
    case messages.TestStepResultStatus.PENDING:
      return 'Pending'
  }
  return ''
}

interface IFormatStepRequest {
  colorFns: IColorFns
  testStep: IParsedTestStep
}

function formatStep({ colorFns, testStep }: IFormatStepRequest): string {
  const {
    result: { status },
    actionLocation,
    attachments,
  } = testStep
  const colorFn = colorFns.forStatus(status)
  const identifier = testStep.keyword + valueOrDefault(testStep.text, '')
  let text = colorFn(`${CHARACTERS.get(status)} ${identifier}`)
  if (doesHaveValue(actionLocation)) {
    text += ` # ${colorFns.location(formatLocation(actionLocation))}`
  }
  text += '\n'
  if (doesHaveValue(testStep.argument)) {
    const argumentsText = formatStepArgument(testStep.argument)
    text += indentString(`${colorFn(argumentsText)}\n`, 4)
  }
  attachments.forEach(({ body, mediaType }) => {
    const message = mediaType === 'text/plain' ? `: ${body}` : ''
    text += indentString(`Attachment (${mediaType})${message}\n`, 4)
  })
  const message = getStepMessage(testStep)
  if (message !== '') {
    text += `${indentString(colorFn(message), 4)}\n`
  }
  return text
}

export interface IFormatTestCaseAttemptRequest {
  colorFns: IColorFns
  cwd: string
  testCaseAttempt: ITestCaseAttempt
  snippetBuilder: StepDefinitionSnippetBuilder
  supportCodeLibrary: ISupportCodeLibrary
}

export function formatTestCaseAttempt({
  colorFns,
  cwd,
  snippetBuilder,
  supportCodeLibrary,
  testCaseAttempt,
}: IFormatTestCaseAttemptRequest): string {
  const parsed = parseTestCaseAttempt({
    cwd,
    snippetBuilder,
    testCaseAttempt,
    supportCodeLibrary,
  })
  let text = `Scenario: ${parsed.testCase.name}`
  text += getAttemptText(
    parsed.testCase.attempt,
    parsed.testCase.worstTestStepResult.willBeRetried
  )
  text += ` # ${colorFns.location(
    formatLocation(parsed.testCase.sourceLocation)
  )}\n`
  parsed.testSteps.forEach((testStep) => {
    text += formatStep({ colorFns, testStep })
  })
  return `${text}\n`
}

function getAttemptText(attempt: number, willBeRetried: boolean): string {
  if (attempt > 0 || willBeRetried) {
    const numberStr = (attempt + 1).toString()
    const retriedStr = willBeRetried ? ', retried' : ''
    return ` (attempt ${numberStr}${retriedStr})`
  }
  return ''
}
