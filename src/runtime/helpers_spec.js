import { beforeEach, describe, it } from 'mocha'
import { expect } from 'chai'
import { getAmbiguousStepException, retriesForPickle } from './helpers'

describe('Helpers', () => {
  describe('getAmbiguousStepException', () => {
    beforeEach(function() {
      this.result = getAmbiguousStepException([
        { line: 3, pattern: 'pattern1', uri: 'steps1.js' },
        {
          line: 4,
          pattern: 'longer pattern2',
          uri: 'steps2.js',
        },
      ])
    })

    it('returns a nicely formatted error', function() {
      expect(this.result).to.eql(
        'Multiple step definitions match:\n' +
          '  pattern1        - steps1.js:3\n' +
          '  longer pattern2 - steps2.js:4'
      )
    })
  })

  describe('retriesForPickle', () => {
    it('returns 0 if options.retry is not set', () => {
      const pickle = {
        tags: [],
      }
      expect(retriesForPickle(pickle, {})).to.eql(0)
    })

    it('returns options.retry if set and no options.retryTagFilter is specified', () => {
      const pickle = {
        tags: [],
      }
      const options = {
        retry: 1,
      }
      expect(retriesForPickle(pickle, options)).to.eql(1)
    })

    it('returns options.retry is set and the test case tags match options.retryTagFilter', () => {
      const pickle = {
        tags: [{ name: '@retry' }],
        uri: 'features/a.feature',
      }
      const options = {
        retry: 1,
        retryTagFilter: '@retry',
      }
      expect(retriesForPickle(pickle, options)).to.eql(1)
    })

    it('returns 0 if options.retry is set but the test case tags do not match options.retryTagFilter', () => {
      const pickle = {
        tags: [{ name: '@no_retry' }],
        uri: 'features/a.feature',
      }
      const options = {
        retry: 1,
        retryTagFilter: '@retry',
      }
      expect(retriesForPickle(pickle, options)).to.eql(0)
    })
  })
})
