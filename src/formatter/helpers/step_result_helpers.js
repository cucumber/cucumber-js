import { formatLocation } from './location_helpers'
import { formatError } from './error_helpers'
import Status from '../../status'
import Table from 'cli-table'
import indentString from 'indent-string'

function getAmbiguousStepResultMessage({ colorFns, cwd, stepResult }) {
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
      return [pattern, formatLocation(cwd, stepDefinition)]
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

export function getStepResultMessage({
  colorFns,
  cwd,
  snippetBuilder,
  stepResult
}) {
  switch (stepResult.status) {
    case Status.AMBIGUOUS:
      return getAmbiguousStepResultMessage({ colorFns, cwd, stepResult })
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
    indentString(snippet, 2) +
    '\n'
  return colorFns.undefined(message)
}
