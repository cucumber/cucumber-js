import { afterEach, beforeEach, describe, it } from 'mocha'
import { expect } from 'chai'
import lolex from 'lolex'
import timeMethods from '../time'
import { getUsageFormatterSupportCodeLibrary } from '../../test/fixtures/usage_formatter_steps'
import { testFormatter } from '../../test/formatter_helpers'

describe('UsageFormatter', () => {
  let clock

  beforeEach(() => {
    clock = lolex.install({ target: timeMethods })
  })

  afterEach(() => {
    clock.uninstall()
  })

  describe('no step definitions', () => {
    it('outputs "No step definitions"', async () => {
      // Arrange

      // Act
      const output = await testFormatter({ type: 'usage' })

      // Assert
      expect(output).to.eql('No step definitions')
    })
  })

  describe('with step definitions', () => {
    describe('unused', () => {
      it('outputs the step definitions as unused', async () => {
        // Arrange
        const supportCodeLibrary = getUsageFormatterSupportCodeLibrary(clock)

        // Act
        const output = await testFormatter({
          supportCodeLibrary,
          type: 'usage',
        })

        // Assert
        expect(output).to.eql(
          '┌────────────────┬──────────┬──────────────────────────────────────┐\n' +
            '│ Pattern / Text │ Duration │ Location                             │\n' +
            '├────────────────┼──────────┼──────────────────────────────────────┤\n' +
            '│ abc            │ UNUSED   │ fixtures/usage_formatter_steps.js:7  │\n' +
            '├────────────────┼──────────┼──────────────────────────────────────┤\n' +
            '│ /def?/         │ UNUSED   │ fixtures/usage_formatter_steps.js:12 │\n' +
            '├────────────────┼──────────┼──────────────────────────────────────┤\n' +
            '│ ghi            │ UNUSED   │ fixtures/usage_formatter_steps.js:21 │\n' +
            '└────────────────┴──────────┴──────────────────────────────────────┘\n'
        )
      })
    })

    describe('used', () => {
      describe('in dry run', () => {
        it('outputs the step definition without durations', async () => {
          // Arrange
          const runtimeOptions = { dryRun: true }
          const sources = [
            {
              data: 'Feature: a\nScenario: b\nWhen def\nThen de',
              uri: 'a.feature',
            },
          ]
          const supportCodeLibrary = getUsageFormatterSupportCodeLibrary(clock)

          // Act
          const output = await testFormatter({
            runtimeOptions,
            sources,
            supportCodeLibrary,
            type: 'usage',
          })

          // Assert
          expect(output).to.eql(
            '┌────────────────┬──────────┬──────────────────────────────────────┐\n' +
              '│ Pattern / Text │ Duration │ Location                             │\n' +
              '├────────────────┼──────────┼──────────────────────────────────────┤\n' +
              '│ abc            │ UNUSED   │ fixtures/usage_formatter_steps.js:7  │\n' +
              '├────────────────┼──────────┼──────────────────────────────────────┤\n' +
              '│ /def?/         │ -        │ fixtures/usage_formatter_steps.js:12 │\n' +
              '│   de           │ -        │ a.feature:4                          │\n' +
              '│   def          │ -        │ a.feature:3                          │\n' +
              '├────────────────┼──────────┼──────────────────────────────────────┤\n' +
              '│ ghi            │ UNUSED   │ fixtures/usage_formatter_steps.js:21 │\n' +
              '└────────────────┴──────────┴──────────────────────────────────────┘\n'
          )
        })
      })

      describe('not in dry run', () => {
        it('outputs the step definition without durations', async () => {
          // Arrange
          const sources = [
            {
              data: 'Feature: a\nScenario: b\nWhen def\nThen de',
              uri: 'a.feature',
            },
          ]
          const supportCodeLibrary = getUsageFormatterSupportCodeLibrary(clock)

          // Act
          const output = await testFormatter({
            sources,
            supportCodeLibrary,
            type: 'usage',
          })

          // Assert
          expect(output).to.eql(
            '┌────────────────┬──────────┬──────────────────────────────────────┐\n' +
              '│ Pattern / Text │ Duration │ Location                             │\n' +
              '├────────────────┼──────────┼──────────────────────────────────────┤\n' +
              '│ /def?/         │ 1.50ms   │ fixtures/usage_formatter_steps.js:12 │\n' +
              '│   def          │ 2ms      │ a.feature:3                          │\n' +
              '│   de           │ 1ms      │ a.feature:4                          │\n' +
              '├────────────────┼──────────┼──────────────────────────────────────┤\n' +
              '│ abc            │ UNUSED   │ fixtures/usage_formatter_steps.js:7  │\n' +
              '├────────────────┼──────────┼──────────────────────────────────────┤\n' +
              '│ ghi            │ UNUSED   │ fixtures/usage_formatter_steps.js:21 │\n' +
              '└────────────────┴──────────┴──────────────────────────────────────┘\n'
          )
        })
      })
    })
  })
})
