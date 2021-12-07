import { afterEach, beforeEach, describe, it } from 'mocha'
import { expect } from 'chai'
import figures from 'figures'
import FakeTimers, { InstalledClock } from '@sinonjs/fake-timers'
import timeMethods from '../time'
import { testFormatter } from '../../test/formatter_helpers'
import { getBaseSupportCodeLibrary } from '../../test/fixtures/steps'
import { buildSupportCodeLibrary } from '../../test/runtime_helpers'

describe('SummaryFormatter', () => {
  let clock: InstalledClock

  beforeEach(() => {
    clock = FakeTimers.withGlobal(timeMethods).install()
  })

  afterEach(() => {
    clock.uninstall()
  })

  describe('issues', () => {
    describe('with a failing scenario', () => {
      it('logs the issue', async () => {
        // Arrange
        const sources = [
          {
            data: 'Feature: a\nScenario: b\nGiven a failing step',
            uri: 'a.feature',
          },
        ]
        const supportCodeLibrary = getBaseSupportCodeLibrary()

        // Act
        const output = await testFormatter({
          sources,
          supportCodeLibrary,
          type: 'summary',
        })

        // Assert
        expect(output).to.eql(
          'Failures:\n' +
            '\n' +
            '1) Scenario: b # a.feature:2\n' +
            `   ${figures.cross} Given a failing step # steps.ts:9\n` +
            '       error\n' +
            '\n' +
            '1 scenario (1 failed)\n' +
            '1 step (1 failed)\n' +
            '<duration-stat>\n'
        )
      })
    })

    describe('with a failing rule -> example', () => {
      it('logs the issue', async () => {
        // Arrange
        const sources = [
          {
            data: 'Feature: a\nRule: b\nExample: c\nGiven a failing step',
            uri: 'a.feature',
          },
        ]
        const supportCodeLibrary = getBaseSupportCodeLibrary()

        // Act
        const output = await testFormatter({
          sources,
          supportCodeLibrary,
          type: 'summary',
        })

        // Assert
        expect(output).to.eql(
          'Failures:\n' +
            '\n' +
            '1) Scenario: c # a.feature:3\n' +
            `   ${figures.cross} Given a failing step # steps.ts:9\n` +
            '       error\n' +
            '\n' +
            '1 scenario (1 failed)\n' +
            '1 step (1 failed)\n' +
            '<duration-stat>\n'
        )
      })
    })

    describe('with an ambiguous step', () => {
      it('logs the issue', async () => {
        // Arrange
        const sources = [
          {
            data: 'Feature: a\nScenario: b\nGiven an ambiguous step',
            uri: 'a.feature',
          },
        ]
        const supportCodeLibrary = getBaseSupportCodeLibrary()

        // Act
        const output = await testFormatter({
          sources,
          supportCodeLibrary,
          type: 'summary',
        })

        // Assert
        expect(output).to.eql(
          'Failures:\n' +
            '\n' +
            '1) Scenario: b # a.feature:2\n' +
            `   ${figures.cross} Given an ambiguous step\n` +
            '       Multiple step definitions match:\n' +
            '         an ambiguous step    - steps.ts:13\n' +
            '         /an? ambiguous step/ - steps.ts:14\n' +
            '\n' +
            '1 scenario (1 ambiguous)\n' +
            '1 step (1 ambiguous)\n' +
            '<duration-stat>\n'
        )
      })
    })

    describe('with an undefined step', () => {
      it('logs the issue', async () => {
        // Arrange
        const sources = [
          {
            data: 'Feature: a\nScenario: b\nGiven an undefined step',
            uri: 'a.feature',
          },
        ]

        // Act
        const output = await testFormatter({
          sources,
          type: 'summary',
        })

        // Assert
        expect(output).to.eql(
          'Failures:\n' +
            '\n' +
            '1) Scenario: b # a.feature:2\n' +
            '   ? Given an undefined step\n' +
            '       Undefined. Implement with the following snippet:\n' +
            '\n' +
            "         Given('an undefined step', function () {\n" +
            '           // Write code here that turns the phrase above into concrete actions\n' +
            "           return 'pending';\n" +
            '         });\n' +
            '\n' +
            '\n' +
            '1 scenario (1 undefined)\n' +
            '1 step (1 undefined)\n' +
            '<duration-stat>\n'
        )
      })
    })

    describe('with a pending step', () => {
      it('logs the issue', async () => {
        // Arrange
        const sources = [
          {
            data: 'Feature: a\nScenario: b\nGiven a pending step',
            uri: 'a.feature',
          },
        ]
        const supportCodeLibrary = getBaseSupportCodeLibrary()

        // Act
        const output = await testFormatter({
          sources,
          supportCodeLibrary,
          type: 'summary',
        })

        // Assert
        expect(output).to.eql(
          'Warnings:\n' +
            '\n' +
            '1) Scenario: b # a.feature:2\n' +
            '   ? Given a pending step # steps.ts:16\n' +
            '       Pending\n' +
            '\n' +
            '1 scenario (1 pending)\n' +
            '1 step (1 pending)\n' +
            '<duration-stat>\n'
        )
      })
    })

    describe('retrying a flaky step', () => {
      it('logs the issue', async () => {
        const runtimeOptions = { retry: 1 }
        const sources = [
          {
            data: 'Feature: a\nScenario: b\nGiven a flaky step',
            uri: 'a.feature',
          },
        ]
        const supportCodeLibrary = getBaseSupportCodeLibrary()

        // Act
        const output = await testFormatter({
          runtimeOptions,
          sources,
          supportCodeLibrary,
          type: 'summary',
        })

        // Assert
        expect(output).to.eql(
          'Warnings:\n' +
            '\n' +
            '1) Scenario: b (attempt 1, retried) # a.feature:2\n' +
            `   ${figures.cross} Given a flaky step # steps.ts:21\n` +
            '       error\n' +
            '\n' +
            '1 scenario (1 passed)\n' +
            '1 step (1 passed)\n' +
            '<duration-stat>\n'
        )
      })
    })

    describe('retrying with a failing step', () => {
      it('logs the issue', async () => {
        const runtimeOptions = { retry: 1 }
        const sources = [
          {
            data: 'Feature: a\nScenario: b\nGiven a failing step',
            uri: 'a.feature',
          },
        ]
        const supportCodeLibrary = getBaseSupportCodeLibrary()

        // Act
        const output = await testFormatter({
          runtimeOptions,
          sources,
          supportCodeLibrary,
          type: 'summary',
        })

        // Assert
        expect(output).to.eql(
          'Failures:\n' +
            '\n' +
            '1) Scenario: b (attempt 2) # a.feature:2\n' +
            `   ${figures.cross} Given a failing step # steps.ts:9\n` +
            '       error\n' +
            '\n' +
            'Warnings:\n' +
            '\n' +
            '1) Scenario: b (attempt 1, retried) # a.feature:2\n' +
            `   ${figures.cross} Given a failing step # steps.ts:9\n` +
            '       error\n' +
            '\n' +
            '1 scenario (1 failed)\n' +
            '1 step (1 failed)\n' +
            '<duration-stat>\n'
        )
      })
    })

    describe('with an undefined parameter type', () => {
      it('logs the issue', async () => {
        // Arrange
        const sources = [
          {
            data: 'Feature: a\nScenario: b\nGiven a step',
            uri: 'a.feature',
          },
        ]
        const supportCodeLibrary = buildSupportCodeLibrary(({ Given }) => {
          Given('a step', function () {}) // eslint-disable-line @typescript-eslint/no-empty-function
          Given('a {param} step', function () {}) // eslint-disable-line @typescript-eslint/no-empty-function
          Given('another {param} step', function () {}) // eslint-disable-line @typescript-eslint/no-empty-function
          Given('a different {foo} step', function () {}) // eslint-disable-line @typescript-eslint/no-empty-function
        })

        // Act
        const output = await testFormatter({
          sources,
          supportCodeLibrary,
          type: 'summary',
        })

        // Assert
        expect(output).to.eql(
          `Undefined parameter types:

- "param" e.g. \`another {param} step\`
- "foo" e.g. \`a different {foo} step\`

1 scenario (1 passed)
1 step (1 passed)
<duration-stat>
`
        )
      })
    })
  })
})
