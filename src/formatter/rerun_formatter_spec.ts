import { describe, it } from 'mocha'
import { expect } from 'chai'
import { buildSupportCodeLibrary } from '../../test/runtime_helpers'
import { testFormatter } from '../../test/formatter_helpers'

const onePickleSources = [
  {
    data: 'Feature: a\nScenario: b\nGiven a step',
    uri: 'a.feature',
  },
]

describe('RerunFormatter', () => {
  describe('with no scenarios', () => {
    it('outputs nothing', async () => {
      // Arrange

      // Act
      const output = await testFormatter({ type: 'rerun' })

      // Assert
      expect(output).to.eql('')
    })
  })

  describe('with one scenario', () => {
    describe('passed', () => {
      it('outputs nothing', async () => {
        // Arrange
        const supportCodeLibrary = buildSupportCodeLibrary(({ Given }) => {
          Given('a step', function () {}) // eslint-disable-line @typescript-eslint/no-empty-function
        })

        // Act
        const output = await testFormatter({
          sources: onePickleSources,
          supportCodeLibrary,
          type: 'rerun',
        })

        // Assert
        expect(output).to.eql('')
      })
    })

    describe('ambiguous', () => {
      it('outputs the reference needed to run the scenario again', async () => {
        // Arrange
        const supportCodeLibrary = buildSupportCodeLibrary(({ Given }) => {
          Given('a step', function () {}) // eslint-disable-line @typescript-eslint/no-empty-function
          Given('a step', function () {}) // eslint-disable-line @typescript-eslint/no-empty-function
        })

        // Act
        const output = await testFormatter({
          sources: onePickleSources,
          supportCodeLibrary,
          type: 'rerun',
        })

        // Assert
        expect(output).to.eql('a.feature:2')
      })
    })

    describe('failed', () => {
      it('outputs the reference needed to run the scenario again', async () => {
        // Arrange
        const supportCodeLibrary = buildSupportCodeLibrary(({ Given }) => {
          Given('a step', function () {
            throw new Error('error')
          })
        })

        // Act
        const output = await testFormatter({
          sources: onePickleSources,
          supportCodeLibrary,
          type: 'rerun',
        })

        // Assert
        expect(output).to.eql('a.feature:2')
      })
    })

    describe('pending', () => {
      it('outputs the reference needed to run the scenario again', async () => {
        // Arrange
        const supportCodeLibrary = buildSupportCodeLibrary(({ Given }) => {
          Given('a step', function () {
            return 'pending'
          })
        })

        // Act
        const output = await testFormatter({
          sources: onePickleSources,
          supportCodeLibrary,
          type: 'rerun',
        })

        // Assert
        expect(output).to.eql('a.feature:2')
      })
    })

    describe('skipped', () => {
      it('outputs the reference needed to run the scenario again', async () => {
        // Arrange
        const supportCodeLibrary = buildSupportCodeLibrary(({ Given }) => {
          Given('a step', function () {
            return 'skipped'
          })
        })

        // Act
        const output = await testFormatter({
          sources: onePickleSources,
          supportCodeLibrary,
          type: 'rerun',
        })

        // Assert
        expect(output).to.eql('a.feature:2')
      })
    })

    describe('undefined', () => {
      it('outputs the reference needed to run the scenario again', async () => {
        // Arrange

        // Act
        const output = await testFormatter({
          sources: onePickleSources,
          type: 'rerun',
        })

        // Assert
        expect(output).to.eql('a.feature:2')
      })
    })
  })

  describe('with two failing scenarios in the same file', () => {
    it('outputs the reference needed to run the scenario again', async () => {
      // Arrange
      const sources = [
        {
          data: 'Feature: a\nScenario: b\nGiven a step\nScenario: c\nGiven a step',
          uri: 'a.feature',
        },
      ]

      // Act
      const output = await testFormatter({ sources, type: 'rerun' })

      // Assert
      expect(output).to.eql('a.feature:2:4')
    })
  })

  describe('with two failing scenarios in different files', () => {
    const examples = [
      { separator: { opt: undefined, expected: '\n' }, label: 'default' },
      { separator: { opt: '\n', expected: '\n' }, label: 'newline' },
      { separator: { opt: ' ', expected: ' ' }, label: 'space' },
    ]
    examples.forEach(({ separator, label }) => {
      describe(`using ${label} separator`, () => {
        it('outputs the reference needed to run the scenario again', async () => {
          // Arrange
          const parsedArgvOptions = { rerun: { separator: separator.opt } }
          const sources = [
            {
              data: 'Feature: a\nScenario: b\nGiven a step',
              uri: 'a.feature',
            },
            {
              data: 'Feature: a\n\nScenario: b\nGiven a step',
              uri: 'b.feature',
            },
          ]

          // Act
          const output = await testFormatter({
            parsedArgvOptions,
            sources,
            type: 'rerun',
          })

          // Assert
          expect(output).to.eql(`a.feature:2${separator.expected}b.feature:3`)
        })

        it('outputs the reference needed to run the rule example again', async () => {
          // Arrange
          const parsedArgvOptions = { rerun: { separator: separator.opt } }
          const sources = [
            {
              data: 'Feature: a\nRule: b\nExample: c\nGiven a step',
              uri: 'a.feature',
            },
            {
              data: 'Feature: a\n\nRule: b\nExample: c\nGiven a step',
              uri: 'b.feature',
            },
          ]

          // Act
          const output = await testFormatter({
            parsedArgvOptions,
            sources,
            type: 'rerun',
          })

          // Assert
          expect(output).to.eql(`a.feature:3${separator.expected}b.feature:4`)
        })
      })
    })
  })
})
