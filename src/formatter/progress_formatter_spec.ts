import { beforeEach, afterEach, describe, it } from 'mocha'
import { expect } from 'chai'
import { getBaseSupportCodeLibrary } from '../../test/fixtures/steps'
import { testFormatter } from '../../test/formatter_helpers'
import figures from 'figures'
import lolex, { InstalledClock } from 'lolex'
import timeMethods from '../time'

describe('ProgressFormatter', () => {
  let clock: InstalledClock

  beforeEach(() => {
    clock = lolex.install({ target: timeMethods })
  })

  afterEach(() => {
    clock.uninstall()
  })

  it('outputs a character for each step representing the status and then prints the summary format', async () => {
    // Arrange
    const sources = [
      {
        data: `\
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
`,
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
    expect(output).to.eql(`\
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
0m00.000s
`)
  })
})
