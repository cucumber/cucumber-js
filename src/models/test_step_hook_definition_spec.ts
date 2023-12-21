import { describe, it } from 'mocha'
import { expect } from 'chai'
import { getPickleWithTags } from '../../test/gherkin_helpers'
import TestStepHookDefinition from './test_step_hook_definition'

describe('TestStepHookDefinition', () => {
  describe('appliesToTestCase', () => {
    describe('no tags', () => {
      it('returns true', async () => {
        // Arrange
        const pickle = await getPickleWithTags([])
        const testStepHookDefinition = new TestStepHookDefinition({
          code: undefined,
          id: '',
          line: 0,
          uri: '',
          options: {},
        })

        // Act
        const result = testStepHookDefinition.appliesToTestCase(pickle)

        // Assert
        expect(result).to.eql(true)
      })
    })

    describe('tags match', () => {
      it('returns true', async () => {
        // Arrange
        const pickle = await getPickleWithTags(['@tagA'])
        const testStepHookDefinition = new TestStepHookDefinition({
          code: undefined,
          id: '',
          line: 0,
          uri: '',
          options: { tags: '@tagA' },
        })

        // Act
        const result = testStepHookDefinition.appliesToTestCase(pickle)

        // Assert
        expect(result).to.eql(true)
      })
    })

    describe('tags do not match', () => {
      it('returns false', async () => {
        // Arrange
        const pickle = await getPickleWithTags([])
        const testStepHookDefinition = new TestStepHookDefinition({
          code: undefined,
          id: '',
          line: 0,
          uri: '',
          options: { tags: '@tagA' },
        })

        // Act
        const result = testStepHookDefinition.appliesToTestCase(pickle)

        // Assert
        expect(result).to.eql(false)
      })
    })
  })
})
