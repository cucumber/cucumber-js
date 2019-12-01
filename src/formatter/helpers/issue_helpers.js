import indentString from 'indent-string'
import Status from '../../status'
import { formatTestCaseAttempt } from './test_case_attempt_formatter'

export function isFailure(result) {
  return (
    result.status === Status.AMBIGUOUS ||
    result.status === Status.UNDEFINED ||
    (result.status === Status.FAILED && !result.willBeRetried)
  )
}

export function isWarning(result) {
  return (
    result.status === Status.PENDING ||
    (result.status === Status.FAILED && result.willBeRetried)
  )
}

export function isIssue(result) {
  return isFailure(result) || isWarning(result)
}

export function formatIssue({
  colorFns,
  cwd,
  number,
  snippetBuilder,
  testCaseAttempt,
  supportCodeLibrary,
}) {
  const prefix = `${number}) `
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
