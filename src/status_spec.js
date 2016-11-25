import _ from 'lodash'
import Status, {addStatusPredicates, getStatusMapping} from './status'

class MyObject {
  constructor(status) {
    this.status = status
  }
}

const predicates = [
  'isAmbiguous',
  'isFailed',
  'isPassed',
  'isPending',
  'isSkipped',
  'isUndefined'
]

function predicatesShouldOnlyReturnTrueFor(status, expectedPredicatToReturnTrue) {
  describe('object has a status ' + status, function() {
    beforeEach(function() {
      this.obj = new MyObject(status)
    })

    _.each(predicates, function(predicate) {
      if (predicate === expectedPredicatToReturnTrue) {
        it('adds ' + predicate + '() which returns true', function() {
          expect(this.obj[predicate]()).to.be.true
        })
      } else {
        it('adds ' + predicate + '() which returns false', function() {
          expect(this.obj[predicate]()).to.be.false
        })
      }
    })
  })
}

describe('Status', function() {
  describe('constants', function() {
    it('exposes the proper constants', function() {
      expect(Status).to.include.keys([
        'AMBIGUOUS',
        'FAILED',
        'PASSED',
        'PENDING',
        'SKIPPED',
        'UNDEFINED'
      ])
    })
  })

  describe('addStatusPredicates()', function() {
    beforeEach(function() {
      addStatusPredicates(MyObject.prototype)
    })

    predicatesShouldOnlyReturnTrueFor(Status.AMBIGUOUS, 'isAmbiguous')
    predicatesShouldOnlyReturnTrueFor(Status.FAILED, 'isFailed')
    predicatesShouldOnlyReturnTrueFor(Status.PASSED, 'isPassed')
    predicatesShouldOnlyReturnTrueFor(Status.PENDING, 'isPending')
    predicatesShouldOnlyReturnTrueFor(Status.SKIPPED, 'isSkipped')
    predicatesShouldOnlyReturnTrueFor(Status.UNDEFINED, 'isUndefined')
  })

  describe('getStatusMapping', function() {
    it('returns a mapping of the statuses with the given initial value', function() {
      const result = getStatusMapping(0)
      expect(result).to.eql({
        [Status.AMBIGUOUS]: 0,
        [Status.FAILED]: 0,
        [Status.PASSED]: 0,
        [Status.PENDING]: 0,
        [Status.SKIPPED]: 0,
        [Status.UNDEFINED]: 0
      })
    })
  })
})
