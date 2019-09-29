import indentString from 'indent-string'
import Status from '../../status'
import figures from 'figures'
import { formatError } from './error_helpers'
import { parseCollatedEvent } from './collated_event_parser'
import { formatStepArguments } from './step_argument_formatter'

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
      return colorFns.ambiguous(testStep.result.exception)
    case Status.FAILED:
      return formatError(testStep.result.exception, colorFns)
    case Status.UNDEFINED:
      return `${'Undefined. Implement with the following snippet:' +
        '\n\n'}${indentString(testStep.snippet, 2)}\n`
    case Status.PENDING:
      return colorFns.pending('Pending')
  }
  return ''
}

function formatCollatedEventTestStep({ colorFns, testStep }) {
  const {
    result: { status },
    actionLocation,
    attachments,
  } = testStep
  const colorFn = colorFns[status]
  const identifier = testStep.keyword + (testStep.text || '')
  let text = colorFn(`${CHARACTERS[status]} ${identifier}`)
  if (actionLocation) {
    text += ` # ${colorFns.location(actionLocation)}`
  }
  text += '\n'
  if (testStep.arguments) {
    const argumentsText = formatStepArguments(testStep.arguments)
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

export function formatCollatedEvent({
  colorFns,
  collatedEvent,
  snippetBuilder,
}) {
  const parsed = parseCollatedEvent({ collatedEvent, snippetBuilder })
  let text = `Scenario: ${parsed.testCase.name}`
  text += getAttemptText(
    parsed.testCase.attemptNumber,
    parsed.testCase.result.retried
  )
  text += ` # ${colorFns.location(parsed.testCase.sourceLocation)}\n`
  parsed.testSteps.forEach(testStep => {
    text += formatCollatedEventTestStep({ colorFns, testStep })
  })
  return `${text}\n`
}

function getAttemptText(attemptNumber, retried) {
  if (retried) {
    return ` (attempt ${attemptNumber}, retried)`
  }
  if (attemptNumber > 1) {
    return ` (attempt ${attemptNumber})`
  }
  return ''
}
