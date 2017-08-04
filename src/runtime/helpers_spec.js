import { getAmbiguousStepException } from './helpers'

describe('Helpers', function() {
  describe('getAmbiguousStepException', function() {
    beforeEach(function() {
      this.result = getAmbiguousStepException([
        { line: 3, pattern: 'pattern1', uri: 'steps1.js' },
        {
          line: 4,
          pattern: 'longer pattern2',
          uri: 'steps2.js'
        }
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
})
