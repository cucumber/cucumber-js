import { formatError } from './error_helpers'
import Status from '../../status'
import indentString from 'indent-string'

function getAmbiguousStepResultMessage({ colorFns, testStepResult }) {
  return colorFns.ambiguous(testStepResult.exception)
}

function getFailedStepResultMessage({ colorFns, testStepResult }) {
  return formatError(testStepResult.exception, colorFns)
}

function getPendingStepResultMessage({ colorFns }) {
  return colorFns.pending('Pending')
}

export function getStepMessage({
  colorFns,
  keywordType,
  snippetBuilder,
  testStepResult,
  pickleStep,
}) {
  switch (testStepResult.status) {
    case Status.AMBIGUOUS:
      return getAmbiguousStepResultMessage({ colorFns, testStepResult })
    case Status.FAILED:
      return getFailedStepResultMessage({ colorFns, testStepResult })
    case Status.UNDEFINED:
      return getUndefinedStepResultMessage({
        colorFns,
        keywordType,
        snippetBuilder,
        pickleStep,
      })
    case Status.PENDING:
      return getPendingStepResultMessage({ colorFns })
  }
}

function getUndefinedStepResultMessage({
  colorFns,
  keywordType,
  snippetBuilder,
  pickleStep,
}) {
  const snippet = snippetBuilder.build({ keywordType, pickleStep })
  const message = `${'Undefined. Implement with the following snippet:' +
    '\n\n'}${indentString(snippet, 2)}\n`
  return colorFns.undefined(message)
}
