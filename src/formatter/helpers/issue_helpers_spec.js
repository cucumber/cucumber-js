import { describe, it } from 'mocha'
import { expect } from 'chai'
import getColorFns from '../get_color_fns'
import { formatIssue } from './issue_helpers'
import figures from 'figures'
import { getTestCaseAttempts } from '../../../test/formatter_helpers'
import { getBaseSupportCodeLibrary } from '../../../test/fixtures/steps'
import FormatterBuilder from '../builder'

async function testFormatIssue(sourceData) {
  const sources = [
    {
      data: sourceData,
      uri: 'project/a.feature',
    },
  ]
  const supportCodeLibrary = getBaseSupportCodeLibrary()
  const [testCaseAttempt] = await getTestCaseAttempts({
    sources,
    supportCodeLibrary,
  })
  return formatIssue({
    cwd: 'project/',
    colorFns: getColorFns(false),
    number: 1,
    snippetBuilder: FormatterBuilder.getStepDefinitionSnippetBuilder({
      supportCodeLibrary,
    }),
    supportCodeLibrary,
    testCaseAttempt,
  })
}

describe('IssueHelpers', () => {
  describe('formatIssue', () => {
    describe('with a failed step', () => {
      it('prints the scenario', async () => {
        // Arrange
        const sourceData = [
          'Feature: my feature',
          '  Scenario: my scenario',
          '    Given a passing step',
          '    When a failing step',
          '    Then a passing step',
        ].join('\n')

        // Act
        const output = await testFormatIssue(sourceData)

        // Assert
        expect(output).to.eql(
          [
            '1) Scenario: my scenario # a.feature:2',
            `   ${figures.tick} Given a passing step # steps.js:27`,
            `   ${figures.cross} When a failing step # steps.js:7`,
            '       error',
            '   - Then a passing step # steps.js:27',
            '',
            '',
          ].join('\n')
        )
      })
    })

    describe('with an ambiguous step', () => {
      it('returns the formatted scenario', async () => {
        // Arrange
        const sourceData = [
          'Feature: my feature',
          '  Scenario: my scenario',
          '    Given a passing step',
          '    When an ambiguous step',
          '    Then a passing step',
        ].join('\n')

        // Act
        const output = await testFormatIssue(sourceData)

        // Assert
        expect(output).to.eql(
          [
            '1) Scenario: my scenario # a.feature:2',
            `   ${figures.tick} Given a passing step # steps.js:27`,
            `   ${figures.cross} When an ambiguous step`,
            '       Multiple step definitions match:',
            '         an ambiguous step    - steps.js:11',
            '         /an? ambiguous step/ - steps.js:12',
            '   - Then a passing step # steps.js:27',
            '',
            '',
          ].join('\n')
        )
      })
    })

    describe('with an undefined step', () => {
      it('returns the formatted scenario', async () => {
        // Arrange
        const sourceData = [
          'Feature: my feature',
          '  Scenario: my scenario',
          '    Given a passing step',
          '    When an undefined step',
          '    Then a passing step',
        ].join('\n')

        // Act
        const output = await testFormatIssue(sourceData)

        // Assert
        expect(output).to.eql(
          [
            '1) Scenario: my scenario # a.feature:2',
            `   ${figures.tick} Given a passing step # steps.js:27`,
            `   ? When an undefined step`,
            '       Undefined. Implement with the following snippet:',
            '',
            "         When('an undefined step', function () {",
            '           // Write code here that turns the phrase above into concrete actions',
            "           return 'pending';",
            '         });',
            '',
            '   - Then a passing step # steps.js:27',
            '',
            '',
          ].join('\n')
        )
      })
    })

    describe('with a pending step', () => {
      it('returns the formatted scenario', async () => {
        // Arrange
        const sourceData = [
          'Feature: my feature',
          '  Scenario: my scenario',
          '    Given a passing step',
          '    When a pending step',
          '    Then a passing step',
        ].join('\n')

        // Act
        const output = await testFormatIssue(sourceData)

        // Assert
        expect(output).to.eql(
          [
            '1) Scenario: my scenario # a.feature:2',
            `   ${figures.tick} Given a passing step # steps.js:27`,
            `   ? When a pending step # steps.js:14`,
            '       Pending',
            '   - Then a passing step # steps.js:27',
            '',
            '',
          ].join('\n')
        )
      })
    })

    describe('step with data table', () => {
      it('returns the formatted scenario', async () => {
        // Arrange
        const sourceData = [
          'Feature: my feature',
          '  Scenario: my scenario',
          '    Given a passing step',
          '    When a pending step',
          '    Then a passing step',
          '      |aaa|b|c|',
          '      |d|e|ff|',
          '      |gg|h|iii|',
        ].join('\n')

        // Act
        const output = await testFormatIssue(sourceData)

        // Assert
        expect(output).to.eql(
          [
            '1) Scenario: my scenario # a.feature:2',
            `   ${figures.tick} Given a passing step # steps.js:27`,
            `   ? When a pending step # steps.js:14`,
            '       Pending',
            '   - Then a passing step # steps.js:27',
            '       | aaa | b | c   |',
            '       | d   | e | ff  |',
            '       | gg  | h | iii |',
            '',
            '',
          ].join('\n')
        )
      })
    })

    describe('step with doc string', () => {
      it('returns the formatted scenario', async () => {
        // Arrange
        const sourceData = [
          'Feature: my feature',
          '  Scenario: my scenario',
          '    Given a passing step',
          '    When a pending step',
          '    Then a passing step',
          '       """',
          '       this is a multiline',
          '       doc string',
          '',
          '       :-)',
          '       """',
        ].join('\n')

        // Act
        const output = await testFormatIssue(sourceData)

        // Assert
        expect(output).to.eql(
          [
            '1) Scenario: my scenario # a.feature:2',
            `   ${figures.tick} Given a passing step # steps.js:27`,
            `   ? When a pending step # steps.js:14`,
            '       Pending',
            '   - Then a passing step # steps.js:27',
            '       """',
            '       this is a multiline',
            '       doc string',
            '',
            '       :-)',
            '       """',
            '',
            '',
          ].join('\n')
        )
      })
    })

    describe('step with attachment text', () => {
      it('prints the scenario', function() {
        // Arrange
        // Act
        // Assert
        // expect(output).to.eql(
        //   '1) Scenario: my scenario # a.feature:2\n' +
        //     `   ${figures.tick} Given step1 # steps.js:2\n` +
        //     `       Attachment (text/plain): Some info.\n` +
        //     `       Attachment (application/json)\n` +
        //     `       Attachment (image/png)\n` +
        //     `   ${figures.cross} When step2 # steps.js:3\n` +
        //     `       Attachment (text/plain): Other info.\n` +
        //     '       error\n' +
        //     '   - Then step3 # steps.js:4\n\n'
        // )
      })
    })
  })
})
