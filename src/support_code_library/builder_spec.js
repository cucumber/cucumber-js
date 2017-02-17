import {ParameterRegistry} from 'cucumber-expressions'
import SupportCodeLibraryBuilder from './builder'

describe('SupportCodeLibraryBuilder', function () {
  describe('no support code fns', function() {
    beforeEach(function() {
      this.attachFn = sinon.stub()
      this.options = SupportCodeLibraryBuilder.build({cwd: 'path/to/project', fns: []})
    })

    it('returns the default options', function() {
      expect(this.options.afterHookDefinitions).to.eql([])
      expect(this.options.beforeHookDefinitions).to.eql([])
      expect(this.options.defaultTimeout).to.eql(5000)
      expect(this.options.listeners).to.eql([])
      expect(this.options.stepDefinitions).to.eql([])
      expect(this.options.parameterRegistry).to.be.instanceOf(ParameterRegistry)
      const worldInstance = new this.options.World({
        attach: this.attachFn,
        parameters: {some: 'data'}
      })
      expect(worldInstance.attach).to.eql(this.attachFn)
      expect(worldInstance.parameters).to.eql({some: 'data'})
    })
  })

  describe('After', function() {
    describe('function only', function() {
      beforeEach(function() {
        const hook = function() {}
        const fn = ({After}) => {
          After(hook) // eslint-disable-line babel/new-cap
        }
        this.hook = hook
        this.options = SupportCodeLibraryBuilder.build({cwd: 'path/to/project', fns: [fn]})
      })

      it('adds a after hook definition', function() {
        expect(this.options.afterHookDefinitions).to.have.lengthOf(1)
        expect(this.options.afterHookDefinitions[0].code).to.eql(this.hook)
      })
    })

    describe('tag and function', function() {
      beforeEach(function() {
        const hook = function() {}
        const fn = ({After}) => {
          After('@tagA', hook) // eslint-disable-line babel/new-cap
        }
        this.hook = hook
        this.options = SupportCodeLibraryBuilder.build({cwd: 'path/to/project', fns: [fn]})
      })

      it('adds a after hook definition', function() {
        expect(this.options.afterHookDefinitions).to.have.lengthOf(1)
        expect(this.options.afterHookDefinitions[0].options.tags).to.eql('@tagA')
        expect(this.options.afterHookDefinitions[0].code).to.eql(this.hook)
      })
    })

    describe('options and function', function() {
      beforeEach(function() {
        const hook = function() {}
        const fn = ({After}) => {
          After({tags: '@tagA'}, hook) // eslint-disable-line babel/new-cap
        }
        this.hook = hook
        this.options = SupportCodeLibraryBuilder.build({cwd: 'path/to/project', fns: [fn]})
      })

      it('adds a after hook definition', function() {
        expect(this.options.afterHookDefinitions).to.have.lengthOf(1)
        expect(this.options.afterHookDefinitions[0].options.tags).to.eql('@tagA')
        expect(this.options.afterHookDefinitions[0].code).to.eql(this.hook)
      })
    })

    describe('multiple', function() {
      beforeEach(function() {
        this.hook1 = function hook1() {}
        this.hook2 = function hook2() {}
        const fn = ({After}) => {
          After(this.hook1) // eslint-disable-line babel/new-cap
          After(this.hook2) // eslint-disable-line babel/new-cap
        }
        this.options = SupportCodeLibraryBuilder.build({cwd: 'path/to/project', fns: [fn]})
      })

      it('adds the hook definitions in the reverse order of definition', function() {
        expect(this.options.afterHookDefinitions).to.have.lengthOf(2)
        expect(this.options.afterHookDefinitions[0].code).to.eql(this.hook2)
        expect(this.options.afterHookDefinitions[1].code).to.eql(this.hook1)
      })
    })
  })

  describe('this.Before', function() {
    describe('function only', function() {
      beforeEach(function() {
        const hook = function() {}
        const fn = ({Before}) => {
          Before(hook) // eslint-disable-line babel/new-cap
        }
        this.hook = hook
        this.options = SupportCodeLibraryBuilder.build({cwd: 'path/to/project', fns: [fn]})
      })

      it('adds a before hook definition', function() {
        expect(this.options.beforeHookDefinitions).to.have.lengthOf(1)
        expect(this.options.beforeHookDefinitions[0].code).to.eql(this.hook)
      })
    })

    describe('tag and function', function() {
      beforeEach(function() {
        const hook = function() {}
        const fn = ({Before}) => {
          Before('@tagA', hook) // eslint-disable-line babel/new-cap
        }
        this.hook = hook
        this.options = SupportCodeLibraryBuilder.build({cwd: 'path/to/project', fns: [fn]})
      })

      it('adds a before hook definition', function() {
        expect(this.options.beforeHookDefinitions).to.have.lengthOf(1)
        expect(this.options.beforeHookDefinitions[0].options.tags).to.eql('@tagA')
        expect(this.options.beforeHookDefinitions[0].code).to.eql(this.hook)
      })
    })

    describe('options and function', function() {
      beforeEach(function() {
        const hook = function() {}
        const fn = ({Before}) => {
          Before({tags: '@tagA'}, hook) // eslint-disable-line babel/new-cap
        }
        this.hook = hook
        this.options = SupportCodeLibraryBuilder.build({cwd: 'path/to/project', fns: [fn]})
      })

      it('adds a before hook definition', function() {
        expect(this.options.beforeHookDefinitions).to.have.lengthOf(1)
        expect(this.options.beforeHookDefinitions[0].options.tags).to.eql('@tagA')
        expect(this.options.beforeHookDefinitions[0].code).to.eql(this.hook)
      })
    })

    describe('multiple', function() {
      beforeEach(function() {
        this.hook1 = function hook1() {}
        this.hook2 = function hook2() {}
        const fn = ({Before}) => {
          Before(this.hook1) // eslint-disable-line babel/new-cap
          Before(this.hook2) // eslint-disable-line babel/new-cap
        }
        this.options = SupportCodeLibraryBuilder.build({cwd: 'path/to/project', fns: [fn]})
      })

      it('adds the hook definitions in the order of definition', function() {
        expect(this.options.beforeHookDefinitions).to.have.lengthOf(2)
        expect(this.options.beforeHookDefinitions[0].code).to.eql(this.hook1)
        expect(this.options.beforeHookDefinitions[1].code).to.eql(this.hook2)
      })
    })
  })
})
