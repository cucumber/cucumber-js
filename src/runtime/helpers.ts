import { type Pickle, TestStepResultStatus } from '@cucumber/messages'
import Table from 'cli-table3'
import indentString from 'indent-string'
import { formatLocation } from '../formatter/helpers/location_helpers'
import type StepDefinition from '../models/step_definition'
import { PickleTagFilter } from '../pickle_filter'
import type { RuntimeOptions } from '.'

export function getAmbiguousStepException(stepDefinitions: StepDefinition[]): string {
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
    ...stepDefinitions.map((stepDefinition) => {
      const pattern = stepDefinition.pattern.toString()
      return [pattern, formatLocation(stepDefinition)]
    })
  )
  return `${'Multiple step definitions match:' + '\n'}${indentString(table.toString(), 2)}`
}

export function retriesForPickle(pickle: Pickle, options: RuntimeOptions): number {
  if (!options.retry) {
    return 0
  }
  const retries = options.retry
  if (retries === 0) {
    return 0
  }
  const retryTagFilter = options.retryTagFilter
  if (!retryTagFilter) {
    return retries
  }
  const pickleTagFilter = new PickleTagFilter(retryTagFilter)
  if (pickleTagFilter.matchesAllTagExpressions(pickle)) {
    return retries
  }
  return 0
}

export function shouldCauseFailure(status: TestStepResultStatus, options: RuntimeOptions): boolean {
  if (options.dryRun) {
    return false
  }
  const failureStatuses: TestStepResultStatus[] = [
    TestStepResultStatus.AMBIGUOUS,
    TestStepResultStatus.FAILED,
    TestStepResultStatus.UNDEFINED,
  ]
  if (options.strict) {
    failureStatuses.push(TestStepResultStatus.PENDING)
  }
  return failureStatuses.includes(status)
}
