import indentString from 'indent-string'
import Status from '../../status'
import figures from 'figures'
import { formatError } from './error_helpers'
import { formatLocation } from './location_helpers'
import { parseTestCaseAttempt } from './test_case_attempt_parser'
import { formatStepArgument } from './step_argument_formatter'

const CHARACTERS = {
  [Status.AMBIGUOUS]: figures.cross,
  [Status.FAILED]: figures.cross,
  [Status.PASSED]: figures.tick,
  [Status.PENDING]: '?',
  [Status.SKIPPED]: '-',
  [Status.UNDEFINED]: '?',
}

function getStepMessage({ colorFns, testStep }) {
  switch (testStep.result.status) {
    case Status.AMBIGUOUS:
      return colorFns[Status.AMBIGUOUS](testStep.result.message)
    case Status.FAILED:
      return formatError(testStep.result.message, colorFns)
    case Status.UNDEFINED:
      return `${'Undefined. Implement with the following snippet:' +
        '\n\n'}${indentString(testStep.snippet, 2)}\n`
    case Status.PENDING:
      return colorFns[Status.PENDING]('Pending')
  }
  return ''
}

function formatStep({ colorFns, testStep }) {
  const {
    result: { status },
    actionLocation,
    attachments,
  } = testStep
  const colorFn = colorFns[status]
  const identifier = testStep.keyword + (testStep.text || '')
  let text = colorFn(`${CHARACTERS[status]} ${identifier}`)
  if (actionLocation) {
    text += ` # ${colorFns.location(formatLocation(actionLocation))}`
  }
  text += '\n'
  if (testStep.argument) {
    const argumentsText = formatStepArgument(testStep.argument)
    if (argumentsText) {
      text += indentString(`${colorFn(argumentsText)}\n`, 4)
    }
  }
  if (attachments) {
    attachments.forEach(({ media, data }) => {
      const message = media.type === 'text/plain' ? `: ${data}` : ''
      text += indentString(`Attachment (${media.type})${message}\n`, 4)
    })
  }
  const message = getStepMessage({ colorFns, testStep })
  if (message) {
    text += `${indentString(message, 4)}\n`
  }
  return text
}

export function formatTestCaseAttempt({
  colorFns,
  cwd,
  snippetBuilder,
  supportCodeLibrary,
  testCaseAttempt,
}) {
  const parsed = parseTestCaseAttempt({
    cwd,
    snippetBuilder,
    testCaseAttempt,
    supportCodeLibrary,
  })
  let text = `Scenario: ${parsed.testCase.name}`
  text += getAttemptText(
    parsed.testCase.attempt,
    parsed.testCase.result.willBeRetried
  )
  text += ` # ${colorFns.location(
    formatLocation(parsed.testCase.sourceLocation)
  )}\n`
  parsed.testSteps.forEach(testStep => {
    text += formatStep({ colorFns, testStep })
  })
  return `${text}\n`
}

function getAttemptText(attempt, willBeRetried) {
  if (willBeRetried) {
    return ` (attempt ${attempt + 1}, retried)`
  }
  if (attempt > 0) {
    return ` (attempt ${attempt + 1})`
  }
  return ''
}
