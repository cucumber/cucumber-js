import type { TestStepResult, UndefinedParameterType } from '@cucumber/messages'
import indentString from 'indent-string'
import type { SupportCodeLibrary } from '../../support_code_library_builder/types'
import type { IColorFns } from '../get_color_fns'
import type StepDefinitionSnippetBuilder from '../step_definition_snippet_builder'
import type { ITestCaseAttempt } from './event_data_collector'
import { formatTestCaseAttempt } from './test_case_attempt_formatter'

export function isFailure(result: TestStepResult, willBeRetried: boolean = false): boolean {
  return (
    result.status === 'AMBIGUOUS' ||
    result.status === 'UNDEFINED' ||
    (result.status === 'FAILED' && !willBeRetried)
  )
}

export function isWarning(result: TestStepResult, willBeRetried: boolean = false): boolean {
  return result.status === 'PENDING' || (result.status === 'FAILED' && willBeRetried)
}

export function isIssue(result: TestStepResult): boolean {
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
  undefinedParameterTypes: UndefinedParameterType[]
): string {
  const output = [`Undefined parameter types:\n\n`]
  const withLatest: Record<string, UndefinedParameterType> = {}
  undefinedParameterTypes.forEach((parameterType) => {
    withLatest[parameterType.name] = parameterType
  })
  output.push(
    Object.values(withLatest)
      .map((parameterType) => `- ${formatUndefinedParameterType(parameterType)}`)
      .join('\n')
  )
  output.push('\n\n')
  return output.join('')
}

export function formatUndefinedParameterType(parameterType: UndefinedParameterType): string {
  return `"${parameterType.name}" e.g. \`${parameterType.expression}\``
}
