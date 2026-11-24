import { expect } from 'chai'
import { describe, it } from 'mocha'
import { getPickleWithTags } from '../../test/gherkin_helpers'
import { buildOptions } from '../../test/runtime_helpers'
import { failureLimit, retriesForPickle } from './helpers'

describe('Helpers', () => {
  describe('retriesForPickle', () => {
    it('returns 0 if options.retry is not set', async () => {
      // Arrange
      const pickle = await getPickleWithTags([])
      const options = buildOptions({})

      // Act
      const result = retriesForPickle(pickle, options)

      // Assert
      expect(result).to.eql(0)
    })

    it('returns options.retry if set and no options.retryTagFilter is specified', async () => {
      // Arrange
      const pickle = await getPickleWithTags([])
      const options = buildOptions({ retry: 1 })

      // Act
      const result = retriesForPickle(pickle, options)

      // Assert
      expect(result).to.eql(1)
    })

    it('returns options.retry is set and the pickle tags match options.retryTagFilter', async () => {
      // Arrange
      const pickle = await getPickleWithTags(['@retry'])
      const options = buildOptions({
        retry: 1,
        retryTagFilter: '@retry',
      })

      // Act
      const result = retriesForPickle(pickle, options)

      // Assert
      expect(result).to.eql(1)
    })

    it('returns 0 if options.retry is set but the pickle tags do not match options.retryTagFilter', async () => {
      // Arrange
      const pickle = await getPickleWithTags([])
      const options = buildOptions({
        retry: 1,
        retryTagFilter: '@retry',
      })

      // Act
      const result = retriesForPickle(pickle, options)

      // Assert
      expect(result).to.eql(0)
    })
  })

  describe('failureLimit', () => {
    it('returns 0 (no limit) by default', () => {
      expect(failureLimit(buildOptions({}))).to.eql(0)
    })

    it('returns 1 if options.failFast is set', () => {
      expect(failureLimit(buildOptions({ failFast: true }))).to.eql(1)
    })

    it('returns options.maxFailures if set', () => {
      expect(failureLimit(buildOptions({ maxFailures: 3 }))).to.eql(3)
    })

    it('returns 1 if both options.failFast and options.maxFailures are set', () => {
      expect(failureLimit(buildOptions({ failFast: true, maxFailures: 3 }))).to.eql(1)
    })
  })
})
