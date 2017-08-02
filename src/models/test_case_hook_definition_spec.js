import TestCaseHookDefinition from './test_case_hook_definition'

describe('TestCaseHookDefinition', function() {
  describe('appliesToTestCase', function() {
    beforeEach(function() {
      this.input = {
        pickle: {
          tags: []
        },
        uri: ''
      }
    })

    describe('no tags', function() {
      beforeEach(function() {
        this.testCaseHookDefinition = new TestCaseHookDefinition({
          options: {}
        })
      })

      it('returns true', function() {
        expect(this.testCaseHookDefinition.appliesToTestCase(this.input)).to.be
          .true
      })
    })

    describe('tags match', function() {
      beforeEach(function() {
        this.input.pickle.tags = [{ name: '@tagA' }]
        this.testCaseHookDefinition = new TestCaseHookDefinition({
          options: { tags: '@tagA' }
        })
      })

      it('returns true', function() {
        expect(this.testCaseHookDefinition.appliesToTestCase(this.input)).to.be
          .true
      })
    })

    describe('tags do not match', function() {
      beforeEach(function() {
        this.testCaseHookDefinition = new TestCaseHookDefinition({
          options: { tags: '@tagA' }
        })
      })

      it('returns false', function() {
        expect(this.testCaseHookDefinition.appliesToTestCase(this.input)).to.be
          .false
      })
    })
  })
})
