import { describe, it } from 'mocha'
import { expect } from 'chai'
import {
  CucumberExpressionGenerator,
  GeneratedExpression,
  ParameterTypeRegistry,
} from '@cucumber/cucumber-expressions'
import { reindent } from 'reindent-template-literals'
import { ISnippetSyntaxBuildOptions } from '../../../lib/formatter/step_definition_snippet_builder/snippet_syntax'
import JavascriptSnippetSyntax from './javascript_snippet_syntax'
import { SnippetInterface } from './snippet_syntax'

function generateExpressions(text: string): readonly GeneratedExpression[] {
  const parameterTypeRegistry = new ParameterTypeRegistry()
  const cucumberExpressionGenerator = new CucumberExpressionGenerator(
    () => parameterTypeRegistry.parameterTypes
  )
  return cucumberExpressionGenerator.generateExpressions(text)
}

describe('JavascriptSnippetSyntax', () => {
  describe('build()', () => {
    describe('callback interface', () => {
      it('returns the proper snippet', function () {
        // Arrange
        const syntax = new JavascriptSnippetSyntax(SnippetInterface.Callback)
        const buildOptions: ISnippetSyntaxBuildOptions = {
          comment: 'comment',
          functionName: 'functionName',
          generatedExpressions: generateExpressions('"abc" def "ghi"'),
          stepParameterNames: [],
        }

        // Act
        const result = syntax.build(buildOptions)

        // Assert
        expect(result).to.eql(
          reindent(`
            functionName('{string} def {string}', function (string, string2, callback) {
              // comment
              callback(null, 'pending');
            });`)
        )
      })
    })

    describe('promise interface', () => {
      it('returns the proper snippet', function () {
        // Arrange
        const syntax = new JavascriptSnippetSyntax(SnippetInterface.Promise)
        const buildOptions: ISnippetSyntaxBuildOptions = {
          comment: 'comment',
          functionName: 'functionName',
          generatedExpressions: generateExpressions('"abc" def "ghi"'),
          stepParameterNames: [],
        }

        // Act
        const result = syntax.build(buildOptions)

        // Assert
        expect(result).to.eql(
          reindent(`
            functionName('{string} def {string}', function (string, string2) {
              // comment
              return Promise.resolve('pending');
            });`)
        )
      })
    })

    describe('synchronous interface', () => {
      it('returns the proper snippet', function () {
        // Arrange
        const syntax = new JavascriptSnippetSyntax(SnippetInterface.Synchronous)
        const buildOptions: ISnippetSyntaxBuildOptions = {
          comment: 'comment',
          functionName: 'functionName',
          generatedExpressions: generateExpressions('"abc" def "ghi"'),
          stepParameterNames: [],
        }

        // Act
        const result = syntax.build(buildOptions)

        // Assert
        expect(result).to.eql(
          reindent(`
            functionName('{string} def {string}', function (string, string2) {
              // comment
              return 'pending';
            });`)
        )
      })
    })

    describe('pattern contains single quote', () => {
      it('returns the proper snippet', function () {
        // Arrange
        const syntax = new JavascriptSnippetSyntax(SnippetInterface.Synchronous)
        const buildOptions: ISnippetSyntaxBuildOptions = {
          comment: 'comment',
          functionName: 'functionName',
          generatedExpressions: generateExpressions("pattern'"),
          stepParameterNames: [],
        }

        // Act
        const result = syntax.build(buildOptions)

        // Assert
        expect(result).to.eql(
          reindent(`
            functionName('pattern\\'', function () {
              // comment
              return 'pending';
            });`)
        )
      })
    })

    describe('pattern contains escapes', () => {
      it('returns the proper snippet', () => {
        // Arrange
        const syntax = new JavascriptSnippetSyntax(SnippetInterface.Synchronous)
        const buildOptions: ISnippetSyntaxBuildOptions = {
          comment: 'comment',
          functionName: 'functionName',
          generatedExpressions: generateExpressions(
            'the user (with permissions) executes the action'
          ),
          stepParameterNames: [],
        }

        // Act
        const result = syntax.build(buildOptions)

        // Assert
        expect(result).to.eql(
          reindent(`
            functionName('the user \\\\(with permissions) executes the action', function () {
              // comment
              return 'pending';
            });`)
        )
      })
    })

    describe('multiple patterns', () => {
      it('returns the snippet with the other choices commented out', function () {
        // Arrange
        const syntax = new JavascriptSnippetSyntax(SnippetInterface.Synchronous)
        const buildOptions: ISnippetSyntaxBuildOptions = {
          comment: 'comment',
          functionName: 'functionName',
          generatedExpressions: generateExpressions('123 456'),
          stepParameterNames: [],
        }

        // Act
        const result = syntax.build(buildOptions)

        // Assert
        expect(result).to.eql(
          reindent(`
            functionName('{int} {int}', function (int, int2) {
            // functionName('{int} {float}', function (int, float) {
            // functionName('{float} {int}', function (float, int) {
            // functionName('{float} {float}', function (float, float2) {
              // comment
              return 'pending';
            });`)
        )
      })
    })
  })
})
