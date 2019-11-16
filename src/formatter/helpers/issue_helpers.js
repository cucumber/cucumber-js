import _ from 'lodash'
import indentString from 'indent-string'
import Status from '../../status'
import { formatTestCaseAttempt } from './test_case_attempt_formatter'

export function isFailure(result) {
  return (
    result.status === Status.AMBIGUOUS ||
    (result.status === Status.FAILED && !result.retried)
  )
}

export function isWarning(result) {
  return (
    _.includes([Status.PENDING, Status.UNDEFINED], result.status) ||
    (result.status === Status.FAILED && result.retried)
  )
}

export function isIssue(result) {
  return isFailure(result) || isWarning(result)
}

export function formatIssue({
  colorFns,
  number,
  snippetBuilder,
  testCaseAttempt,
}) {
  const prefix = `${number}) `
  const formattedTestCaseAttempt = formatTestCaseAttempt({
    colorFns,
    snippetBuilder,
    testCaseAttempt,
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
