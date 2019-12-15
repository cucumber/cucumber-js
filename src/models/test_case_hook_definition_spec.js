import { describe, it } from 'mocha'
import { expect } from 'chai'
import TestCaseHookDefinition from './test_case_hook_definition'
import { getPickleWithTags } from '../../test/gherkin_helpers'

describe('TestCaseHookDefinition', () => {
  describe('appliesToTestCase', () => {
    describe('no tags', () => {
      it('returns true', async () => {
        // Arrange
        const pickle = await getPickleWithTags([])
        const testCaseHookDefinition = new TestCaseHookDefinition({
          options: {},
        })

        // Act
        const result = testCaseHookDefinition.appliesToTestCase(pickle)

        // Assert
        expect(result).to.eql(true)
      })
    })

    describe('tags match', () => {
      it('returns true', async () => {
        // Arrange
        const pickle = await getPickleWithTags(['@tagA'])
        const testCaseHookDefinition = new TestCaseHookDefinition({
          options: { tags: '@tagA' },
        })

        // Act
        const result = testCaseHookDefinition.appliesToTestCase(pickle)

        // Assert
        expect(result).to.eql(true)
      })
    })

    describe('tags do not match', () => {
      it('returns false', async () => {
        // Arrange
        const pickle = await getPickleWithTags([])
        const testCaseHookDefinition = new TestCaseHookDefinition({
          options: { tags: '@tagA' },
        })

        // Act
        const result = testCaseHookDefinition.appliesToTestCase(pickle)

        // Assert
        expect(result).to.eql(false)
      })
    })
  })
})
