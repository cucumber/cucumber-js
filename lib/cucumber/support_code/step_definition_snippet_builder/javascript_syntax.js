function JavaScriptSyntax() {
  return {
    build: function build (functionName, pattern, parameters, comment) {
      var callbackName = parameters[parameters.length - 1];
      var snippet =
        'this.' + functionName + '(' + pattern + ', function (' + parameters.join(', ') + ') {' + '\n' +
        '  // ' + comment + '\n' +
        '  ' + callbackName + '.pending();' + '\n' +
        '});' + '\n';
      return snippet;
    }
  };
}

module.exports = JavaScriptSyntax;
