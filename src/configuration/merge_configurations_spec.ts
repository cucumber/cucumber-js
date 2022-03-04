import { expect } from 'chai'
import { mergeConfigurations } from './merge_configurations'

describe('mergeConfigurations', () => {
  it('should merge two arrays correctly', () => {
    const result = mergeConfigurations({ paths: ['a'] }, { paths: ['b'] })
    expect(result).to.deep.eq({
      paths: ['a', 'b'],
    })
  })

  it('should merge one array and one nullish correctly', () => {
    const result = mergeConfigurations({ paths: ['a'] }, { paths: undefined })
    expect(result).to.deep.eq({
      paths: ['a'],
    })
  })
})
