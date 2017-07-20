import { formatError } from './error_helpers'
import Status from '../../status'
import indentString from 'indent-string'

function getAmbiguousStepResultMessage({ colorFns, testStep }) {
  return colorFns.ambiguous(testStep.result.exception)
}

function getFailedStepResultMessage({ colorFns, testStep }) {
  return formatError(testStep.result.exception, colorFns)
}

function getPendingStepResultMessage({ colorFns }) {
  return colorFns.pending('Pending')
}

export function getStepMessage({
  colorFns,
  keywordType,
  snippetBuilder,
  testStep,
  pickledStep
}) {
  switch (testStep.result.status) {
    case Status.AMBIGUOUS:
      return getAmbiguousStepResultMessage({ colorFns, testStep })
    case Status.FAILED:
      return getFailedStepResultMessage({ colorFns, testStep })
    case Status.UNDEFINED:
      return getUndefinedStepResultMessage({
        colorFns,
        keywordType,
        snippetBuilder,
        pickledStep
      })
    case Status.PENDING:
      return getPendingStepResultMessage({ colorFns })
  }
}

function getUndefinedStepResultMessage({
  colorFns,
  keywordType,
  snippetBuilder,
  pickledStep
}) {
  const snippet = snippetBuilder.build({ keywordType, pickledStep })
  const message =
    'Undefined. Implement with the following snippet:' +
    '\n\n' +
    indentString(snippet, 2) +
    '\n'
  return colorFns.undefined(message)
}
