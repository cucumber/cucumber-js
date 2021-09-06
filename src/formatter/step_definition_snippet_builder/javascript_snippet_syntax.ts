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
    } else if (this.snippetInterface === SnippetInterface.Generator) {
      functionKeyword += '*'
    }

    let implementation: string
    if (this.snippetInterface === SnippetInterface.Callback) {
      implementation = `${CALLBACK_NAME}(null, 'pending');`
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
        return `${prefix + functionName}('${generatedExpression.source.replace(
          /'/g,
          "\\'"
        )}', ${functionKeyword}(${allParameterNames.join(', ')}) {\n`
      }
    )

    return (
      `${definitionChoices.join('')}  // ${comment}\n` +
      `  ${implementation}\n` +
      '});'
    )
  }
}
