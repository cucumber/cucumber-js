import { formatLocation } from '../formatter/helpers/location_helpers'
import Table from 'cli-table3'
import indentString from 'indent-string'
import PickleFilter from '../pickle_filter'

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
      'top-right': '',
    },
    style: {
      border: [],
      'padding-left': 0,
      'padding-right': 0,
    },
  })
  table.push(
    ...stepDefinitions.map(stepDefinition => {
      const pattern = stepDefinition.pattern.toString()
      return [pattern, formatLocation(stepDefinition)]
    })
  )
  return `${'Multiple step definitions match:' + '\n'}${indentString(
    table.toString(),
    2
  )}`
}

export function retriesForTestCase(testCase, options) {
  const retries = options.retry
  if (!retries) {
    return 0
  }
  const retryTagFilter = options.retryTagFilter
  if (!retryTagFilter) {
    return retries
  }
  const pickleFilter = new PickleFilter({
    tagExpression: retryTagFilter,
  })
  if (pickleFilter.matches(testCase)) {
    return retries
  }
  return 0
}
