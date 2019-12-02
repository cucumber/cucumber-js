import { describe, it } from 'mocha'
import { expect } from 'chai'
import _ from 'lodash'
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

  describe(`with one scenario`, () => {
    describe('passed', () => {
      it('outputs nothing', async () => {
        // Arrange
        const supportCodeLibrary = buildSupportCodeLibrary(({ Given }) => {
          Given('a step', function() {})
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
          Given('a step', function() {})
          Given('a step', function() {})
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
          Given('a step', function() {
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
          Given('a step', function() {
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
          Given('a step', function() {
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
          data:
            'Feature: a\nScenario: b\nGiven a step\nScenario: c\nGiven a step',
          uri: 'a.feature',
        },
      ]

      // Act
      const output = await testFormatter({ sources, type: 'rerun' })

      // Assert
      expect(output).to.eql(`a.feature:2:4`)
    })
  })

  describe('with two failing scenarios in different files', () => {
    _.each(
      [
        { separator: { opt: undefined, expected: '\n' }, label: 'default' },
        { separator: { opt: '\n', expected: '\n' }, label: 'newline' },
        { separator: { opt: ' ', expected: ' ' }, label: 'space' },
      ],
      ({ separator, label }) => {
        describe(`using ${label} separator`, () => {
          it('outputs the reference needed to run the scenario again', async () => {
            // Arrange
            const formatterOptions = { rerun: { separator: separator.opt } }
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
              formatterOptions,
              sources,
              type: 'rerun',
            })

            // Assert
            expect(output).to.eql(`a.feature:2${separator.expected}b.feature:3`)
          })
        })
      }
    )
  })
})
