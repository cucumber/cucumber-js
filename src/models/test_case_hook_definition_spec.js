import { beforeEach, describe, it } from 'mocha'
import { expect } from 'chai'
import TestCaseHookDefinition from './test_case_hook_definition'

describe('TestCaseHookDefinition', () => {
  describe('appliesToTestCase', () => {
    beforeEach(function() {
      this.input = {
        pickle: {
          tags: [],
        },
        uri: '',
      }
    })

    describe('no tags', () => {
      beforeEach(function() {
        this.testCaseHookDefinition = new TestCaseHookDefinition({
          options: {},
        })
      })

      it('returns true', function() {
        expect(
          this.testCaseHookDefinition.appliesToTestCase(this.input)
        ).to.eql(true)
      })
    })

    describe('tags match', () => {
      beforeEach(function() {
        this.input.pickle.tags = [{ name: '@tagA' }]
        this.testCaseHookDefinition = new TestCaseHookDefinition({
          options: { tags: '@tagA' },
        })
      })

      it('returns true', function() {
        expect(
          this.testCaseHookDefinition.appliesToTestCase(this.input)
        ).to.eql(true)
      })
    })

    describe('tags do not match', () => {
      beforeEach(function() {
        this.testCaseHookDefinition = new TestCaseHookDefinition({
          options: { tags: '@tagA' },
        })
      })

      it('returns false', function() {
        expect(
          this.testCaseHookDefinition.appliesToTestCase(this.input)
        ).to.eql(false)
      })
    })
  })
})
