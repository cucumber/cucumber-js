import { beforeEach, describe, it } from 'mocha'
import { expect } from 'chai'
import { createMock } from '../test_helpers'
import getColorFns from '../get_color_fns'
import { formatIssue } from './issue_helpers'
import figures from 'figures'
import { parse } from '../../../test/gherkin_helpers'
import { messages } from 'cucumber-messages'
import uuidv4 from 'uuid/v4'
const { Status } = messages.TestResult

describe('IssueHelpers', () => {
  beforeEach(async function() {
    const { gherkinDocument, pickle } = await parse({
      data:
        'Feature: my feature\n' +
        '  Scenario: my scenario\n' +
        '    Given step1\n' +
        '    When step2\n' +
        '    Then step3\n',
      uri: 'a.feature',
    })
    this.supportCodeLibrary = {
      stepDefinitions: [
        { id: uuidv4(), line: 2, uri: 'steps.js' },
        { id: uuidv4(), line: 3, uri: 'steps.js' },
        { id: uuidv4(), line: 4, uri: 'steps.js' },
      ],
    }
    this.testCase = {
      sourceLocation: {
        uri: 'a.feature',
        line: 2,
      },
      testSteps: [
        {
          id: uuidv4(),
          pickleStepId: pickle.steps[0].id,
          stepDefinitionId: [this.supportCodeLibrary.stepDefinitions[0].id],
        },
        {},
        {
          id: uuidv4(),
          pickleStepId: pickle.steps[2].id,
          stepDefinitionId: [this.supportCodeLibrary.stepDefinitions[2].id],
        },
      ],
    }
    this.testCaseAttempt = {
      attempt: 0,
      gherkinDocument,
      pickle,
      result: {},
      stepAttachments: {},
      stepResults: {},
      testCase: this.testCase,
    }
    this.options = {
      colorFns: getColorFns(false),
      number: 1,
      snippetBuilder: createMock({ build: 'snippet' }),
      supportCodeLibrary: this.supportCodeLibrary,
      testCaseAttempt: this.testCaseAttempt,
    }
    this.passedStepResult = { duration: 0, status: Status.PASSED }
    this.skippedStepResult = { status: Status.SKIPPED }
  })

  describe('formatIssue', () => {
    describe('returns the formatted scenario', () => {
      beforeEach(function() {
        this.testCase.testSteps[1] = {
          id: uuidv4(),
          pickleStepId: this.testCaseAttempt.pickle.steps[1].id,
          stepDefinitionId: [this.supportCodeLibrary.stepDefinitions[1].id],
        }
        this.testCaseAttempt.stepResults[
          this.testCase.testSteps[0].id
        ] = this.passedStepResult
        this.testCaseAttempt.stepResults[this.testCase.testSteps[1].id] = {
          message: 'error',
          status: Status.FAILED,
        }
        this.testCaseAttempt.stepResults[
          this.testCase.testSteps[2].id
        ] = this.skippedStepResult
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
        this.testCase.testSteps[1] = {
          id: uuidv4(),
          pickleStepId: this.testCaseAttempt.pickle.steps[1].id,
          stepDefinitionId: [this.supportCodeLibrary.stepDefinitions[1].id],
        }
        this.testCaseAttempt.stepResults[
          this.testCase.testSteps[0].id
        ] = this.passedStepResult
        this.testCaseAttempt.stepResults[this.testCase.testSteps[1].id] = {
          message:
            'Multiple step definitions match:\n' +
            '  pattern1        - steps.js:5\n' +
            '  longer pattern2 - steps.js:6',
          status: Status.FAILED,
        }
        this.testCaseAttempt.stepResults[
          this.testCase.testSteps[2].id
        ] = this.skippedStepResult
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
        this.testCase.testSteps[1] = {
          id: uuidv4(),
          pickleStepId: this.testCaseAttempt.pickle.steps[1].id,
          stepDefinitionId: [],
        }
        this.testCaseAttempt.stepResults[
          this.testCase.testSteps[0].id
        ] = this.passedStepResult
        this.testCaseAttempt.stepResults[this.testCase.testSteps[1].id] = {
          status: Status.UNDEFINED,
        }
        this.testCaseAttempt.stepResults[
          this.testCase.testSteps[2].id
        ] = this.skippedStepResult
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
        this.testCase.testSteps[1] = {
          id: uuidv4(),
          pickleStepId: this.testCaseAttempt.pickle.steps[1].id,
          stepDefinitionId: [this.supportCodeLibrary.stepDefinitions[1].id],
        }
        this.testCaseAttempt.stepResults[
          this.testCase.testSteps[0].id
        ] = this.passedStepResult
        this.testCaseAttempt.stepResults[this.testCase.testSteps[1].id] = {
          status: Status.PENDING,
        }
        this.testCaseAttempt.stepResults[
          this.testCase.testSteps[2].id
        ] = this.skippedStepResult
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
      beforeEach(async function() {
        const { gherkinDocument, pickle } = await parse({
          data:
            'Feature: my feature\n' +
            '  Scenario: my scenario\n' +
            '    Given step1\n' +
            '    When step2\n' +
            '    Then step3\n' +
            '      |aaa|b|c|\n' +
            '      |d|e|ff|\n' +
            '      |gg|h|iii|\n',
          uri: 'a.feature',
        })
        this.testCaseAttempt.gherkinDocument = gherkinDocument
        this.testCaseAttempt.pickle = pickle
        this.testCase.testSteps[0].pickleStepId = pickle.steps[0].id
        this.testCase.testSteps[1] = {
          id: uuidv4(),
          pickleStepId: this.testCaseAttempt.pickle.steps[1].id,
          stepDefinitionId: [this.supportCodeLibrary.stepDefinitions[1].id],
        }
        this.testCase.testSteps[2].pickleStepId = pickle.steps[2].id
        this.testCaseAttempt.stepResults[
          this.testCase.testSteps[0].id
        ] = this.passedStepResult
        this.testCaseAttempt.stepResults[this.testCase.testSteps[1].id] = {
          status: Status.PENDING,
        }
        this.testCaseAttempt.stepResults[
          this.testCase.testSteps[2].id
        ] = this.skippedStepResult
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
      beforeEach(async function() {
        const { gherkinDocument, pickle } = await parse({
          data:
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
            '       """\n',
          uri: 'a.feature',
        })
        this.testCaseAttempt.gherkinDocument = gherkinDocument
        this.testCaseAttempt.pickle = pickle
        this.testCase.testSteps[0].pickleStepId = pickle.steps[0].id
        this.testCase.testSteps[1] = {
          id: uuidv4(),
          pickleStepId: this.testCaseAttempt.pickle.steps[1].id,
          stepDefinitionId: [this.supportCodeLibrary.stepDefinitions[1].id],
        }
        this.testCase.testSteps[2].pickleStepId = pickle.steps[2].id
        this.testCaseAttempt.stepResults[
          this.testCase.testSteps[0].id
        ] = this.passedStepResult
        this.testCaseAttempt.stepResults[this.testCase.testSteps[1].id] = {
          status: Status.PENDING,
        }
        this.testCaseAttempt.stepResults[
          this.testCase.testSteps[2].id
        ] = this.skippedStepResult
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
        this.testCase.testSteps[1] = {
          id: uuidv4(),
          pickleStepId: this.testCaseAttempt.pickle.steps[1].id,
          stepDefinitionId: [this.supportCodeLibrary.stepDefinitions[1].id],
        }
        this.testCaseAttempt.stepResults[
          this.testCase.testSteps[0].id
        ] = this.passedStepResult
        this.testCaseAttempt.stepAttachments[this.testCase.testSteps[0].id] = [
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
        this.testCaseAttempt.stepResults[this.testCase.testSteps[1].id] = {
          message: 'error',
          status: Status.FAILED,
        }
        this.testCaseAttempt.stepAttachments[this.testCase.testSteps[1].id] = [
          {
            data: 'Other info.',
            media: {
              type: 'text/plain',
            },
          },
        ]
        this.testCaseAttempt.stepResults[
          this.testCase.testSteps[2].id
        ] = this.skippedStepResult
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
