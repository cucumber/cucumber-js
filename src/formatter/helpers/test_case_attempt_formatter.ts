import indentString from 'indent-string'
import Status from '../../status'
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

const CHARACTERS: { [status: number]: string } = {
  [Status.AMBIGUOUS]: figures.cross,
  [Status.FAILED]: figures.cross,
  [Status.PASSED]: figures.tick,
  [Status.PENDING]: '?',
  [Status.SKIPPED]: '-',
  [Status.UNDEFINED]: '?',
}

function getStepMessage(testStep: IParsedTestStep): string {
  switch (testStep.result.status) {
    case Status.AMBIGUOUS:
    case Status.FAILED:
      return testStep.result.message
    case Status.UNDEFINED:
      return `${
        'Undefined. Implement with the following snippet:' + '\n\n'
      }${indentString(testStep.snippet, 2)}\n`
    case Status.PENDING:
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
  let text = colorFn(`${CHARACTERS[status]} ${identifier}`)
  if (doesHaveValue(actionLocation)) {
    text += ` # ${(testStep.result.functionName) ? `Function: ${colorFns.functionName(testStep.result.functionName)} # ` : ''}${colorFns.location(formatLocation(actionLocation))}`
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
