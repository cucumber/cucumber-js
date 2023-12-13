import { describe, it } from 'mocha'
import { expect } from 'chai'
import * as messages from '@cucumber/messages'
import { ParameterTypeRegistry } from '@cucumber/cucumber-expressions'
import { reindent } from 'reindent-template-literals'
import { getBaseSupportCodeLibrary } from '../../../test/fixtures/steps'
import StepDefinitionSnippetBuilder from '../step_definition_snippet_builder'
import { getTestCaseAttempts } from '../../../test/formatter_helpers'
import { parseTestCaseAttempt } from '.'

describe('TestCaseAttemptParser', () => {
  describe('parseTestCaseAttempt', () => {
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
        const [testCaseAttempt] = await getTestCaseAttempts({
          sources: [source],
          supportCodeLibrary,
        })

        testCaseAttempt.stepResults = {}

        // Act
        const output = parseTestCaseAttempt({
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
