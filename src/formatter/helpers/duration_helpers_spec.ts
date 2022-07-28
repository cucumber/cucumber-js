import { expect } from 'chai'
import { durationToNanoseconds } from './duration_helpers'

describe('duration helpers', () => {
  describe('durationToNanoseconds', () => {
    it('should convert under a second', () => {
      expect(durationToNanoseconds({ seconds: 0, nanos: 257344166 })).to.eq(
        257344166
      )
    })

    it('should convert over a second', () => {
      expect(durationToNanoseconds({ seconds: 2, nanos: 1043459 })).to.eq(
        2001043459
      )
    })
  })
})
