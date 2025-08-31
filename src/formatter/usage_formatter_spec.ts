import { afterEach, beforeEach, describe, it } from 'mocha'
import { expect } from 'chai'
import FakeTimers, { InstalledClock } from '@sinonjs/fake-timers'
import { reindent } from 'reindent-template-literals'
import timeMethods from '../time'
import {
  getBasicUsageSupportCodeLibrary,
  getOrderedUsageSupportCodeLibrary,
} from '../../test/fixtures/usage/usage_steps'
import { testFormatter } from '../../test/formatter_helpers'
import { UsageOrder } from './helpers'

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
        const supportCodeLibrary = getBasicUsageSupportCodeLibrary(clock)

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
            │ abc            │ UNUSED   │ usage_steps.ts:13 │
            ├────────────────┼──────────┼───────────────────┤
            │ /def?/         │ UNUSED   │ usage_steps.ts:18 │
            ├────────────────┼──────────┼───────────────────┤
            │ ghi            │ UNUSED   │ usage_steps.ts:27 │
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
          const supportCodeLibrary = getBasicUsageSupportCodeLibrary(clock)

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
              │ abc            │ UNUSED   │ usage_steps.ts:13 │
              ├────────────────┼──────────┼───────────────────┤
              │ /def?/         │ -        │ usage_steps.ts:18 │
              │   de           │ -        │ a.feature:4       │
              │   def          │ -        │ a.feature:3       │
              ├────────────────┼──────────┼───────────────────┤
              │ ghi            │ UNUSED   │ usage_steps.ts:27 │
              └────────────────┴──────────┴───────────────────┘

            `)
          )
        })
      })

      describe('not in dry run', () => {
        it('outputs the step definition with durations', async () => {
          // Arrange
          const sources = [
            {
              data: 'Feature: a\nScenario: b\nWhen def\nThen de',
              uri: 'a.feature',
            },
          ]
          const supportCodeLibrary = getBasicUsageSupportCodeLibrary(clock)

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
              │ /def?/         │ 1.50ms   │ usage_steps.ts:18 │
              │   def          │ 2.00ms   │ a.feature:3       │
              │   de           │ 1.00ms   │ a.feature:4       │
              ├────────────────┼──────────┼───────────────────┤
              │ abc            │ UNUSED   │ usage_steps.ts:13 │
              ├────────────────┼──────────┼───────────────────┤
              │ ghi            │ UNUSED   │ usage_steps.ts:27 │
              └────────────────┴──────────┴───────────────────┘

            `)
          )
        })
      })

      describe('sorting', () => {
        const sources = [
          {
            data: 'Feature: a\nScenario: a\nGiven foo\nThen bar',
            uri: 'a.feature',
          },
          {
            data: 'Feature: b\nScenario: b\nGiven foo\nThen bar',
            uri: 'b.feature',
          },
        ]

        it('defaults to order by execution time, decreasingly', async () => {
          const supportCodeLibrary = getOrderedUsageSupportCodeLibrary(clock)

          // Act
          const output = await testFormatter({
            sources,
            supportCodeLibrary,
            type: 'usage',
          })

          // Assert
          expect(output).to.eql(
            reindent(`
              ┌────────────────┬──────────┬─────────────────┐
              │ Pattern / Text │ Duration │ Location        │
              ├────────────────┼──────────┼─────────────────┤
              │ foo            │ 15.00ms  │ foo_steps.ts:10 │
              │   foo          │ 20.00ms  │ b.feature:3     │
              │   foo          │ 10.00ms  │ a.feature:3     │
              ├────────────────┼──────────┼─────────────────┤
              │ bar            │ 3.00ms   │ bar_steps.ts:10 │
              │   bar          │ 4.00ms   │ b.feature:4     │
              │   bar          │ 2.00ms   │ a.feature:4     │
              └────────────────┴──────────┴─────────────────┘

            `)
          )
        })

        it('can optionally order by location', async () => {
          const supportCodeLibrary = getOrderedUsageSupportCodeLibrary(clock)

          // Act
          const output = await testFormatter({
            sources,
            supportCodeLibrary,
            type: 'usage',
            parsedArgvOptions: { usage: { order: UsageOrder.LOCATION } },
          })

          // Assert
          expect(output).to.eql(
            reindent(`
              ┌────────────────┬──────────┬─────────────────┐
              │ Pattern / Text │ Duration │ Location        │
              ├────────────────┼──────────┼─────────────────┤
              │ bar            │ 3.00ms   │ bar_steps.ts:10 │
              │   bar          │ 2.00ms   │ a.feature:4     │
              │   bar          │ 4.00ms   │ b.feature:4     │
              ├────────────────┼──────────┼─────────────────┤
              │ foo            │ 15.00ms  │ foo_steps.ts:10 │
              │   foo          │ 10.00ms  │ a.feature:3     │
              │   foo          │ 20.00ms  │ b.feature:3     │
              └────────────────┴──────────┴─────────────────┘

            `)
          )
        })
      })
    })
  })
})
