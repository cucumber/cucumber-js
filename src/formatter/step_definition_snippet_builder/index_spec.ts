import { describe, it } from 'mocha'
import { expect } from 'chai'
import sinon from 'sinon'
import { ParameterTypeRegistry } from '@cucumber/cucumber-expressions'
import { KeywordType } from '../helpers'
import { getPickleStepWithText } from '../../../test/gherkin_helpers'
import { ISnippetSyntaxBuildOptions } from './snippet_syntax'
import StepDefinitionSnippetBuilder, { IBuildRequest } from './'

function testStepDefinitionBuilder(
  request: IBuildRequest
): ISnippetSyntaxBuildOptions {
  const snippetSyntax = {
    build: sinon.stub().returns('snippet'),
  }
  const snippetBuilder = new StepDefinitionSnippetBuilder({
    snippetSyntax,
    parameterTypeRegistry: new ParameterTypeRegistry(),
  })
  const result = snippetBuilder.build(request)
  expect(result).to.eql('snippet')
  expect(snippetSyntax.build).to.have.been.calledOnce()
  return snippetSyntax.build.firstCall.args[0]
}

describe('StepDefinitionSnippetBuilder', () => {
  describe('build()', () => {
    describe('step is an precondition step', () => {
      it('uses Given as the function name', async function () {
        // Arrange
        const pickleStep = await getPickleStepWithText('Given abc')

        // Act
        const arg = testStepDefinitionBuilder({
          keywordType: KeywordType.Precondition,
          pickleStep,
        })

        // Assert
        expect(arg.functionName).to.eql('Given')
      })
    })

    describe('step is an event step', () => {
      it('uses When as the function name', async function () {
        // Arrange
        const pickleStep = await getPickleStepWithText('When abc')

        // Act
        const arg = testStepDefinitionBuilder({
          keywordType: KeywordType.Event,
          pickleStep,
        })

        // Assert
        expect(arg.functionName).to.eql('When')
      })
    })

    describe('step is an outcome step', () => {
      it('uses Then as the function name', async function () {
        // Arrange
        const pickleStep = await getPickleStepWithText('Then abc')

        // Act
        const arg = testStepDefinitionBuilder({
          keywordType: KeywordType.Outcome,
          pickleStep,
        })

        // Assert
        expect(arg.functionName).to.eql('Then')
      })
    })

    describe('step has simple name', () => {
      it('adds the proper generated expression', async function () {
        // Arrange
        const pickleStep = await getPickleStepWithText('Given abc')

        // Act
        const arg = testStepDefinitionBuilder({
          keywordType: KeywordType.Precondition,
          pickleStep,
        })

        // Assert
        expect(arg.generatedExpressions).to.have.lengthOf(1)
        const generatedExpression = arg.generatedExpressions[0]
        expect(generatedExpression.source).to.eql('abc')
        expect(generatedExpression.parameterNames).to.eql([])
      })
    })

    describe('step name has a quoted string', () => {
      it('adds the proper generated expression', async function () {
        // Arrange
        const pickleStep = await getPickleStepWithText('Given abc "def" ghi')

        // Act
        const arg = testStepDefinitionBuilder({
          keywordType: KeywordType.Precondition,
          pickleStep,
        })

        // Assert
        const generatedExpression = arg.generatedExpressions[0]
        expect(generatedExpression.source).to.eql('abc {string} ghi')
        expect(generatedExpression.parameterNames).to.eql(['string'])
      })
    })

    describe('step name has multiple quoted strings', () => {
      it('adds the proper generated expression', async function () {
        // Arrange
        const pickleStep = await getPickleStepWithText(
          'Given abc "def" ghi "jkl" mno'
        )

        // Act
        const arg = testStepDefinitionBuilder({
          keywordType: KeywordType.Precondition,
          pickleStep,
        })

        // Assert
        const generatedExpression = arg.generatedExpressions[0]
        expect(generatedExpression.source).to.eql(
          'abc {string} ghi {string} mno'
        )
        expect(generatedExpression.parameterNames).to.eql(['string', 'string2'])
      })
    })

    describe('step name has a standalone number', () => {
      it('adds the proper generated expression', async function () {
        // Arrange
        const pickleStep = await getPickleStepWithText('Given abc 123 def')

        // Act
        const arg = testStepDefinitionBuilder({
          keywordType: KeywordType.Precondition,
          pickleStep,
        })

        // Assert
        const generatedExpression = arg.generatedExpressions[0]
        expect(generatedExpression.source).to.eql('abc {int} def')
        expect(generatedExpression.parameterNames).to.eql(['int'])
      })
    })

    describe('step has no argument', () => {
      it('passes no step parameter names', async function () {
        // Arrange
        const pickleStep = await getPickleStepWithText('Given abc')

        // Act
        const arg = testStepDefinitionBuilder({
          keywordType: KeywordType.Precondition,
          pickleStep,
        })

        // Assert
        expect(arg.stepParameterNames).to.eql([])
      })
    })

    describe('step has a data table argument', () => {
      it('passes dataTable as a step parameter name', async function () {
        // Arrange
        const pickleStep = await getPickleStepWithText(`\
          Given abc  
            | a |`)

        // Act
        const arg = testStepDefinitionBuilder({
          keywordType: KeywordType.Precondition,
          pickleStep,
        })

        // Assert
        expect(arg.stepParameterNames).to.eql(['dataTable'])
      })
    })

    describe('step has a doc string argument', () => {
      it('passes docString as a step parameter name', async function () {
        // Arrange
        const pickleStep = await getPickleStepWithText(`
          Given abc
            """
            a
            """`)

        // Act
        const arg = testStepDefinitionBuilder({
          keywordType: KeywordType.Precondition,
          pickleStep,
        })

        // Assert
        expect(arg.stepParameterNames).to.eql(['docString'])
      })
    })
  })
})
