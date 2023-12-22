import indentString from 'indent-string'
import * as messages from '@cucumber/messages'
import { IColorFns } from '../get_color_fns'
import StepDefinitionSnippetBuilder from '../step_definition_snippet_builder'
import { SupportCodeLibrary } from '../../support_code_library_builder/types'
import { formatTestCaseAttempt } from './test_case_attempt_formatter'
import { ITestCaseAttempt } from './event_data_collector'

export function isFailure(
  result: messages.TestStepResult,
  willBeRetried: boolean = false
): boolean {
  return (
    result.status === 'AMBIGUOUS' ||
    result.status === 'UNDEFINED' ||
    (result.status === 'FAILED' && !willBeRetried)
  )
}

export function isWarning(
  result: messages.TestStepResult,
  willBeRetried: boolean = false
): boolean {
  return (
    result.status === 'PENDING' || (result.status === 'FAILED' && willBeRetried)
  )
}

export function isIssue(result: messages.TestStepResult): boolean {
  return isFailure(result) || isWarning(result)
}

export interface IFormatIssueRequest {
  colorFns: IColorFns
  number: number
  snippetBuilder: StepDefinitionSnippetBuilder
  testCaseAttempt: ITestCaseAttempt
  supportCodeLibrary: SupportCodeLibrary
  printAttachments?: boolean
}

export function formatIssue({
  colorFns,
  number,
  snippetBuilder,
  testCaseAttempt,
  supportCodeLibrary,
  printAttachments = true,
}: IFormatIssueRequest): string {
  const prefix = `${number.toString()}) `
  const formattedTestCaseAttempt = formatTestCaseAttempt({
    colorFns,
    snippetBuilder,
    testCaseAttempt,
    supportCodeLibrary,
    printAttachments,
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
  undefinedParameterTypes: messages.UndefinedParameterType[]
): string {
  const output = [`Undefined parameter types:\n\n`]
  const withLatest: Record<string, messages.UndefinedParameterType> = {}
  undefinedParameterTypes.forEach((parameterType) => {
    withLatest[parameterType.name] = parameterType
  })
  output.push(
    Object.values(withLatest)
      .map(
        (parameterType) => `- ${formatUndefinedParameterType(parameterType)}`
      )
      .join('\n')
  )
  output.push('\n\n')
  return output.join('')
}

export function formatUndefinedParameterType(
  parameterType: messages.UndefinedParameterType
): string {
  return `"${parameterType.name}" e.g. \`${parameterType.expression}\``
}
