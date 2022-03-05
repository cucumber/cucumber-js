import { expect } from 'chai'
import { mergeConfigurations } from './merge_configurations'

describe('mergeConfigurations', () => {
  it('should not default anything with empty configurations', () => {
    const result = mergeConfigurations({}, {})
    expect(result).to.deep.eq({})
  })

  describe('additive arrays', () => {
    it('should merge two arrays correctly', () => {
      const result = mergeConfigurations({ paths: ['a'] }, { paths: ['b'] })
      expect(result).to.deep.eq({
        paths: ['a', 'b'],
      })
    })

    it('should handle one array and one undefined correctly', () => {
      const result = mergeConfigurations({ paths: ['a'] }, { paths: undefined })
      expect(result).to.deep.eq({
        paths: ['a'],
      })
    })

    it('should handle one undefined and one array correctly', () => {
      const result = mergeConfigurations({ paths: undefined }, { paths: ['b'] })
      expect(result).to.deep.eq({
        paths: ['b'],
      })
    })
  })
})
