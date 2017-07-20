import { defineTestRunHook, defineTestCaseHook, defineStep } from './helpers'

describe('helpers', function() {
  describe('defineTestRunHook', function() {
    beforeEach(function() {
      this.defineTestRunHook = defineTestRunHook('', [])
    })

    it('throws on invalid options/fn type', function() {
      expect(() => {
        this.defineTestRunHook([])
      }).to.throw(/Invalid first argument: should be a object or function$/)
    })

    it('throws on invalid options.timeout type', function() {
      expect(() => {
        this.defineTestRunHook({ timeout: '1' }, function() {})
      }).to.throw(/Invalid "options.timeout": should be a integer$/)
    })

    it('throws on invalid fn type', function() {
      expect(() => {
        this.defineTestRunHook({}, 'code')
      }).to.throw(/Invalid second argument: should be a function$/)
    })
  })

  describe('defineTestCaseHook', function() {
    beforeEach(function() {
      this.defineTestCaseHook = defineTestCaseHook('', [])
    })

    it('throws on invalid options/fn type', function() {
      expect(() => {
        this.defineTestCaseHook([])
      }).to.throw(/Invalid first argument: should be a object or function$/)
    })

    it('throws on invalid options.tags type', function() {
      expect(() => {
        this.defineTestCaseHook({ tags: [] }, function() {})
      }).to.throw(/Invalid "options.tags": should be a string$/)
    })

    it('throws on invalid options.timeout type', function() {
      expect(() => {
        this.defineTestCaseHook({ timeout: '1' }, function() {})
      }).to.throw(/Invalid "options.timeout": should be a integer$/)
    })

    it('throws on invalid fn type', function() {
      expect(() => {
        this.defineTestCaseHook({}, 'code')
      }).to.throw(/Invalid second argument: should be a function$/)
    })
  })

  describe('defineStep', function() {
    beforeEach(function() {
      this.defineStep = defineStep('', [])
    })

    it('throws on invalid pattern type', function() {
      expect(() => {
        this.defineStep([])
      }).to.throw(
        /Invalid first argument: should be a string or regular expression$/
      )
    })

    it('throws on invalid options/fn type', function() {
      expect(() => {
        this.defineStep('', [])
      }).to.throw(/Invalid second argument: should be a object or function$/)
    })

    it('throws on invalid options.timeout type', function() {
      expect(() => {
        this.defineStep('', { timeout: '1' }, function() {})
      }).to.throw(/Invalid "options.timeout": should be a integer$/)
    })

    it('throws on invalid fn type', function() {
      expect(() => {
        this.defineStep('', {}, 'code')
      }).to.throw(/Invalid third argument: should be a function$/)
    })
  })
})
