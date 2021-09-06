import { describe, it } from 'mocha'
import { expect } from 'chai'
import * as messages from '@cucumber/messages'
import { parseTestCaseAttempt } from '.'
import { getBaseSupportCodeLibrary } from '../../../test/fixtures/steps'
import StepDefinitionSnippetBuilder from '../step_definition_snippet_builder'
import { ParameterTypeRegistry } from '@cucumber/cucumber-expressions'
import { parse } from '../../../test/gherkin_helpers'
import { reindent } from 'reindent-template-literals'
import { TestStepResult } from '@cucumber/messages'
import { getTestCaseAttempts } from '../../../test/formatter_helpers'

describe('TestCaseAttemptParser', () => {
  describe('parseTestCaseAttempt', () => {
    const cwd = ''
    const supportCodeLibrary = getBaseSupportCodeLibrary()
    const snippetSyntax = {
      build: () => 'snippet',
    }

    const snippetBuilder = new StepDefinitionSnippetBuilder({
      snippetSyntax,
      parameterTypeRegistry: new ParameterTypeRegistry(),
    })

    const source = {
      data: reindent(`
        Feature: my feature
          Scenario: my scenario
            Given a passing step
      `),
      uri: 'a.feature',
    }

    describe('with no test step result', () => {
      it('initialize step result with status UNKNOWN', async () => {
        // Arrange
        const parsed = await parse(source)

        const testCase = {
          id: '0',
          pickleId: parsed.pickles[0].id,
          testSteps: [
            {
              id: '1',
              pickleStepId: parsed.pickles[0].steps[0].id,
              stepDefinitionIds: [supportCodeLibrary.stepDefinitions[0].id],
            },
          ],
        }

        const testCaseAttempt = {
          gherkinDocument: parsed.gherkinDocument,
          pickle: parsed.pickles[0],
          testCase,
          attempt: 0,
          willBeRetried: false,
          stepAttachments: {},
          stepResults: {},
          worstTestStepResult: new TestStepResult(),
        }

        // Act
        const output = parseTestCaseAttempt({
          cwd,
          testCaseAttempt,
          snippetBuilder,
          supportCodeLibrary,
        })

        // Assert
        expect(output.testSteps[0].result.status).to.eq(
          messages.TestStepResultStatus.UNKNOWN
        )
      })
    })

    describe('with test step result', () => {
      it('uses the parsed step result', async () => {
        // Arrange
        const [testCaseAttempt] = await getTestCaseAttempts({
          sources: [source],
          supportCodeLibrary,
        })

        // Act
        const output = parseTestCaseAttempt({
          cwd,
          testCaseAttempt,
          snippetBuilder,
          supportCodeLibrary,
        })

        // Assert
        expect(output.testSteps[0].result.status).to.eq(
          messages.TestStepResultStatus.PASSED
        )
      })
    })
  })
})
