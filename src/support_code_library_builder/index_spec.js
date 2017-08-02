import { ParameterTypeRegistry } from 'cucumber-expressions'
import supportCodeLibraryBuilder from './'

describe('supportCodeLibraryBuilder', function() {
  describe('no support code fns', function() {
    beforeEach(function() {
      this.attachFn = sinon.stub()
      supportCodeLibraryBuilder.reset('path/to/project')
      this.options = supportCodeLibraryBuilder.finalize()
    })

    it('returns the default options', function() {
      expect(this.options.afterTestRunHookDefinitions).to.eql([])
      expect(this.options.afterTestCaseHookDefinitions).to.eql([])
      expect(this.options.beforeTestRunHookDefinitions).to.eql([])
      expect(this.options.beforeTestCaseHookDefinitions).to.eql([])
      expect(this.options.defaultTimeout).to.eql(5000)
      expect(this.options.stepDefinitions).to.eql([])
      expect(this.options.parameterTypeRegistry).to.be.instanceOf(
        ParameterTypeRegistry
      )
      const worldInstance = new this.options.World({
        attach: this.attachFn,
        parameters: { some: 'data' }
      })
      expect(worldInstance.attach).to.eql(this.attachFn)
      expect(worldInstance.parameters).to.eql({ some: 'data' })
    })
  })

  describe('After', function() {
    describe('function only', function() {
      beforeEach(function() {
        const hook = function() {}
        const fn = ({ After }) => {
          After(hook) // eslint-disable-line babel/new-cap
        }
        this.hook = hook
        supportCodeLibraryBuilder.reset('path/to/project')
        supportCodeLibraryBuilder.methods.defineSupportCode(fn)
        this.options = supportCodeLibraryBuilder.finalize()
      })

      it('adds a scenario hook definition', function() {
        expect(this.options.afterTestCaseHookDefinitions).to.have.lengthOf(1)
        expect(this.options.afterTestCaseHookDefinitions[0].code).to.eql(
          this.hook
        )
      })
    })

    describe('tag and function', function() {
      beforeEach(function() {
        const hook = function() {}
        const fn = ({ After }) => {
          After('@tagA', hook) // eslint-disable-line babel/new-cap
        }
        this.hook = hook
        supportCodeLibraryBuilder.reset('path/to/project')
        supportCodeLibraryBuilder.methods.defineSupportCode(fn)
        this.options = supportCodeLibraryBuilder.finalize()
      })

      it('adds a scenario hook definition', function() {
        expect(this.options.afterTestCaseHookDefinitions).to.have.lengthOf(1)
        expect(
          this.options.afterTestCaseHookDefinitions[0].options.tags
        ).to.eql('@tagA')
        expect(this.options.afterTestCaseHookDefinitions[0].code).to.eql(
          this.hook
        )
      })
    })

    describe('options and function', function() {
      beforeEach(function() {
        const hook = function() {}
        const fn = ({ After }) => {
          After({ tags: '@tagA' }, hook) // eslint-disable-line babel/new-cap
        }
        this.hook = hook
        supportCodeLibraryBuilder.reset('path/to/project')
        supportCodeLibraryBuilder.methods.defineSupportCode(fn)
        this.options = supportCodeLibraryBuilder.finalize()
      })

      it('adds a scenario hook definition', function() {
        expect(this.options.afterTestCaseHookDefinitions).to.have.lengthOf(1)
        expect(
          this.options.afterTestCaseHookDefinitions[0].options.tags
        ).to.eql('@tagA')
        expect(this.options.afterTestCaseHookDefinitions[0].code).to.eql(
          this.hook
        )
      })
    })

    describe('multiple', function() {
      beforeEach(function() {
        this.hook1 = function hook1() {}
        this.hook2 = function hook2() {}
        const fn = ({ After }) => {
          After(this.hook1) // eslint-disable-line babel/new-cap
          After(this.hook2) // eslint-disable-line babel/new-cap
        }
        supportCodeLibraryBuilder.reset('path/to/project')
        supportCodeLibraryBuilder.methods.defineSupportCode(fn)
        this.options = supportCodeLibraryBuilder.finalize()
      })

      it('adds the scenario hook definitions in the reverse order of definition', function() {
        expect(this.options.afterTestCaseHookDefinitions).to.have.lengthOf(2)
        expect(this.options.afterTestCaseHookDefinitions[0].code).to.eql(
          this.hook2
        )
        expect(this.options.afterTestCaseHookDefinitions[1].code).to.eql(
          this.hook1
        )
      })
    })
  })

  describe('this.Before', function() {
    describe('function only', function() {
      beforeEach(function() {
        const hook = function() {}
        const fn = ({ Before }) => {
          Before(hook) // eslint-disable-line babel/new-cap
        }
        this.hook = hook
        supportCodeLibraryBuilder.reset('path/to/project')
        supportCodeLibraryBuilder.methods.defineSupportCode(fn)
        this.options = supportCodeLibraryBuilder.finalize()
      })

      it('adds a scenario hook definition', function() {
        expect(this.options.beforeTestCaseHookDefinitions).to.have.lengthOf(1)
        expect(this.options.beforeTestCaseHookDefinitions[0].code).to.eql(
          this.hook
        )
      })
    })

    describe('tag and function', function() {
      beforeEach(function() {
        const hook = function() {}
        const fn = ({ Before }) => {
          Before('@tagA', hook) // eslint-disable-line babel/new-cap
        }
        this.hook = hook
        supportCodeLibraryBuilder.reset('path/to/project')
        supportCodeLibraryBuilder.methods.defineSupportCode(fn)
        this.options = supportCodeLibraryBuilder.finalize()
      })

      it('adds a scenario hook definition', function() {
        expect(this.options.beforeTestCaseHookDefinitions).to.have.lengthOf(1)
        expect(
          this.options.beforeTestCaseHookDefinitions[0].options.tags
        ).to.eql('@tagA')
        expect(this.options.beforeTestCaseHookDefinitions[0].code).to.eql(
          this.hook
        )
      })
    })

    describe('options and function', function() {
      beforeEach(function() {
        const hook = function() {}
        const fn = ({ Before }) => {
          Before({ tags: '@tagA' }, hook) // eslint-disable-line babel/new-cap
        }
        this.hook = hook
        supportCodeLibraryBuilder.reset('path/to/project')
        supportCodeLibraryBuilder.methods.defineSupportCode(fn)
        this.options = supportCodeLibraryBuilder.finalize()
      })

      it('adds a scenario hook definition', function() {
        expect(this.options.beforeTestCaseHookDefinitions).to.have.lengthOf(1)
        expect(
          this.options.beforeTestCaseHookDefinitions[0].options.tags
        ).to.eql('@tagA')
        expect(this.options.beforeTestCaseHookDefinitions[0].code).to.eql(
          this.hook
        )
      })
    })

    describe('multiple', function() {
      beforeEach(function() {
        this.hook1 = function hook1() {}
        this.hook2 = function hook2() {}
        const fn = ({ Before }) => {
          Before(this.hook1) // eslint-disable-line babel/new-cap
          Before(this.hook2) // eslint-disable-line babel/new-cap
        }
        supportCodeLibraryBuilder.reset('path/to/project')
        supportCodeLibraryBuilder.methods.defineSupportCode(fn)
        this.options = supportCodeLibraryBuilder.finalize()
      })

      it('adds the scenario hook definitions in the order of definition', function() {
        expect(this.options.beforeTestCaseHookDefinitions).to.have.lengthOf(2)
        expect(this.options.beforeTestCaseHookDefinitions[0].code).to.eql(
          this.hook1
        )
        expect(this.options.beforeTestCaseHookDefinitions[1].code).to.eql(
          this.hook2
        )
      })
    })
  })
})
