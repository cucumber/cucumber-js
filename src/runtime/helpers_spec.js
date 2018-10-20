import { beforeEach, describe, it } from 'mocha'
import { expect } from 'chai'
import { getAmbiguousStepException, shouldRetryTestCase } from './helpers'

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
  describe('shouldRetryTestCase', () => {
    it('returns false if options.retry is not set', () => {
      const testCase = {
        pickle: {
          tags: [],
        },
      }
      expect(shouldRetryTestCase(testCase, {})).to.eql(false)
    })
    it('returns true if options.retry is set and no options.retryTagFilter is specified', () => {
      const testCase = {
        pickle: {
          tags: [],
        },
      }
      const options = {
        retry: 1,
      }
      expect(shouldRetryTestCase(testCase, options)).to.eql(true)
    })
    it('returns true if options.retry is set and the test case tags match options.retryTagFilter', () => {
      const testCase = {
        pickle: {
          tags: [{ name: '@flaky' }],
        },
        uri: 'features/a.feature',
      }
      const options = {
        retry: 1,
        retryTagFilter: '@flaky',
      }
      expect(shouldRetryTestCase(testCase, options)).to.eql(true)
    })
    it('returns false if options.retry is set but the test case tags do not match options.retryTagFilter', () => {
      const testCase = {
        pickle: {
          tags: [{ name: '@not_flaky' }],
        },
        uri: 'features/a.feature',
      }
      const options = {
        retry: 1,
        retryTagFilter: '@flaky',
      }
      expect(shouldRetryTestCase(testCase, options)).to.eql(false)
    })
  })
})
