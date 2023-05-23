import { afterEach, beforeEach, describe, it } from 'mocha'
import { expect, use } from 'chai'
import chaiXml from 'chai-xml'
import FakeTimers, { InstalledClock } from '@sinonjs/fake-timers'
import timeMethods from '../time'
import { testFormatter } from '../../test/formatter_helpers'
import { ISupportCodeLibrary } from '../support_code_library_builder/types'
import { buildSupportCodeLibrary } from '../../test/runtime_helpers'

use(chaiXml)

function getJUnitFormatterSupportCodeLibrary(
  clock: InstalledClock
): ISupportCodeLibrary {
  return buildSupportCodeLibrary(__dirname, ({ Before, After, Given }) => {
    Before(function () {}) // eslint-disable-line @typescript-eslint/no-empty-function
    After(function () {}) // eslint-disable-line @typescript-eslint/no-empty-function

    Given('a passing step', function () {
      clock.tick(1)
    })

    Given('I have <![CDATA[cukes]]> in my belly', function () {
      clock.tick(1)
    })

    let willPass = false
    Given('a flaky step', function () {
      clock.tick(1)
      if (willPass) {
        return
      }
      willPass = true
      throw 'error' // eslint-disable-line @typescript-eslint/no-throw-literal
    })

    Given('a failing step', function () {
      clock.tick(1)
      throw 'error' // eslint-disable-line @typescript-eslint/no-throw-literal
    })

    Given('a failing step with invalid character', function () {
      clock.tick(1)
      throw 'Error: include \x08invalid character' // eslint-disable-line @typescript-eslint/no-throw-literal
    })

    Given('a pending step', function () {
      clock.tick(1)
      return 'pending'
    })

    Given('a skipped step', function () {
      return 'skipped'
    })
  })
}

describe('JunitFormatter', () => {
  let clock: InstalledClock

  beforeEach(() => {
    clock = FakeTimers.withGlobal(timeMethods).install()
  })

  afterEach(() => {
    clock.uninstall()
  })

  describe('no features', () => {
    it('outputs an empty <testsuite>', async () => {
      // Arrange

      // Act
      const output = await testFormatter({ type: 'junit' })

      // Assert
      expect(output).xml.to.deep.equal(
        '<?xml version="1.0"?>\n' +
          '<testsuite failures="0" skipped="0" name="cucumber-js" time="0" tests="0"/>'
      )
    })
  })

  describe('one scenario with one step', () => {
    describe('passed', () => {
      it('outputs the feature', async () => {
        // Arrange
        const sources = [
          {
            data: [
              'Feature: my feature',
              '  my feature description',
              '',
              '  Scenario: my scenario',
              '    my scenario description',
              '',
              '    Given a passing step',
            ].join('\n'),
            uri: 'a.feature',
          },
        ]

        const supportCodeLibrary = getJUnitFormatterSupportCodeLibrary(clock)

        // Act
        const output = await testFormatter({
          sources,
          supportCodeLibrary,
          type: 'junit',
        })

        // Assert
        expect(output).xml.to.deep.equal(
          '<?xml version="1.0"?>\n' +
            '<testsuite failures="0" skipped="0" name="cucumber-js" time="0.001" tests="1">\n' +
            '  <testcase classname="my feature" name="my scenario" time="0.001">\n' +
            '    <system-out><![CDATA[Given a passing step......................................................passed]]></system-out>\n' +
            '  </testcase>\n' +
            '</testsuite>'
        )
      })
    })

    describe('failed', () => {
      it('includes the error message', async () => {
        // Arrange
        const sources = [
          {
            data: [
              'Feature: my feature',
              '  Scenario: my scenario',
              '    Given a failing step',
            ].join('\n'),
            uri: 'a.feature',
          },
        ]

        const supportCodeLibrary = getJUnitFormatterSupportCodeLibrary(clock)

        // Act
        const output = await testFormatter({
          sources,
          supportCodeLibrary,
          type: 'junit',
        })

        // Assert
        expect(output).xml.to.deep.equal(
          '<?xml version="1.0"?>\n' +
            '<testsuite failures="1" skipped="0" name="cucumber-js" time="0.001" tests="1">\n' +
            '  <testcase classname="my feature" name="my scenario" time="0.001">\n' +
            '    <failure type="Error" message="error"><![CDATA[error]]></failure>\n' +
            '    <system-out><![CDATA[Given a failing step......................................................failed]]></system-out>\n' +
            '  </testcase>\n' +
            '</testsuite>'
        )
      })

      it('failed with invalid character', async () => {
        // Arrange
        const sources = [
          {
            data: [
              'Feature: my feature',
              '  Scenario: my scenario',
              '    Given a failing step with invalid character',
            ].join('\n'),
            uri: 'a.feature',
          },
        ]

        const supportCodeLibrary = getJUnitFormatterSupportCodeLibrary(clock)

        // Act
        const output = await testFormatter({
          sources,
          supportCodeLibrary,
          type: 'junit',
        })

        // Assert
        expect(output).xml.to.deep.equal(
          '<?xml version="1.0"?>\n' +
            '<testsuite failures="1" skipped="0" name="cucumber-js" time="0.001" tests="1">\n' +
            '  <testcase classname="my feature" name="my scenario" time="0.001">\n' +
            '    <failure type="Error" message="Error: include invalid character"><![CDATA[Error: include invalid character]]></failure>\n' +
            '    <system-out><![CDATA[Given a failing step with invalid character...............................failed]]></system-out>\n' +
            '  </testcase>\n' +
            '</testsuite>'
        )
      })
    })

    describe('retried', () => {
      it('only outputs the last attempt', async () => {
        // Arrange
        const sources = [
          {
            data: [
              'Feature: my feature',
              '  Scenario: my scenario',
              '    Given a flaky step',
            ].join('\n'),
            uri: 'a.feature',
          },
        ]

        const supportCodeLibrary = getJUnitFormatterSupportCodeLibrary(clock)

        // Act
        const output = await testFormatter({
          runtimeOptions: { retry: 1 },
          sources,
          supportCodeLibrary,
          type: 'junit',
        })

        // Assert
        expect(output).xml.to.deep.equal(
          '<?xml version="1.0"?>\n' +
            '<testsuite failures="0" skipped="0" name="cucumber-js" time="0.001" tests="1">\n' +
            '  <testcase classname="my feature" name="my scenario" time="0.001">\n' +
            '    <system-out><![CDATA[Given a flaky step........................................................passed]]></system-out>\n' +
            '  </testcase>\n' +
            '</testsuite>'
        )
      })
    })

    describe('pending', () => {
      it('outputs the feature', async () => {
        // Arrange
        const sources = [
          {
            data: [
              'Feature: my feature',
              '  Scenario: my scenario',
              '    Given a pending step',
            ].join('\n'),
            uri: 'a.feature',
          },
        ]
        const supportCodeLibrary = getJUnitFormatterSupportCodeLibrary(clock)

        // Act
        const output = await testFormatter({
          sources,
          supportCodeLibrary,
          type: 'junit',
        })

        // Assert
        expect(output).xml.to.deep.equal(
          '<?xml version="1.0"?>\n' +
            '<testsuite failures="1" skipped="0" name="cucumber-js" time="0.001" tests="1">\n' +
            '  <testcase classname="my feature" name="my scenario" time="0.001">\n' +
            '    <failure/>\n' +
            '    <system-out><![CDATA[Given a pending step.....................................................pending]]></system-out>\n' +
            '  </testcase>\n' +
            '</testsuite>'
        )
      })
    })

    describe('skipped', () => {
      it('outputs the feature', async () => {
        // Arrange
        const sources = [
          {
            data: [
              'Feature: my feature',
              '  Scenario: my scenario',
              '    Given a passing step',
              '    And a skipped step',
              '    And a passing step',
            ].join('\n'),
            uri: 'a.feature',
          },
        ]
        const supportCodeLibrary = getJUnitFormatterSupportCodeLibrary(clock)

        // Act
        const output = await testFormatter({
          sources,
          supportCodeLibrary,
          type: 'junit',
        })

        // Assert
        expect(output).xml.to.deep.equal(
          '<?xml version="1.0"?>\n' +
            '<testsuite failures="0" skipped="1" name="cucumber-js" time="0.001" tests="1">\n' +
            '  <testcase classname="my feature" name="my scenario" time="0.001">\n' +
            '    <skipped/>\n' +
            '    <system-out><![CDATA[Given a passing step......................................................passed\n' +
            'And a skipped step.......................................................skipped\n' +
            'And a passing step.......................................................skipped]]></system-out>\n' +
            '  </testcase>\n' +
            '</testsuite>'
        )
      })
    })

    describe('without a step definition', () => {
      it('outputs the feature', async () => {
        // Arrange
        const sources = [
          {
            data: [
              'Feature: my feature',
              '  Scenario: my scenario',
              '    Given a passing step',
            ].join('\n'),
            uri: 'a.feature',
          },
        ]

        // Act
        const output = await testFormatter({
          sources,
          type: 'junit',
        })

        // Assert
        expect(output).xml.to.deep.equal(
          '<?xml version="1.0"?>\n' +
            '<testsuite failures="1" skipped="0" name="cucumber-js" time="0" tests="1">\n' +
            '  <testcase classname="my feature" name="my scenario" time="0">\n' +
            '    <failure/>\n' +
            '    <system-out><![CDATA[Given a passing step...................................................undefined]]></system-out>\n' +
            '  </testcase>\n' +
            '</testsuite>'
        )
      })
    })
  })

  describe('one scenario with a background', () => {
    it('outputs the feature', async () => {
      // Arrange
      const sources = [
        {
          data: [
            'Feature: my feature',
            '',
            '  Background:',
            '    Given a passing step',
            '',
            '  Scenario: my scenario',
            '',
            '    When a passing step',
          ].join('\n'),
          uri: 'a.feature',
        },
      ]

      const supportCodeLibrary = getJUnitFormatterSupportCodeLibrary(clock)

      // Act
      const output = await testFormatter({
        sources,
        supportCodeLibrary,
        type: 'junit',
      })

      // Assert
      expect(output).xml.to.deep.equal(
        '<?xml version="1.0"?>\n' +
          '<testsuite failures="0" skipped="0" name="cucumber-js" time="0.002" tests="1">\n' +
          '  <testcase classname="my feature" name="my scenario" time="0.002">\n' +
          '    <system-out><![CDATA[Given a passing step......................................................passed\n' +
          'When a passing step.......................................................passed]]></system-out>\n' +
          '  </testcase>\n' +
          '</testsuite>'
      )
    })
  })

  describe('scenario outline with several examples', () => {
    it('outputs one test case per example with unique names', async () => {
      // Arrange
      const sources = [
        {
          data: [
            'Feature: my feature',
            '',
            '  Scenario Outline: my templated scenario',
            '    Given a <status> step',
            '  Examples:',
            '    | status  |',
            '    | passing |',
            '    | failing |',
            '',
          ].join('\n'),
          uri: 'a.feature',
        },
      ]

      const supportCodeLibrary = getJUnitFormatterSupportCodeLibrary(clock)

      // Act
      const output = await testFormatter({
        sources,
        supportCodeLibrary,
        type: 'junit',
      })

      // Assert
      expect(output).xml.to.deep.equal(
        '<?xml version="1.0"?>\n' +
          '<testsuite failures="1" skipped="0" name="cucumber-js" time="0.002" tests="2">\n' +
          '  <testcase classname="my feature" name="my templated scenario" time="0.001">\n' +
          '    <system-out><![CDATA[Given a passing step......................................................passed]]></system-out>\n' +
          '  </testcase>\n' +
          '  <testcase classname="my feature" name="my templated scenario [1]" time="0.001">\n' +
          '    <failure type="Error" message="error"><![CDATA[error]]></failure>\n' +
          '    <system-out><![CDATA[Given a failing step......................................................failed]]></system-out>\n' +
          '  </testcase>\n' +
          '</testsuite>'
      )
    })
  })

  describe('one rule with several examples (scenarios)', () => {
    describe('passed', () => {
      it('outputs the feature', async () => {
        // Arrange
        const sources = [
          {
            data: [
              'Feature: my feature',
              '  my feature description',
              '',
              '  Rule: my rule',
              '    my rule description',
              '',
              '    Example: first example',
              '      first example description',
              '',
              '      Given a passing step',
              '',
              '    Example: second example',
              '      second example description',
              '',
              '      Given a passing step',
            ].join('\n'),
            uri: 'a.feature',
          },
        ]

        const supportCodeLibrary = getJUnitFormatterSupportCodeLibrary(clock)

        // Act
        const output = await testFormatter({
          sources,
          supportCodeLibrary,
          type: 'junit',
        })

        // Assert
        expect(output).xml.to.deep.equal(
          '<?xml version="1.0"?>\n' +
            '<testsuite failures="0" skipped="0" name="cucumber-js" time="0.002" tests="2">\n' +
            '  <testcase classname="my feature" name="my rule: first example" time="0.001">\n' +
            '    <system-out><![CDATA[Given a passing step......................................................passed]]></system-out>\n' +
            '  </testcase>\n' +
            '  <testcase classname="my feature" name="my rule: second example" time="0.001">\n' +
            '    <system-out><![CDATA[Given a passing step......................................................passed]]></system-out>\n' +
            '  </testcase>\n' +
            '</testsuite>'
        )
      })
    })
  })

  describe('unnamed features/rules/scenarios', () => {
    it('defaults the names', async () => {
      // Arrange
      const sources = [
        {
          data: [
            'Feature:',
            '  my feature description',
            '',
            '  Rule:',
            '    my rule description',
            '',
            '    Example:',
            '      first example description',
            '',
            '      Given a passing step',
            '',
            '    Example:',
            '      second example description',
            '',
            '      Given a passing step',
          ].join('\n'),
          uri: 'a.feature',
        },
      ]

      const supportCodeLibrary = getJUnitFormatterSupportCodeLibrary(clock)

      // Act
      const output = await testFormatter({
        sources,
        supportCodeLibrary,
        type: 'junit',
      })

      // Assert
      expect(output).xml.to.deep.equal(
        '<?xml version="1.0"?>\n' +
          '<testsuite failures="0" skipped="0" name="cucumber-js" time="0.002" tests="2">\n' +
          '  <testcase classname="(unnamed feature)" name="(unnamed rule): (unnamed scenario)" time="0.001">\n' +
          '    <system-out><![CDATA[Given a passing step......................................................passed]]></system-out>\n' +
          '  </testcase>\n' +
          '  <testcase classname="(unnamed feature)" name="(unnamed rule): (unnamed scenario) [1]" time="0.001">\n' +
          '    <system-out><![CDATA[Given a passing step......................................................passed]]></system-out>\n' +
          '  </testcase>\n' +
          '</testsuite>'
      )
    })
  })

  describe('content containing CDATA', () => {
    it('outputs the feature', async () => {
      // Arrange
      const sources = [
        {
          data: [
            'Feature: my feature',
            '  my feature description',
            '',
            '  Scenario: my scenario',
            '    my scenario description',
            '',
            '    Given I have <![CDATA[cukes]]> in my belly',
          ].join('\n'),
          uri: 'a.feature',
        },
      ]

      const supportCodeLibrary = getJUnitFormatterSupportCodeLibrary(clock)

      // Act
      const output = await testFormatter({
        sources,
        supportCodeLibrary,
        type: 'junit',
      })

      // Assert
      expect(output).xml.to.deep.equal(
        '<?xml version="1.0"?>\n' +
          '<testsuite failures="0" skipped="0" name="cucumber-js" time="0.001" tests="1">\n' +
          '  <testcase classname="my feature" name="my scenario" time="0.001">\n' +
          '    <system-out><![CDATA[Given I have <![CDATA[cukes]]]]><![CDATA[> in my belly................................passed]]></system-out>\n' +
          '  </testcase>\n' +
          '</testsuite>'
      )
    })
  })

  describe('custom test suite name', () => {
    it('outputs with the custom name', async () => {
      // Arrange
      const sources = [
        {
          data: [
            'Feature: my feature',
            '  Scenario: my scenario',
            '    Given a passing step',
          ].join('\n'),
          uri: 'a.feature',
        },
      ]

      const supportCodeLibrary = getJUnitFormatterSupportCodeLibrary(clock)

      // Act
      const output = await testFormatter({
        parsedArgvOptions: {
          junit: {
            suiteName: 'my test suite',
          },
        },
        sources,
        supportCodeLibrary,
        type: 'junit',
      })

      // Assert
      expect(output).xml.to.deep.equal(
        '<?xml version="1.0"?>\n' +
          '<testsuite failures="0" skipped="0" name="my test suite" time="0.001" tests="1">\n' +
          '  <testcase classname="my feature" name="my scenario" time="0.001">\n' +
          '    <system-out><![CDATA[Given a passing step......................................................passed]]></system-out>\n' +
          '  </testcase>\n' +
          '</testsuite>'
      )
    })
  })

  describe('no custom test suite name', () => {
    it('outputs with cucumber-js as test suite name', async () => {
      // Arrange
      const sources = [
        {
          data: [
            'Feature: my feature',
            '  Scenario: my scenario',
            '    Given a passing step',
          ].join('\n'),
          uri: 'a.feature',
        },
      ]

      const supportCodeLibrary = getJUnitFormatterSupportCodeLibrary(clock)

      // Act
      const output = await testFormatter({
        sources,
        supportCodeLibrary,
        type: 'junit',
      })

      // Assert
      expect(output).xml.to.deep.equal(
        '<?xml version="1.0"?>\n' +
          '<testsuite failures="0" skipped="0" name="cucumber-js" time="0.001" tests="1">\n' +
          '  <testcase classname="my feature" name="my scenario" time="0.001">\n' +
          '    <system-out><![CDATA[Given a passing step......................................................passed]]></system-out>\n' +
          '  </testcase>\n' +
          '</testsuite>'
      )
    })
  })
})
