import { afterEach, beforeEach, describe, it } from 'mocha'
import { expect, use } from 'chai'
import chaiXml from 'chai-xml'
import FakeTimers, { InstalledClock } from '@sinonjs/fake-timers'
import timeMethods from '../time'
import { testFormatter } from '../../test/formatter_helpers'
import { getJsonFormatterSupportCodeLibrary } from '../../test/fixtures/json_formatter_steps'

use(chaiXml)

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
          '<testsuite failures="0" name="cucumber-js" time="0" tests="0"/>'
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

        const supportCodeLibrary = getJsonFormatterSupportCodeLibrary(clock)

        // Act
        const output = await testFormatter({
          sources,
          supportCodeLibrary,
          type: 'junit',
        })

        // Assert
        expect(output).xml.to.deep.equal(
          '<?xml version="1.0"?>\n' +
            '<testsuite failures="0" name="cucumber-js" time="0.001" tests="1">\n' +
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

        const supportCodeLibrary = getJsonFormatterSupportCodeLibrary(clock)

        // Act
        const output = await testFormatter({
          sources,
          supportCodeLibrary,
          type: 'junit',
        })

        // Assert
        expect(output).xml.to.deep.equal(
          '<?xml version="1.0"?>\n' +
            '<testsuite failures="1" name="cucumber-js" time="0" tests="1">\n' +
            '  <testcase classname="my feature" name="my scenario" time="0">\n' +
            '    <failure type="FAILED" message="A hook or step failed"><![CDATA[error]]></failure>\n' +
            '    <system-out><![CDATA[Given a failing step......................................................failed]]></system-out>\n' +
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

        const supportCodeLibrary = getJsonFormatterSupportCodeLibrary(clock)

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
            '<testsuite failures="0" name="cucumber-js" time="0" tests="1">\n' +
            '  <testcase classname="my feature" name="my scenario" time="0">\n' +
            '    <system-out><![CDATA[Given a flaky step........................................................passed]]></system-out>\n' +
            '  </testcase>\n' +
            '</testsuite>'
        )
      })
    })

    describe('without a step definition', () => {
      it('does not output a match attribute for the step', async () => {
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
            '<testsuite failures="1" name="cucumber-js" time="0" tests="1">\n' +
            '  <testcase classname="my feature" name="my scenario" time="0">\n' +
            '    <failure type="UNDEFINED" message="A step in the test case is not defined"/>\n' +
            '    <system-out><![CDATA[Given a passing step...................................................undefined]]></system-out>\n' +
            '  </testcase>\n' +
            '</testsuite>'
        )
      })
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

      const supportCodeLibrary = getJsonFormatterSupportCodeLibrary(clock)

      // Act
      const output = await testFormatter({
        sources,
        supportCodeLibrary,
        type: 'junit',
      })

      // Assert
      expect(output).xml.to.deep.equal(
        '<?xml version="1.0"?>\n' +
        '<testsuite failures="1" name="cucumber-js" time="0.001" tests="2">\n' +
        '  <testcase classname="my feature" name="my templated scenario" time="0.001">\n' +
        '    <system-out><![CDATA[Given a passing step......................................................passed]]></system-out>\n' +
        '  </testcase>\n' +
        '  <testcase classname="my feature" name="my templated scenario" time="0">\n' +
        '    <failure type="FAILED" message="A hook or step failed"><![CDATA[error]]></failure>\n' +
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

        const supportCodeLibrary = getJsonFormatterSupportCodeLibrary(clock)

        // Act
        const output = await testFormatter({
          sources,
          supportCodeLibrary,
          type: 'junit',
        })

        // Assert
        expect(output).xml.to.deep.equal(
          '<?xml version="1.0"?>\n' +
            '<testsuite failures="0" name="cucumber-js" time="0.002" tests="2">\n' +
            '  <testcase classname="my feature; my rule" name="first example" time="0.001">\n' +
            '    <system-out><![CDATA[Given a passing step......................................................passed]]></system-out>\n' +
            '  </testcase>\n' +
            '  <testcase classname="my feature; my rule" name="second example" time="0.001">\n' +
            '    <system-out><![CDATA[Given a passing step......................................................passed]]></system-out>\n' +
            '  </testcase>\n' +
            '</testsuite>'
        )
      })
    })
  })
})
