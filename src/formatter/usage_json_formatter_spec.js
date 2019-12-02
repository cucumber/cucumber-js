import { afterEach, beforeEach, describe, it } from 'mocha'
import { expect } from 'chai'
import lolex from 'lolex'
import timeMethods from '../time'
import { getUsageJsonSupportCodeLibrary } from '../../test/fixtures/usage_json_formatter_steps'
import { testFormatter } from '../../test/formatter_helpers'

describe('UsageJsonFormatter', () => {
  let clock

  beforeEach(() => {
    clock = lolex.install({ target: timeMethods })
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
    const supportCodeLibrary = getUsageJsonSupportCodeLibrary(clock)

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
        code: 'function () {\n      clock.tick(2);\n    }',
        line: 11,
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
        pattern: 'def',
        patternType: 'RegularExpression',
        uri: 'fixtures/usage_json_formatter_steps.js',
      },
      {
        code: 'function () {\n      clock.tick(1);\n    }',
        line: 7,
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
        uri: 'fixtures/usage_json_formatter_steps.js',
      },
      {
        code: 'function () {}',
        line: 15,
        matches: [],
        pattern: 'ghi',
        patternType: 'CucumberExpression',
        uri: 'fixtures/usage_json_formatter_steps.js',
      },
    ])
  })
})
