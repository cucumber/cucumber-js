import indentString from 'indent-string'
import Status from '../../status'
import { formatTestCaseAttempt } from './test_case_attempt_formatter'
import { messages } from '@cucumber/messages'
import { IColorFns } from '../get_color_fns'
import StepDefinitionSnippetBuilder from '../step_definition_snippet_builder'
import { ISupportCodeLibrary } from '../../support_code_library_builder/types'
import { ITestCaseAttempt } from './event_data_collector'
import { Dictionary } from 'lodash'

export function isFailure(
  result: messages.TestStepFinished.ITestStepResult
): boolean {
  return (
    result.status === Status.AMBIGUOUS ||
    result.status === Status.UNDEFINED ||
    (result.status === Status.FAILED && !result.willBeRetried)
  )
}

export function isWarning(
  result: messages.TestStepFinished.ITestStepResult
): boolean {
  return (
    result.status === Status.PENDING ||
    (result.status === Status.FAILED && result.willBeRetried)
  )
}

export function isIssue(
  result: messages.TestStepFinished.ITestStepResult
): boolean {
  return isFailure(result) || isWarning(result)
}

export interface IFormatIssueRequest {
  colorFns: IColorFns
  cwd: string
  number: number
  snippetBuilder: StepDefinitionSnippetBuilder
  testCaseAttempt: ITestCaseAttempt
  supportCodeLibrary: ISupportCodeLibrary
}

export function formatIssue({
  colorFns,
  cwd,
  number,
  snippetBuilder,
  testCaseAttempt,
  supportCodeLibrary,
}: IFormatIssueRequest): string {
  const prefix = `${number.toString()}) `
  const formattedTestCaseAttempt = formatTestCaseAttempt({
    colorFns,
    cwd,
    snippetBuilder,
    testCaseAttempt,
    supportCodeLibrary,
  })
  const lines = formattedTestCaseAttempt.split('\n')
  const updatedLines = lines.map((line, index) => {
    if (index === 0) {
      return `${prefix}${line}`
    }
    return indentString(line, prefix.length)
  })
  return updatedLines.join('\n')
}

export function formatUndefinedParameterTypes(
  undefinedParameterTypes: messages.IUndefinedParameterType[]
): string {
  const withLatest: Dictionary<messages.IUndefinedParameterType> = {}
  undefinedParameterTypes.forEach((parameterType) => {
    withLatest[parameterType.name] = parameterType
  })
  return Object.values(withLatest)
    .map((parameterType) => {
      return `- "${parameterType.name}" e.g. \`${parameterType.expression}\``
    })
    .join('\n')
}
