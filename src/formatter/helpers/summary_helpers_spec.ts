import { afterEach, beforeEach, describe, it } from 'mocha'
import { expect } from 'chai'
import getColorFns from '../get_color_fns'
import { formatSummary } from './summary_helpers'
import { getTestCaseAttempts } from '../../../test/formatter_helpers'
import { getBaseSupportCodeLibrary } from '../../../test/fixtures/steps'
import FakeTimers, { InstalledClock } from '@sinonjs/fake-timers'
import timeMethods, { durationBetweenTimestamps } from '../../time'
import { buildSupportCodeLibrary } from '../../../test/runtime_helpers'
import { IRuntimeOptions } from '../../runtime'
import { ISupportCodeLibrary } from '../../support_code_library_builder/types'
import { doesNotHaveValue } from '../../value_checker'
import * as messages from '@cucumber/messages'

interface ITestFormatSummaryOptions {
  runtimeOptions?: Partial<IRuntimeOptions>
  sourceData: string
  supportCodeLibrary?: ISupportCodeLibrary
  testRunStarted?: messages.TestRunStarted
  testRunFinished?: messages.TestRunFinished
}

async function testFormatSummary({
  runtimeOptions,
  sourceData,
  supportCodeLibrary,
  testRunStarted,
  testRunFinished,
}: ITestFormatSummaryOptions): Promise<string> {
  const sources = [
    {
      data: sourceData,
      uri: 'project/a.feature',
    },
  ]
  if (doesNotHaveValue(supportCodeLibrary)) {
    supportCodeLibrary = getBaseSupportCodeLibrary()
  }
  if (doesNotHaveValue(testRunStarted)) {
    testRunStarted = {
      timestamp: messages.TimeConversion.millisecondsSinceEpochToTimestamp(0),
    }
  }
  if (doesNotHaveValue(testRunFinished)) {
    testRunFinished = {
      timestamp: messages.TimeConversion.millisecondsSinceEpochToTimestamp(0),
      success: true,
    }
  }
  const testCaseAttempts = await getTestCaseAttempts({
    runtimeOptions,
    sources,
    supportCodeLibrary,
  })
  return formatSummary({
    colorFns: getColorFns(false),
    testCaseAttempts,
    testRunDuration: durationBetweenTimestamps(
      testRunStarted.timestamp,
      testRunFinished.timestamp
    ),
  })
}

describe('SummaryHelpers', () => {
  let clock: InstalledClock

  beforeEach(() => {
    clock = FakeTimers.withGlobal(timeMethods).install()
  })

  afterEach(() => {
    clock.uninstall()
  })

  describe('formatSummary', () => {
    describe('with no test cases', () => {
      it('outputs step totals, scenario totals, and duration', async () => {
        // Arrange
        const sourceData = ''

        // Act
        const output = await testFormatSummary({ sourceData })

        // Assert
        expect(output).to.contain(
          '0 scenarios\n' +
            '0 steps\n' +
            '0m00.000s (executing steps: 0m00.000s)\n'
        )
      })
    })

    describe('with one passing scenario with one passing step', () => {
      it('outputs the totals and number of each status', async () => {
        // Arrange
        const sourceData = [
          'Feature: a',
          'Scenario: b',
          'Given a passing step',
        ].join('\n')

        // Act
        const output = await testFormatSummary({ sourceData })

        // Assert
        expect(output).to.contain(
          '1 scenario (1 passed)\n' +
            '1 step (1 passed)\n' +
            '0m00.000s (executing steps: 0m00.000s)\n'
        )
      })
    })

    describe('with one passing scenario with one step and hook', () => {
      it('filter out the hooks', async () => {
        // Arrange
        const sourceData = [
          'Feature: a',
          'Scenario: b',
          'Given a passing step',
        ].join('\n')
        const supportCodeLibrary = buildSupportCodeLibrary(
          ({ Given, Before }) => {
            Given('a passing step', () => {}) // eslint-disable-line @typescript-eslint/no-empty-function
            Before(() => {}) // eslint-disable-line @typescript-eslint/no-empty-function
          }
        )

        // Act
        const output = await testFormatSummary({
          sourceData,
          supportCodeLibrary,
        })

        // Assert
        expect(output).to.contain(
          '1 scenario (1 passed)\n' +
            '1 step (1 passed)\n' +
            '0m00.000s (executing steps: 0m00.000s)\n'
        )
      })
    })

    describe('with one scenario that failed and was retried then passed', () => {
      it('filters out the retried attempts', async () => {
        // Arrange
        const sourceData = [
          'Feature: a',
          'Scenario: b',
          'Given a flaky step',
        ].join('\n')
        const supportCodeLibrary = buildSupportCodeLibrary(({ Given }) => {
          let willPass = false
          Given('a flaky step', function () {
            if (willPass) {
              return
            }
            willPass = true
            throw 'error' // eslint-disable-line @typescript-eslint/no-throw-literal
          })
        })

        // Act
        const output = await testFormatSummary({
          runtimeOptions: { retry: 1 },
          sourceData,
          supportCodeLibrary,
        })

        // Assert
        expect(output).to.contain(
          '1 scenario (1 passed)\n' +
            '1 step (1 passed)\n' +
            '0m00.000s (executing steps: 0m00.000s)\n'
        )
      })
    })

    describe('with one passing scenario with multiple passing steps', () => {
      it('outputs the totals and number of each status', async () => {
        // Arrange
        const sourceData = [
          'Feature: a',
          'Scenario: b',
          'Given a passing step',
          'Then a passing step',
        ].join('\n')

        // Act
        const output = await testFormatSummary({ sourceData })

        // Assert
        expect(output).to.contain(
          '1 scenario (1 passed)\n' +
            '2 steps (2 passed)\n' +
            '0m00.000s (executing steps: 0m00.000s)\n'
        )
      })
    })

    describe('with one of every kind of scenario', () => {
      it('outputs the totals and number of each status', async () => {
        // Arrange
        const sourceData = [
          'Feature: a',
          '  Scenario: a1',
          '    Given an ambiguous step',
          '  Scenario: a2',
          '    Given a failing step',
          '  Scenario: a3',
          '    Given a pending step',
          '  Scenario: a4',
          '    Given a passing step',
          '  Scenario: a5',
          '    Given a skipped step',
          '  Scenario: a6',
          '    Given an undefined step',
        ].join('\n')

        // Act
        const output = await testFormatSummary({ sourceData })

        // Assert
        expect(output).to.contain(
          '6 scenarios (1 failed, 1 ambiguous, 1 undefined, 1 pending, 1 skipped, 1 passed)\n' +
            '6 steps (1 failed, 1 ambiguous, 1 undefined, 1 pending, 1 skipped, 1 passed)\n' +
            '0m00.000s (executing steps: 0m00.000s)\n'
        )
      })
    })

    describe('with a test run finished timestamp of 124 milliseconds and total step duration of 123 milliseconds', () => {
      it('outputs the duration as `0m00.124s (executing steps: 0m00.123s)`', async () => {
        // Arrange
        const sourceData = [
          'Feature: a',
          'Scenario: b',
          'Given a passing step',
        ].join('\n')
        const supportCodeLibrary = buildSupportCodeLibrary(
          ({ Given, Before }) => {
            Given('a passing step', () => {
              clock.tick(123)
            })
          }
        )

        // Act
        const output = await testFormatSummary({
          sourceData,
          supportCodeLibrary,
          testRunStarted: {
            timestamp: {
              nanos: 0,
              seconds: 3,
            },
          },
          testRunFinished: {
            timestamp: {
              nanos: 124000000,
              seconds: 3,
            },
            success: true,
          },
        })

        // Assert
        expect(output).to.contain(
          '1 scenario (1 passed)\n' +
            '1 step (1 passed)\n' +
            '0m00.124s (executing steps: 0m00.123s)\n'
        )
      })
    })

    describe('with a test run finished timestamp of 12.4 seconds and total step duration of 12.3 seconds', () => {
      it('outputs the duration as `0m12.400s (executing steps: 0m12.300s)`', async () => {
        // Arrange
        const sourceData = [
          'Feature: a',
          'Scenario: b',
          'Given a passing step',
        ].join('\n')
        const supportCodeLibrary = buildSupportCodeLibrary(
          ({ Given, Before }) => {
            Given('a passing step', () => {
              clock.tick(12.3 * 1000)
            })
          }
        )

        // Act
        const output = await testFormatSummary({
          sourceData,
          supportCodeLibrary,
          testRunFinished: {
            timestamp: {
              nanos: 400000000,
              seconds: 12,
            },
            success: true,
          },
        })

        // Assert
        expect(output).to.contain(
          '1 scenario (1 passed)\n' +
            '1 step (1 passed)\n' +
            '0m12.400s (executing steps: 0m12.300s)\n'
        )
      })
    })

    describe('with a test run finished timestamp of 124 seconds and total step duration of 123 seconds', () => {
      it('outputs the duration as `2m04.000s (executing steps: 2m03.000s)`', async () => {
        // Arrange
        const sourceData = [
          'Feature: a',
          'Scenario: b',
          'Given a passing step',
        ].join('\n')
        const supportCodeLibrary = buildSupportCodeLibrary(
          ({ Given, Before }) => {
            Given('a passing step', () => {
              clock.tick(123 * 1000)
            })
          }
        )

        // Act
        const output = await testFormatSummary({
          sourceData,
          supportCodeLibrary,
          testRunFinished: {
            timestamp: {
              nanos: 0,
              seconds: 124,
            },
            success: true,
          },
        })

        // Assert
        expect(output).to.contain(
          '1 scenario (1 passed)\n' +
            '1 step (1 passed)\n' +
            '2m04.000s (executing steps: 2m03.000s)\n'
        )
      })
    })

    describe('with one passing scenario with one step and a beforeStep and afterStep hook', () => {
      it('outputs the duration as `0m24.000s (executing steps: 0m24.000s)`', async () => {
        // Arrange
        const sourceData = [
          'Feature: a',
          'Scenario: b',
          'Given a passing step',
        ].join('\n')
        const supportCodeLibrary = buildSupportCodeLibrary(
          ({ Given, BeforeStep, AfterStep }) => {
            Given('a passing step', () => {
              clock.tick(12.3 * 1000)
            })
            BeforeStep(() => {
              clock.tick(5 * 1000)
            })
            AfterStep(() => {
              clock.tick(6.7 * 1000)
            })
          }
        )

        // Act
        const output = await testFormatSummary({
          sourceData,
          supportCodeLibrary,
          testRunFinished: {
            timestamp: {
              nanos: 0,
              seconds: 24,
            },
            success: true,
          },
        })

        // Assert
        expect(output).to.contain(
          '1 scenario (1 passed)\n' +
            '1 step (1 passed)\n' +
            '0m24.000s (executing steps: 0m24.000s)\n'
        )
      })
    })
  })
})
