function JavaScriptSyntax(interface) {
  return {
    build: function build (functionName, pattern, parameters, comment) {
      var functionKeyword = 'function ';
      if (interface === 'generator') {
        functionKeyword += '*';
      }

      var implementation;
      if (interface === 'callback') {
        var callbackName = parameters[parameters.length - 1];
        implementation = callbackName + '(null, \'pending\');';
      } else {
        parameters.pop();
        implementation = 'return \'pending\';';
      }

      var snippet =
        'this.' + functionName + '(' + pattern + ', ' + functionKeyword + '(' + parameters.join(', ') + ') {' + '\n' +
        '  // ' + comment + '\n' +
        '  ' + implementation + '\n' +
        '});';
      return snippet;
    }
  };
}

module.exports = JavaScriptSyntax;
