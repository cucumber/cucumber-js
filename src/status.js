import _ from 'lodash'

const statuses = {
  AMBIGUOUS: 'ambiguous',
  FAILED: 'failed',
  FLAKY: 'flaky',
  PASSED: 'passed',
  PENDING: 'pending',
  RETRY: 'retry',
  SKIPPED: 'skipped',
  UNDEFINED: 'undefined',
}

export default statuses

export function getStatusMapping(initialValue) {
  return _.chain(statuses)
    .map(status => [status, initialValue])
    .fromPairs()
    .value()
}
