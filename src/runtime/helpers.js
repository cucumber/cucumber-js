import { formatLocation } from '../formatter/helpers/location_helpers'
import Table from 'cli-table'
import indentString from 'indent-string'

export function getAmbiguousStepException(stepDefinitions) {
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
    stepDefinitions.map(stepDefinition => {
      const pattern = stepDefinition.pattern.toString()
      return [pattern, formatLocation(stepDefinition)]
    })
  )
  return (
    'Multiple step definitions match:' +
    '\n' +
    indentString(table.toString(), 2)
  )
}
