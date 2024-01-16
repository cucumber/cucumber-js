import { expect } from 'chai'
import { mergeConfigurations } from './merge_configurations'

describe('mergeConfigurations', () => {
  it('should not default anything with empty configurations', () => {
    const result = mergeConfigurations({}, {})
    expect(result).to.deep.eq({})
  })

  it('should not override a real value with undefined', () => {
    const result = mergeConfigurations(
      {
        parallel: 2,
      },
      {
        parallel: undefined,
      }
    )
    expect(result).to.deep.eq({ parallel: 2 })
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

  describe('tag expressions', () => {
    it('should merge two tag expressions correctly', () => {
      const result = mergeConfigurations({ tags: '@foo' }, { tags: '@bar' })
      expect(result).to.deep.eq({
        tags: '(@foo) and (@bar)',
      })
    })

    it('should handle one tag and one undefined correctly', () => {
      const result = mergeConfigurations({ tags: '@foo' }, { tags: undefined })
      expect(result).to.deep.eq({
        tags: '@foo',
      })
    })

    it('should handle one undefined and one tag correctly', () => {
      const result = mergeConfigurations({ tags: undefined }, { tags: '@foo' })
      expect(result).to.deep.eq({
        tags: '@foo',
      })
    })

    it('should merge three tag expressions correctly', () => {
      const result = mergeConfigurations(
        { tags: '@foo' },
        { tags: '@bar' },
        { tags: '@baz' }
      )
      expect(result).to.deep.eq({
        tags: '(@foo) and (@bar) and (@baz)',
      })
    })
  })
})
