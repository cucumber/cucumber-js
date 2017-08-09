import _ from 'lodash'
import upperCaseFirst from 'upper-case-first'

const statuses = {
  AMBIGUOUS: 'ambiguous',
  FAILED: 'failed',
  PASSED: 'passed',
  PENDING: 'pending',
  SKIPPED: 'skipped',
  UNDEFINED: 'undefined'
}

export default statuses

export function addStatusPredicates(obj) {
  const clone = _.clone(obj)
  _.each(statuses, status => {
    clone['is' + upperCaseFirst(status)] = function() {
      return this.status === status
    }
  })
  return clone
}

export function getStatusMapping(initialValue) {
  return _.chain(statuses)
    .map(status => [status, initialValue])
    .fromPairs()
    .value()
}
