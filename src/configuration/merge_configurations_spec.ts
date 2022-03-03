import { expect } from 'chai'
import { mergeConfigurations } from './merge_configurations'

describe('mergeConfigurations', () => {
  it('should merge arrays correctly', () => {
    const result = mergeConfigurations({ paths: ['a'] }, { paths: ['b'] })
    expect(result).to.deep.eq({
      paths: ['a', 'b'],
    })
  })
})
