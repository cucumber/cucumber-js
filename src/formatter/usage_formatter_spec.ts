import { afterEach, beforeEach, describe, it } from 'mocha'
import { expect } from 'chai'
import lolex from 'lolex'
import timeMethods from '../time'
import { getUsageSupportCodeLibrary } from '../../test/fixtures/usage_steps'
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
        const supportCodeLibrary = getUsageSupportCodeLibrary(clock)

        // Act
        const output = await testFormatter({
          supportCodeLibrary,
          type: 'usage',
        })

        // Assert
        expect(output).to.eql(`\
┌────────────────┬──────────┬───────────────────┐
│ Pattern / Text │ Duration │ Location          │
├────────────────┼──────────┼───────────────────┤
│ abc            │ UNUSED   │ usage_steps.ts:7  │
├────────────────┼──────────┼───────────────────┤
│ /def?/         │ UNUSED   │ usage_steps.ts:12 │
├────────────────┼──────────┼───────────────────┤
│ ghi            │ UNUSED   │ usage_steps.ts:21 │
└────────────────┴──────────┴───────────────────┘
`)
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
          const supportCodeLibrary = getUsageSupportCodeLibrary(clock)

          // Act
          const output = await testFormatter({
            runtimeOptions,
            sources,
            supportCodeLibrary,
            type: 'usage',
          })

          // Assert
          expect(output).to.eql(`\
┌────────────────┬──────────┬───────────────────┐
│ Pattern / Text │ Duration │ Location          │
├────────────────┼──────────┼───────────────────┤
│ abc            │ UNUSED   │ usage_steps.ts:7  │
├────────────────┼──────────┼───────────────────┤
│ /def?/         │ -        │ usage_steps.ts:12 │
│   de           │ -        │ a.feature:4       │
│   def          │ -        │ a.feature:3       │
├────────────────┼──────────┼───────────────────┤
│ ghi            │ UNUSED   │ usage_steps.ts:21 │
└────────────────┴──────────┴───────────────────┘
`)
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
          const supportCodeLibrary = getUsageSupportCodeLibrary(clock)

          // Act
          const output = await testFormatter({
            sources,
            supportCodeLibrary,
            type: 'usage',
          })

          // Assert
          expect(output).to.eql(`\
┌────────────────┬──────────┬───────────────────┐
│ Pattern / Text │ Duration │ Location          │
├────────────────┼──────────┼───────────────────┤
│ /def?/         │ 1.50ms   │ usage_steps.ts:12 │
│   def          │ 2ms      │ a.feature:3       │
│   de           │ 1ms      │ a.feature:4       │
├────────────────┼──────────┼───────────────────┤
│ abc            │ UNUSED   │ usage_steps.ts:7  │
├────────────────┼──────────┼───────────────────┤
│ ghi            │ UNUSED   │ usage_steps.ts:21 │
└────────────────┴──────────┴───────────────────┘
`)
        })
      })
    })
  })
})
