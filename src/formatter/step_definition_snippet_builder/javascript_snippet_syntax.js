const CALLBACK_NAME = 'callback'

export default class JavaScriptSnippetSyntax {
  constructor(snippetInterface) {
    this.snippetInterface = snippetInterface
  }

  build({ comment, generatedExpressions, functionName, stepParameterNames }) {
    let functionKeyword
    if (this.snippetInterface === 'async-await') {
      functionKeyword = 'async function '
    } else if (this.snippetInterface === 'generator') {
      functionKeyword = 'function *'
    } else if (this.snippetInterface === 'pure') {
      functionKeyword = ''
    } else {
      functionKeyword = 'function '
    }

    let implementation
    if (this.snippetInterface === 'callback') {
      implementation = `${CALLBACK_NAME}(null, 'pending');`
    } else {
      implementation = "return 'pending';"
    }

    const definitionChoices = generatedExpressions.map(
      (generatedExpression, index) => {
        const prefix = index === 0 ? '' : '// '
        const allParameterNames = generatedExpression.parameterNames.concat(
          stepParameterNames
        )
        if (this.snippetInterface === 'pure') {
          allParameterNames.unshift('state')
        }
        if (this.snippetInterface === 'callback') {
          allParameterNames.push(CALLBACK_NAME)
        }
        const functionEol =
          this.snippetInterface === 'pure' ? ' => {\n' : ' {\n'
        return `${prefix + functionName}('${generatedExpression.source.replace(
          /'/g,
          "\\'"
        )}', ${functionKeyword}(${allParameterNames.join(', ')})${functionEol}`
      }
    )

    return (
      `${definitionChoices.join('')}  // ${comment}\n` +
      `  ${implementation}\n` +
      `});`
    )
  }
}
