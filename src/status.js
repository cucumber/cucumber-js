import _ from 'lodash'

const statuses = {
  AMBIGUOUS: 'ambiguous',
  FAILED: 'failed',
  PASSED: 'passed',
  PENDING: 'pending',
  RETRIED: 'retried',
  FLAKY: 'flaky',
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
