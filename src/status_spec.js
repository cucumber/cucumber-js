import Status, { getStatusMapping } from './status'

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
