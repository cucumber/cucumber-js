import _ from 'lodash'

export default class JavaScriptSnippetSyntax {
  constructor(snippetInterface) {
    this.snippetInterface = snippetInterface
  }

  build(functionName, pattern, parameters, comment) {
    let functionKeyword = 'function '
    if (this.snippetInterface === 'generator') {
      functionKeyword += '*'
    }

    let implementation
    if (this.snippetInterface === 'callback') {
      const callbackName = _.last(parameters)
      implementation = callbackName + '(null, \'pending\');'
    } else {
      parameters.pop()
      implementation = 'return \'pending\';'
    }

    const snippet =
      'this.' + functionName + '(\'' + pattern.replace(/'/g, '\\\'') + '\', ' + functionKeyword + '(' + parameters.join(', ') + ') {' + '\n' +
      '  // ' + comment + '\n' +
      '  ' + implementation + '\n' +
      '});'
    return snippet
  }
}
