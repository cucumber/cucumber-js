import { afterEach, beforeEach, describe, it } from 'mocha'
import { expect } from 'chai'
import FakeTimers, { InstalledClock } from '@sinonjs/fake-timers'
import timeMethods from '../time'
import { getUsageSupportCodeLibrary } from '../../test/fixtures/usage_steps'
import { testFormatter } from '../../test/formatter_helpers'

describe('UsageJsonFormatter', () => {
  let clock: InstalledClock

  beforeEach(() => {
    clock = FakeTimers.withGlobal(timeMethods).install()
  })

  afterEach(() => {
    clock.uninstall()
  })

  it('outputs the usage in json format', async () => {
    // Arrange
    const sources = [
      {
        data: 'Feature: a\nScenario: b\nGiven abc\nWhen def',
        uri: 'a.feature',
      },
    ]
    const supportCodeLibrary = getUsageSupportCodeLibrary(clock)

    // Act
    const output = await testFormatter({
      sources,
      supportCodeLibrary,
      type: 'usage-json',
    })
    const parsedOutput = JSON.parse(output)

    // Assert
    expect(parsedOutput).to.eql([
      {
        code: parsedOutput[0].code,
        line: 16,
        matches: [
          {
            duration: {
              seconds: 0,
              nanos: 2000000,
            },
            line: 4,
            text: 'def',
            uri: 'a.feature',
          },
        ],
        meanDuration: {
          seconds: 0,
          nanos: 2000000,
        },
        pattern: 'def?',
        patternType: 'RegularExpression',
        uri: 'usage_steps.ts',
      },
      {
        code: parsedOutput[1].code,
        line: 11,
        matches: [
          {
            duration: {
              seconds: 0,
              nanos: 1000000,
            },
            line: 3,
            text: 'abc',
            uri: 'a.feature',
          },
        ],
        meanDuration: {
          seconds: 0,
          nanos: 1000000,
        },
        pattern: 'abc',
        patternType: 'CucumberExpression',
        uri: 'usage_steps.ts',
      },
      {
        code: parsedOutput[2].code,
        line: 25,
        matches: [],
        pattern: 'ghi',
        patternType: 'CucumberExpression',
        uri: 'usage_steps.ts',
      },
    ])
  })
})
