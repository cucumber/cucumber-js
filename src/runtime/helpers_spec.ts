import { describe, it } from 'mocha'
import { expect } from 'chai'
import { getPickleWithTags } from '../../test/gherkin_helpers'
import StepDefinition from '../models/step_definition'
import { buildOptions } from '../../test/runtime_helpers'
import { getAmbiguousStepException, retriesForPickle } from './helpers'

describe('Helpers', () => {
  describe('getAmbiguousStepException', () => {
    it('returns a nicely formatted error', function () {
      // Arrange
      const stepDefinitions = [
        new StepDefinition({
          code: undefined,
          expression: undefined,
          id: '',
          options: undefined,
          line: 3,
          keyword: 'Given',
          pattern: 'pattern1',
          uri: 'steps1.js',
        }),
        new StepDefinition({
          code: undefined,
          expression: undefined,
          id: '',
          options: undefined,
          line: 4,
          keyword: 'Given',
          pattern: 'longer pattern2',
          uri: 'steps2.js',
        }),
      ]

      // Act
      const result = getAmbiguousStepException(stepDefinitions)

      // Assert
      expect(result).to.eql(
        'Multiple step definitions match:\n' +
          '  pattern1        - steps1.js:3\n' +
          '  longer pattern2 - steps2.js:4'
      )
    })
  })

  describe('retriesForPickle', () => {
    it('returns 0 if options.retry is not set', async () => {
      // Arrange
      const pickle = await getPickleWithTags([])
      const options = buildOptions({})

      // Act
      const result = retriesForPickle(pickle, options)

      // Assert
      expect(result).to.eql(0)
    })

    it('returns options.retry if set and no options.retryTagFilter is specified', async () => {
      // Arrange
      const pickle = await getPickleWithTags([])
      const options = buildOptions({ retry: 1 })

      // Act
      const result = retriesForPickle(pickle, options)

      // Assert
      expect(result).to.eql(1)
    })

    it('returns options.retry is set and the pickle tags match options.retryTagFilter', async () => {
      // Arrange
      const pickle = await getPickleWithTags(['@retry'])
      const options = buildOptions({
        retry: 1,
        retryTagFilter: '@retry',
      })

      // Act
      const result = retriesForPickle(pickle, options)

      // Assert
      expect(result).to.eql(1)
    })

    it('returns 0 if options.retry is set but the pickle tags do not match options.retryTagFilter', async () => {
      // Arrange
      const pickle = await getPickleWithTags([])
      const options = buildOptions({
        retry: 1,
        retryTagFilter: '@retry',
      })

      // Act
      const result = retriesForPickle(pickle, options)

      // Assert
      expect(result).to.eql(0)
    })
  })
})
