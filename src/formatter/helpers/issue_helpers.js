import { formatLocation } from './location_helpers'
import { formatError } from './error_helpers'
import indentString from 'indent-string'
import Status from '../../status'
import Table from 'cli-table'

export function formatIssue({ colorFns, number, snippetBuilder, stepResult }) {
  const message = getStepResultMessage({
    colorFns,
    snippetBuilder,
    stepResult
  })
  const prefix = number + ') '
  const { step } = stepResult
  const { scenario } = step
  let text = prefix

  if (scenario) {
    text +=
      'Scenario: ' +
      colorFns.bold(scenario.name) +
      ' - ' +
      colorFns.location(formatLocation(scenario))
  } else {
    text += 'Background:'
  }
  text += '\n'

  let stepText = 'Step: ' + colorFns.bold(step.keyword + (step.name || ''))
  if (step.uri) {
    stepText += ' - ' + colorFns.location(formatLocation(step))
  }
  text += indentString(stepText, prefix.length) + '\n'

  const { stepDefinition } = stepResult
  if (stepDefinition) {
    const stepDefinitionLine =
      'Step Definition: ' + colorFns.location(formatLocation(stepDefinition))
    text += indentString(stepDefinitionLine, prefix.length) + '\n'
  }

  text += indentString('Message:', prefix.length) + '\n'
  text += indentString(message, prefix.length + 2) + '\n\n'
  return text
}

function getAmbiguousStepResultMessage({ colorFns, stepResult }) {
  const { ambiguousStepDefinitions } = stepResult
  const table = new Table({
    chars: {
      bottom: '',
      'bottom-left': '',
      'bottom-mid': '',
      'bottom-right': '',
      left: '',
      'left-mid': '',
      mid: '',
      'mid-mid': '',
      middle: ' - ',
      right: '',
      'right-mid': '',
      top: '',
      'top-left': '',
      'top-mid': '',
      'top-right': ''
    },
    style: {
      border: [],
      'padding-left': 0,
      'padding-right': 0
    }
  })
  table.push.apply(
    table,
    ambiguousStepDefinitions.map(stepDefinition => {
      const pattern = stepDefinition.pattern.toString()
      return [pattern, formatLocation(stepDefinition)]
    })
  )
  const message =
    'Multiple step definitions match:' +
    '\n' +
    indentString(table.toString(), 2)
  return colorFns.ambiguous(message)
}

function getFailedStepResultMessage({ colorFns, stepResult }) {
  const { failureException } = stepResult
  return formatError(failureException, colorFns)
}

function getPendingStepResultMessage({ colorFns }) {
  return colorFns.pending('Pending')
}

function getStepResultMessage({ colorFns, snippetBuilder, stepResult }) {
  switch (stepResult.status) {
    case Status.AMBIGUOUS:
      return getAmbiguousStepResultMessage({ colorFns, stepResult })
    case Status.FAILED:
      return getFailedStepResultMessage({ colorFns, stepResult })
    case Status.UNDEFINED:
      return getUndefinedStepResultMessage({
        colorFns,
        snippetBuilder,
        stepResult
      })
    case Status.PENDING:
      return getPendingStepResultMessage({ colorFns })
  }
}

function getUndefinedStepResultMessage({
  colorFns,
  snippetBuilder,
  stepResult
}) {
  const { step } = stepResult
  const snippet = snippetBuilder.build(step)
  const message =
    'Undefined. Implement with the following snippet:' +
    '\n\n' +
    indentString(snippet, 2)
  return colorFns.undefined(message)
}
