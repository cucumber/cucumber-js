import { describe, it } from 'mocha'
import { expect } from 'chai'
import getColorFns from '../get_color_fns'
import { formatIssue } from './issue_helpers'
import figures from 'figures'
import { getTestCaseAttempts } from '../../../test/formatter_helpers'
import { getBaseSupportCodeLibrary } from '../../../test/fixtures/steps'
import FormatterBuilder from '../builder'

async function testFormatIssue(sourceData: string): Promise<string> {
  const sources = [
    {
      data: sourceData,
      uri: 'a.feature',
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
      cwd: 'project/',
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
        const sourceData = `\
Feature: my feature
  Scenario: my scenario
    Given a passing step
    When a failing step
    Then a passing step
`

        // Act
        const output = await testFormatIssue(sourceData)

        // Assert
        expect(output).to.eql(`\
1) Scenario: my scenario # a.feature:2
   ${figures.tick} Given a passing step # steps.ts:29
   ${figures.cross} When a failing step # steps.ts:9
       error
   - Then a passing step # steps.ts:29

`)
      })
    })

    describe('with an ambiguous step', () => {
      it('returns the formatted scenario', async () => {
        // Arrange
        const sourceData = `\
Feature: my feature
  Scenario: my scenario
    Given a passing step
    When an ambiguous step
    Then a passing step
`

        // Act
        const output = await testFormatIssue(sourceData)

        // Assert
        expect(output).to.eql(`\
1) Scenario: my scenario # a.feature:2
   ${figures.tick} Given a passing step # steps.ts:29
   ${figures.cross} When an ambiguous step
       Multiple step definitions match:
         an ambiguous step    - steps.ts:13
         /an? ambiguous step/ - steps.ts:14
   - Then a passing step # steps.ts:29

`)
      })
    })

    describe('with an undefined step', () => {
      it('returns the formatted scenario', async () => {
        // Arrange
        const sourceData = `\
Feature: my feature
  Scenario: my scenario
    Given a passing step
    When an undefined step
    Then a passing step
`

        // Act
        const output = await testFormatIssue(sourceData)

        // Assert
        expect(output).to.eql(`\
1) Scenario: my scenario # a.feature:2
   ${figures.tick} Given a passing step # steps.ts:29
   ? When an undefined step
       Undefined. Implement with the following snippet:

         When('an undefined step', function () {
           // Write code here that turns the phrase above into concrete actions
           return 'pending';
         });

   - Then a passing step # steps.ts:29

`)
      })
    })

    describe('with a pending step', () => {
      it('returns the formatted scenario', async () => {
        // Arrange
        const sourceData = `\
Feature: my feature
  Scenario: my scenario
    Given a passing step
    When a pending step
    Then a passing step
`

        // Act
        const output = await testFormatIssue(sourceData)

        // Assert
        expect(output).to.eql(`\
1) Scenario: my scenario # a.feature:2
   ${figures.tick} Given a passing step # steps.ts:29
   ? When a pending step # steps.ts:16
       Pending
   - Then a passing step # steps.ts:29

`)
      })
    })

    describe('step with data table', () => {
      it('returns the formatted scenario', async () => {
        // Arrange
        const sourceData = `\
Feature: my feature
  Scenario: my scenario
    Given a passing step
    When a pending step
    Then a passing step
      |aaa|b|c|
      |d|e|ff|
      |gg|h|iii|
`

        // Act
        const output = await testFormatIssue(sourceData)

        // Assert
        expect(output).to.eql(`\
1) Scenario: my scenario # a.feature:2
   ${figures.tick} Given a passing step # steps.ts:29
   ? When a pending step # steps.ts:16
       Pending
   - Then a passing step # steps.ts:29
       | aaa | b | c   |
       | d   | e | ff  |
       | gg  | h | iii |

`)
      })
    })

    describe('step with doc string', () => {
      it('returns the formatted scenario', async () => {
        // Arrange
        const sourceData = `\
Feature: my feature
  Scenario: my scenario
    Given a passing step
    When a pending step
    Then a passing step
       """
       this is a multiline
       doc string

       :-)
       """
`

        // Act
        const output = await testFormatIssue(sourceData)

        // Assert
        expect(output).to.eql(`\
1) Scenario: my scenario # a.feature:2
   ${figures.tick} Given a passing step # steps.ts:29
   ? When a pending step # steps.ts:16
       Pending
   - Then a passing step # steps.ts:29
       """
       this is a multiline
       doc string

       :-)
       """

`)
      })
    })

    describe('step with attachment text', () => {
      it('prints the scenario', async () => {
        // Arrange
        const sourceData = `\
Feature: my feature
  Scenario: my scenario
    Given attachment step1
    When attachment step2
    Then a passing step
`
        // Act
        const output = await testFormatIssue(sourceData)

        // Assert
        expect(output).to.eql(`\
1) Scenario: my scenario # a.feature:2
   ${figures.tick} Given attachment step1 # steps.ts:35
       Attachment (text/plain): Some info
       Attachment (application/json)
       Attachment (image/png)
   ${figures.cross} When attachment step2 # steps.ts:41
       Attachment (text/plain): Other info
       error
   - Then a passing step # steps.ts:29

`)
      })
    })
  })
})
