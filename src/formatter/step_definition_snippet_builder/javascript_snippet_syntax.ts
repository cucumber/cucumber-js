import { GeneratedExpression } from '@cucumber/cucumber-expressions'
import {
  ISnippetSnytax,
  ISnippetSyntaxBuildOptions,
  SnippetInterface,
} from './snippet_syntax'

const CALLBACK_NAME = 'callback'

export default class JavaScriptSnippetSyntax implements ISnippetSnytax {
  private readonly snippetInterface: SnippetInterface

  constructor(snippetInterface: SnippetInterface) {
    this.snippetInterface = snippetInterface
  }

  build({
    comment,
    generatedExpressions,
    functionName,
    stepParameterNames,
  }: ISnippetSyntaxBuildOptions): string {
    let functionKeyword = 'function '
    if (this.snippetInterface === SnippetInterface.AsyncAwait) {
      functionKeyword = 'async ' + functionKeyword
    }

    let implementation: string
    if (this.snippetInterface === SnippetInterface.Callback) {
      implementation = `${CALLBACK_NAME}(null, 'pending');`
    } else if (this.snippetInterface === SnippetInterface.Promise) {
      implementation = "return Promise.resolve('pending');"
    } else {
      implementation = "return 'pending';"
    }

    const definitionChoices = generatedExpressions.map(
      (generatedExpression, index) => {
        const prefix = index === 0 ? '' : '// '
        const allParameterNames =
          generatedExpression.parameterNames.concat(stepParameterNames)
        if (this.snippetInterface === SnippetInterface.Callback) {
          allParameterNames.push(CALLBACK_NAME)
        }
        return `${prefix + functionName}('${this.escapeSpecialCharacters(
          generatedExpression
        )}', ${functionKeyword}(${allParameterNames.join(', ')}) {\n`
      }
    )

    return (
      `${definitionChoices.join('')}  // ${comment}\n` +
      `  ${implementation}\n` +
      '});'
    )
  }

  private escapeSpecialCharacters(generatedExpression: GeneratedExpression) {
    let source = generatedExpression.source
    // double up any backslashes because we're in a javascript string
    source = source.replace(/\\/g, '\\\\')
    // escape any single quotes because that's our quote delimiter
    source = source.replace(/'/g, "\\'")
    return source
  }
}
