import {TransformLookup} from 'cucumber-expressions'
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
      expect(this.options.transformLookup).to.be.instanceOf(TransformLookup)
      const worldInstance = new this.options.World({
        attach: this.attachFn,
        parameters: {some: 'data'}
      })
      expect(worldInstance.attach).to.eql(this.attachFn)
      expect(worldInstance.parameters).to.eql({some: 'data'})
    })
  })

  describe('this.After', function() {
    describe('function only', function() {
      beforeEach(function() {
        const hook = function() {}
        const fn = function() {
          this.After(hook) // eslint-disable-line babel/new-cap
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
        const fn = function() {
          this.After('@tagA', hook) // eslint-disable-line babel/new-cap
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
        const fn = function() {
          this.After({tags: '@tagA'}, hook) // eslint-disable-line babel/new-cap
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
  })

  describe('this.Before', function() {
    describe('function only', function() {
      beforeEach(function() {
        const hook = function() {}
        const fn = function() {
          this.Before(hook) // eslint-disable-line babel/new-cap
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
        const fn = function() {
          this.Before('@tagA', hook) // eslint-disable-line babel/new-cap
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
        const fn = function() {
          this.Before({tags: '@tagA'}, hook) // eslint-disable-line babel/new-cap
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
  })
})
