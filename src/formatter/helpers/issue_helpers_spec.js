import { beforeEach, describe, it } from 'mocha'
import { expect } from 'chai'
import { createMock } from '../test_helpers'
import getColorFns from '../get_color_fns'
import Status from '../../status'
import { formatIssue } from './issue_helpers'
import figures from 'figures'
import Gherkin from 'gherkin'

describe('IssueHelpers', () => {
  beforeEach(function() {
    const gherkinDocument = new Gherkin.Parser().parse(
      'Feature: my feature\n' +
        '  Scenario: my scenario\n' +
        '    Given step1\n' +
        '    When step2\n' +
        '    Then step3\n'
    )
    const pickle = new Gherkin.Compiler().compile(gherkinDocument)[0]
    this.testCase = {
      sourceLocation: {
        uri: 'a.feature',
        line: 2,
      },
      steps: [
        {
          actionLocation: { line: 2, uri: 'steps.js' },
          sourceLocation: { line: 3, uri: 'a.feature' },
        },
        {},
        {
          actionLocation: { line: 4, uri: 'steps.js' },
          sourceLocation: { line: 5, uri: 'a.feature' },
        },
      ],
    }
    this.options = {
      colorFns: getColorFns(false),
      gherkinDocument,
      number: 1,
      pickle,
      snippetBuilder: createMock({ build: 'snippet' }),
      testCase: this.testCase,
    }
    this.passedStepResult = { duration: 0, status: Status.PASSED }
    this.skippedStepResult = { status: Status.SKIPPED }
  })

  describe('formatIssue', () => {
    describe('returns the formatted scenario', () => {
      beforeEach(function() {
        this.testCase.steps[0].result = this.passedStepResult
        this.testCase.steps[1] = {
          actionLocation: { line: 3, uri: 'steps.js' },
          sourceLocation: { line: 4, uri: 'a.feature' },
          result: {
            exception: 'error',
            status: Status.FAILED,
          },
        }
        this.testCase.steps[2].result = this.skippedStepResult
        this.formattedIssue = formatIssue(this.options)
      })

      it('prints the scenario', function() {
        expect(this.formattedIssue).to.eql(
          '1) Scenario: my scenario # a.feature:2\n' +
            `   ${figures.tick} Given step1 # steps.js:2\n` +
            `   ${figures.cross} When step2 # steps.js:3\n` +
            '       error\n' +
            '   - Then step3 # steps.js:4\n\n'
        )
      })
    })

    describe('with an ambiguous step', () => {
      beforeEach(function() {
        this.testCase.steps[0].result = this.passedStepResult
        this.testCase.steps[1] = {
          actionLocation: { line: 3, uri: 'steps.js' },
          sourceLocation: { line: 4, uri: 'a.feature' },
          result: {
            exception:
              'Multiple step definitions match:\n' +
              '  pattern1        - steps.js:5\n' +
              '  longer pattern2 - steps.js:6',
            status: Status.FAILED,
          },
        }
        this.testCase.steps[2].result = this.skippedStepResult
        this.formattedIssue = formatIssue(this.options)
      })

      it('returns the formatted scenario', function() {
        expect(this.formattedIssue).to.eql(
          '1) Scenario: my scenario # a.feature:2\n' +
            `   ${figures.tick} Given step1 # steps.js:2\n` +
            `   ${figures.cross} When step2 # steps.js:3\n` +
            '       Multiple step definitions match:\n' +
            '         pattern1        - steps.js:5\n' +
            '         longer pattern2 - steps.js:6\n' +
            '   - Then step3 # steps.js:4\n\n'
        )
      })
    })

    describe('with an undefined step', () => {
      beforeEach(function() {
        this.testCase.steps[0].result = this.passedStepResult
        this.testCase.steps[1] = {
          sourceLocation: { line: 4, uri: 'a.feature' },
          result: { status: Status.UNDEFINED },
        }
        this.testCase.steps[2].result = this.skippedStepResult
        this.formattedIssue = formatIssue(this.options)
      })

      it('returns the formatted scenario', function() {
        expect(this.formattedIssue).to.eql(
          '1) Scenario: my scenario # a.feature:2\n' +
            `   ${figures.tick} Given step1 # steps.js:2\n` +
            `   ? When step2\n` +
            '       Undefined. Implement with the following snippet:\n' +
            '\n' +
            '         snippet\n' +
            '\n' +
            '   - Then step3 # steps.js:4\n\n'
        )
      })
    })

    describe('with a pending step', () => {
      beforeEach(function() {
        this.testCase.steps[0].result = this.passedStepResult
        this.testCase.steps[1] = {
          actionLocation: { line: 3, uri: 'steps.js' },
          sourceLocation: { line: 4, uri: 'a.feature' },
          result: { status: Status.PENDING },
        }
        this.testCase.steps[2].result = this.skippedStepResult
        this.formattedIssue = formatIssue(this.options)
      })

      it('returns the formatted scenario', function() {
        expect(this.formattedIssue).to.eql(
          '1) Scenario: my scenario # a.feature:2\n' +
            `   ${figures.tick} Given step1 # steps.js:2\n` +
            `   ? When step2 # steps.js:3\n` +
            '       Pending\n' +
            '   - Then step3 # steps.js:4\n\n'
        )
      })
    })

    describe('step with data table', () => {
      beforeEach(function() {
        const gherkinDocument = new Gherkin.Parser().parse(
          'Feature: my feature\n' +
            '  Scenario: my scenario\n' +
            '    Given step1\n' +
            '    When step2\n' +
            '    Then step3\n' +
            '      |aaa|b|c|\n' +
            '      |d|e|ff|\n' +
            '      |gg|h|iii|\n'
        )
        this.options.gherkinDocument = gherkinDocument
        const pickle = new Gherkin.Compiler().compile(gherkinDocument)[0]
        this.options.pickle = pickle
        this.testCase.steps[0].result = this.passedStepResult
        this.testCase.steps[1] = {
          actionLocation: { line: 3, uri: 'steps.js' },
          sourceLocation: { line: 4, uri: 'a.feature' },
          result: { status: Status.PENDING },
        }
        this.testCase.steps[2].result = this.skippedStepResult
        this.formattedIssue = formatIssue(this.options)
      })

      it('returns the formatted scenario', function() {
        expect(this.formattedIssue).to.eql(
          '1) Scenario: my scenario # a.feature:2\n' +
            `   ${figures.tick} Given step1 # steps.js:2\n` +
            `   ? When step2 # steps.js:3\n` +
            '       Pending\n' +
            '   - Then step3 # steps.js:4\n' +
            '       | aaa | b | c   |\n' +
            '       | d   | e | ff  |\n' +
            '       | gg  | h | iii |\n\n'
        )
      })
    })

    describe('step with doc string', () => {
      beforeEach(function() {
        const gherkinDocument = new Gherkin.Parser().parse(
          'Feature: my feature\n' +
            '  Scenario: my scenario\n' +
            '    Given step1\n' +
            '    When step2\n' +
            '    Then step3\n' +
            '       """\n' +
            '       this is a multiline\n' +
            '       doc string\n' +
            '\n' +
            '       :-)\n' +
            '       """\n'
        )
        this.options.gherkinDocument = gherkinDocument
        const pickle = new Gherkin.Compiler().compile(gherkinDocument)[0]
        this.options.pickle = pickle
        this.testCase.steps[0].result = this.passedStepResult
        this.testCase.steps[1] = {
          actionLocation: { line: 3, uri: 'steps.js' },
          sourceLocation: { line: 4, uri: 'a.feature' },
          result: { status: Status.PENDING },
        }
        this.testCase.steps[2].result = this.skippedStepResult
        this.formattedIssue = formatIssue(this.options)
      })

      it('returns the formatted scenario', function() {
        expect(this.formattedIssue).to.eql(
          '1) Scenario: my scenario # a.feature:2\n' +
            `   ${figures.tick} Given step1 # steps.js:2\n` +
            `   ? When step2 # steps.js:3\n` +
            '       Pending\n' +
            '   - Then step3 # steps.js:4\n' +
            '       """\n' +
            '       this is a multiline\n' +
            '       doc string\n' +
            '\n' +
            '       :-)\n' +
            '       """\n\n'
        )
      })
    })

    describe('step with attachment text', () => {
      beforeEach(function() {
        this.testCase.steps[0].result = this.passedStepResult
        this.testCase.steps[0].attachments = [
          {
            data: 'Some info.',
            media: {
              type: 'text/plain',
            },
          },
          {
            data: '{"name": "some JSON"}',
            media: {
              type: 'application/json',
            },
          },
          {
            data: Buffer.from([]),
            media: {
              type: 'image/png',
            },
          },
        ]
        this.testCase.steps[1] = {
          actionLocation: { line: 3, uri: 'steps.js' },
          sourceLocation: { line: 4, uri: 'a.feature' },
          result: {
            exception: 'error',
            status: Status.FAILED,
          },
        }
        this.testCase.steps[1].attachments = [
          {
            data: 'Other info.',
            media: {
              type: 'text/plain',
            },
          },
        ]
        this.testCase.steps[2].result = this.skippedStepResult
        this.formattedIssue = formatIssue(this.options)
      })

      it('prints the scenario', function() {
        expect(this.formattedIssue).to.eql(
          '1) Scenario: my scenario # a.feature:2\n' +
            `   ${figures.tick} Given step1 # steps.js:2\n` +
            `       Attachment (text/plain): Some info.\n` +
            `       Attachment (application/json)\n` +
            `       Attachment (image/png)\n` +
            `   ${figures.cross} When step2 # steps.js:3\n` +
            `       Attachment (text/plain): Other info.\n` +
            '       error\n' +
            '   - Then step3 # steps.js:4\n\n'
        )
      })
    })
  })
})
