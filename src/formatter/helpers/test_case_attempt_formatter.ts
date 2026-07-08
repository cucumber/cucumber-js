import { TestStepResultStatus } from '@cucumber/messages'
import figures from 'figures'
import indentString from 'indent-string'
import type { SupportCodeLibrary } from '../../support_code_library_builder/types'
import { doesHaveValue, valueOrDefault } from '../../value_checker'
import type { IColorFns } from '../get_color_fns'
import type StepDefinitionSnippetBuilder from '../step_definition_snippet_builder'
import type { ITestCaseAttempt } from './event_data_collector'
import { formatLocation } from './location_helpers'
import { formatStepArgument } from './step_argument_formatter'
import { type IParsedTestStep, parseTestCaseAttempt } from './test_case_attempt_parser'

const CHARACTERS: Map<TestStepResultStatus, string> = new Map([
  [TestStepResultStatus.AMBIGUOUS, figures.cross],
  [TestStepResultStatus.FAILED, figures.cross],
  [TestStepResultStatus.PASSED, figures.tick],
  [TestStepResultStatus.PENDING, '?'],
  [TestStepResultStatus.SKIPPED, '-'],
  [TestStepResultStatus.UNDEFINED, '?'],
])

function getStepMessage(testStep: IParsedTestStep): string | undefined {
  switch (testStep.result.status) {
    case TestStepResultStatus.AMBIGUOUS:
    case TestStepResultStatus.FAILED:
      return testStep.result.message
    case TestStepResultStatus.UNDEFINED:
      return `${
        'Undefined. Implement with the following snippet:' + '\n\n'
      }${indentString(testStep.snippet, 2)}\n`
    case TestStepResultStatus.PENDING:
      return 'Pending'
  }
  return ''
}

interface IFormatStepRequest {
  colorFns: IColorFns
  testStep: IParsedTestStep
  printAttachments?: boolean
}

function formatStep({ colorFns, testStep, printAttachments }: IFormatStepRequest): string {
  const {
    name,
    result: { status },
    actionLocation,
    attachments,
  } = testStep
  const colorFn = colorFns.forStatus(status)
  const identifier = testStep.keyword + valueOrDefault(testStep.text, '')
  let text = colorFn(`${CHARACTERS.get(status)} ${identifier}`)
  if (doesHaveValue(name)) {
    text += colorFn(` (${name})`)
  }
  if (doesHaveValue(actionLocation)) {
    text += ` # ${colorFns.location(formatLocation(actionLocation))}`
  }
  text += '\n'
  if (doesHaveValue(testStep.argument)) {
    const argumentsText = formatStepArgument(testStep.argument)
    text += indentString(`${colorFn(argumentsText)}\n`, 4)
  }
  if (valueOrDefault(printAttachments, true)) {
    attachments.forEach(({ body, mediaType, fileName }) => {
      let message = ''
      if (mediaType === 'text/plain') {
        message = `: ${body}`
      } else if (fileName) {
        message = `: ${fileName}`
      }
      text += indentString(`Attachment (${mediaType})${message}\n`, 4)
    })
  }
  const message = getStepMessage(testStep)
  if (message) {
    text += `${indentString(colorFn(message), 4)}\n`
  }
  return text
}

export interface IFormatTestCaseAttemptRequest {
  colorFns: IColorFns
  testCaseAttempt: ITestCaseAttempt
  snippetBuilder: StepDefinitionSnippetBuilder
  supportCodeLibrary: SupportCodeLibrary
  printAttachments?: boolean
}

export function formatTestCaseAttempt({
  colorFns,
  snippetBuilder,
  supportCodeLibrary,
  testCaseAttempt,
  printAttachments,
}: IFormatTestCaseAttemptRequest): string {
  const parsed = parseTestCaseAttempt({
    snippetBuilder,
    testCaseAttempt,
    supportCodeLibrary,
  })
  let text = `Scenario: ${parsed.testCase.name}`
  text += getAttemptText(parsed.testCase.attempt, testCaseAttempt.willBeRetried)
  text += ` # ${colorFns.location(formatLocation(parsed.testCase.sourceLocation))}\n`
  parsed.testSteps.forEach((testStep) => {
    text += formatStep({ colorFns, testStep, printAttachments })
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
