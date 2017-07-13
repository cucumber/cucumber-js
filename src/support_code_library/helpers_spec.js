import { defineFeaturesHook, defineScenarioHook, defineStep, registerHandler } from './helpers'

describe('helpers', function() {
  describe('defineFeaturesHook', function() {
    beforeEach(function() {
      this.defineFeaturesHook = defineFeaturesHook('', [])
    })

    it('throws on invalid options/fn type', function() {
      expect(() => {
        this.defineFeaturesHook([])
      }).to.throw(/Invalid first argument: should be a object or function$/)
    })

    it('throws on invalid options.timeout type', function() {
      expect(() => {
        this.defineFeaturesHook({ timeout: '1' }, function() {})
      }).to.throw(/Invalid "options.timeout": should be a integer$/)
    })

    it('throws on invalid fn type', function() {
      expect(() => {
        this.defineFeaturesHook({}, 'code')
      }).to.throw(/Invalid second argument: should be a function$/)
    })
  })

  describe('defineScenarioHook', function() {
    beforeEach(function() {
      this.defineScenarioHook = defineScenarioHook('', [])
    })

    it('throws on invalid options/fn type', function() {
      expect(() => {
        this.defineScenarioHook([])
      }).to.throw(/Invalid first argument: should be a object or function$/)
    })

    it('throws on invalid options.tags type', function() {
      expect(() => {
        this.defineScenarioHook({ tags: [] }, function() {})
      }).to.throw(/Invalid "options.tags": should be a string$/)
    })

    it('throws on invalid options.timeout type', function() {
      expect(() => {
        this.defineScenarioHook({ timeout: '1' }, function() {})
      }).to.throw(/Invalid "options.timeout": should be a integer$/)
    })

    it('throws on invalid fn type', function() {
      expect(() => {
        this.defineScenarioHook({}, 'code')
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

  describe('registerHandler', function() {
    beforeEach(function() {
      this.registerHandler = registerHandler('', [])
    })

    it('throws on invalid eventName type', function() {
      expect(() => {
        this.registerHandler([])
      }).to.throw(/Invalid first argument: should be a string$/)
    })

    it('throws on invalid options/fn type', function() {
      expect(() => {
        this.registerHandler('', [])
      }).to.throw(/Invalid second argument: should be a object or function$/)
    })

    it('throws on invalid options.timeout type', function() {
      expect(() => {
        this.registerHandler('', { timeout: '1' }, function() {})
      }).to.throw(/Invalid "options.timeout": should be a integer$/)
    })

    it('throws on invalid fn type', function() {
      expect(() => {
        this.registerHandler('', {}, 'code')
      }).to.throw(/Invalid third argument: should be a function$/)
    })
  })
})
