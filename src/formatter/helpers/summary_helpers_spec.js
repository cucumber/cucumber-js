import { afterEach, beforeEach, describe, it } from 'mocha'
import { expect } from 'chai'
import getColorFns from '../get_color_fns'
import { formatSummary } from './summary_helpers'
import { getTestCaseAttempts } from '../../../test/formatter_helpers'
import { getBaseSupportCodeLibrary } from '../../../test/fixtures/steps'
import lolex from 'lolex'
import timeMethods from '../../time'
import { buildSupportCodeLibrary } from '../../../test/runtime_helpers'

async function testFormatSummary({
  runtimeOptions,
  sourceData,
  supportCodeLibrary,
}) {
  const sources = [
    {
      data: sourceData,
      uri: 'project/a.feature',
    },
  ]
  if (!supportCodeLibrary) {
    supportCodeLibrary = getBaseSupportCodeLibrary()
  }
  const testCaseAttempts = await getTestCaseAttempts({
    runtimeOptions,
    sources,
    supportCodeLibrary,
  })
  return formatSummary({
    colorFns: getColorFns(false),
    testCaseAttempts,
  })
}

describe('SummaryHelpers', () => {
  let clock

  beforeEach(() => {
    clock = lolex.install({ target: timeMethods })
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
        expect(output).to.contain('0 scenarios\n' + '0 steps\n' + '0m00.000s\n')
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
          '1 scenario (1 passed)\n' + '1 step (1 passed)\n' + '0m00.000s\n'
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
            Given('a passing step', () => {})
            Before(() => {})
          }
        )

        // Act
        const output = await testFormatSummary({
          sourceData,
          supportCodeLibrary,
        })

        // Assert
        expect(output).to.contain(
          '1 scenario (1 passed)\n' + '1 step (1 passed)\n' + '0m00.000s\n'
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
          Given('a flaky step', function() {
            if (willPass) {
              return
            }
            willPass = true
            throw 'error' // eslint-disable-line no-throw-literal
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
          '1 scenario (1 passed)\n' + '1 step (1 passed)\n' + '0m00.000s\n'
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
          '1 scenario (1 passed)\n' + '2 steps (2 passed)\n' + '0m00.000s\n'
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
            '0m00.000s\n'
        )
      })
    })

    describe('with a duration of 123 milliseconds', () => {
      it('outputs the duration as 0m00.123s', async () => {
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
        })

        // Assert
        expect(output).to.contain(
          '1 scenario (1 passed)\n' + '1 step (1 passed)\n' + '0m00.123s\n'
        )
      })
    })

    describe('with a duration of 12.3 seconds', () => {
      it('outputs the duration as 0m12.300s', async () => {
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
        })

        // Assert
        expect(output).to.contain(
          '1 scenario (1 passed)\n' + '1 step (1 passed)\n' + '0m12.300s\n'
        )
      })
    })

    describe('with a duration of 123 seconds', () => {
      it('outputs the duration as 2m03.000s', async () => {
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
        })

        // Assert
        expect(output).to.contain(
          '1 scenario (1 passed)\n' + '1 step (1 passed)\n' + '2m03.000s\n'
        )
      })
    })
  })
})
