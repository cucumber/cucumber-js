import { beforeEach, describe, it } from 'mocha'
import sinon from 'sinon'
import { wrapDefinitions } from './finalize_helpers'

describe('wrapDefinitions', () => {
  describe('pass parameters to wrapper', () => {
    beforeEach(function() {
      this.code = ''
      this.definitionFunctionWrapper = sinon.mock().returns(this.code)
      this.expected_pattern = 'expected pattern'
      this.definitions = [
        {
          code: this.code,
          options: { wrapperOptions: {} },
          pattern: this.expected_pattern,
        },
      ]
    })

    it('passes the pattern to the wrapper', function() {
      wrapDefinitions({
        cwd: '.',
        definitionFunctionWrapper: this.definitionFunctionWrapper,
        definitions: this.definitions,
      })
      sinon.assert.calledWith(
        this.definitionFunctionWrapper,
        sinon.match.any,
        sinon.match.any,
        sinon.match(this.expected_pattern)
      )
    })
  })
})
