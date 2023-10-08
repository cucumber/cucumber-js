import { afterEach, beforeEach, describe, it } from 'mocha'
import { expect } from 'chai'
import { reindent } from 'reindent-template-literals'
import figures from 'figures'
import FakeTimers, { InstalledClock } from '@sinonjs/fake-timers'
import { testFormatter } from '../../test/formatter_helpers'
import { getBaseSupportCodeLibrary } from '../../test/fixtures/steps'
import timeMethods from '../time'

describe('ProgressFormatter', () => {
  let clock: InstalledClock

  beforeEach(() => {
    clock = FakeTimers.withGlobal(timeMethods).install()
  })

  afterEach(() => {
    clock.uninstall()
  })

  it('outputs a character for each step representing the status and then prints the summary format', async () => {
    // Arrange
    const sources = [
      {
        data: reindent(`
          Feature: a
            Scenario: a1
              Given an ambiguous step
            Scenario: a2
              Given a failing step
            Scenario: a3
              Given a pending step
            Scenario: a4
              Given a passing step
            Scenario: a5
              Given a skipped step
            Scenario: a6
              Given an undefined step
          `),
        uri: 'a.feature',
      },
    ]
    const supportCodeLibrary = getBaseSupportCodeLibrary()

    // Act
    const output = await testFormatter({
      sources,
      supportCodeLibrary,
      type: 'progress',
    })

    // Assert
    expect(output).to.eql(
      reindent(`
        AFP.-U

        Failures:

        1) Scenario: a1 # a.feature:2
           ${figures.cross} Given an ambiguous step
               Multiple step definitions match:
                 an ambiguous step    - steps.ts:13
                 /an? ambiguous step/ - steps.ts:14

        2) Scenario: a2 # a.feature:4
           ${figures.cross} Given a failing step # steps.ts:9
               error

        3) Scenario: a6 # a.feature:12
           ? Given an undefined step
               Undefined. Implement with the following snippet:

                 Given('an undefined step', function () {
                   // Write code here that turns the phrase above into concrete actions
                   return 'pending';
                 });


        Warnings:

        1) Scenario: a3 # a.feature:6
           ? Given a pending step # steps.ts:16
               Pending

        6 scenarios (1 failed, 1 ambiguous, 1 undefined, 1 pending, 1 skipped, 1 passed)
        6 steps (1 failed, 1 ambiguous, 1 undefined, 1 pending, 1 skipped, 1 passed)
        <duration-stat>

      `)
    )
  })

  it('handles rule/example results', async () => {
    // Arrange
    const sources = [
      {
        data: reindent(`
          Feature: feature
            Rule: rule1
              Example: example1
                Given a passing step

              Example: example2
                Given a passing step

            Rule: rule2
              Example: example1
                Given a passing step
          `),
        uri: 'a.feature',
      },
    ]
    const supportCodeLibrary = getBaseSupportCodeLibrary()

    // Act
    const output = await testFormatter({
      sources,
      supportCodeLibrary,
      type: 'progress',
    })

    // Assert
    expect(output).to.eql(
      reindent(`
        ...

        3 scenarios (3 passed)
        3 steps (3 passed)
        <duration-stat>

      `)
    )
  })
})
