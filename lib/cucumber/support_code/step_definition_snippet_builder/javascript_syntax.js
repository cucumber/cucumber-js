function JavaScriptSyntax() {
  var self = {
    build: function build (functionName, pattern, parameters, comment) {
      var snippet =
        'this.' + functionName + '(' + pattern + ', function (' + parameters.join(', ') + ') {' + '\n' +
        '  // ' + comment + '\n' +
        '  callback.pending();' + '\n' +
        '});' + '\n';
      return snippet;
    }
  };

  return self;
}

module.exports = JavaScriptSyntax;
