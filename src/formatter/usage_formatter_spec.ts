import { afterEach, beforeEach, describe, it } from 'mocha'
import { expect } from 'chai'
import FakeTimers, { InstalledClock } from '@sinonjs/fake-timers'
import { reindent } from 'reindent-template-literals'
import timeMethods from '../time'
import { getUsageSupportCodeLibrary } from '../../test/fixtures/usage_steps'
import { testFormatter } from '../../test/formatter_helpers'

describe('UsageFormatter', () => {
  let clock: InstalledClock

  beforeEach(() => {
    clock = FakeTimers.withGlobal(timeMethods).install()
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
        expect(output).to.eql(
          reindent(`
            ┌────────────────┬──────────┬───────────────────┐
            │ Pattern / Text │ Duration │ Location          │
            ├────────────────┼──────────┼───────────────────┤
            │ abc            │ UNUSED   │ usage_steps.ts:11 │
            ├────────────────┼──────────┼───────────────────┤
            │ /def?/         │ UNUSED   │ usage_steps.ts:16 │
            ├────────────────┼──────────┼───────────────────┤
            │ ghi            │ UNUSED   │ usage_steps.ts:25 │
            └────────────────┴──────────┴───────────────────┘

          `)
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
          const supportCodeLibrary = getUsageSupportCodeLibrary(clock)

          // Act
          const output = await testFormatter({
            runtimeOptions,
            sources,
            supportCodeLibrary,
            type: 'usage',
          })

          // Assert
          expect(output).to.eql(
            reindent(`
              ┌────────────────┬──────────┬───────────────────┐
              │ Pattern / Text │ Duration │ Location          │
              ├────────────────┼──────────┼───────────────────┤
              │ abc            │ UNUSED   │ usage_steps.ts:11 │
              ├────────────────┼──────────┼───────────────────┤
              │ /def?/         │ -        │ usage_steps.ts:16 │
              │   de           │ -        │ a.feature:4       │
              │   def          │ -        │ a.feature:3       │
              ├────────────────┼──────────┼───────────────────┤
              │ ghi            │ UNUSED   │ usage_steps.ts:25 │
              └────────────────┴──────────┴───────────────────┘

            `)
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
          const supportCodeLibrary = getUsageSupportCodeLibrary(clock)

          // Act
          const output = await testFormatter({
            sources,
            supportCodeLibrary,
            type: 'usage',
          })

          // Assert
          expect(output).to.eql(
            reindent(`
              ┌────────────────┬──────────┬───────────────────┐
              │ Pattern / Text │ Duration │ Location          │
              ├────────────────┼──────────┼───────────────────┤
              │ /def?/         │ 1.50ms   │ usage_steps.ts:16 │
              │   def          │ 2.00ms   │ a.feature:3       │
              │   de           │ 1.00ms   │ a.feature:4       │
              ├────────────────┼──────────┼───────────────────┤
              │ abc            │ UNUSED   │ usage_steps.ts:11 │
              ├────────────────┼──────────┼───────────────────┤
              │ ghi            │ UNUSED   │ usage_steps.ts:25 │
              └────────────────┴──────────┴───────────────────┘

            `)
          )
        })
      })
    })
  })
})
