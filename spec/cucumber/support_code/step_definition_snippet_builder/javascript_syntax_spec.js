require('../../../support/spec_helper');

describe('Cucumber.SupportCode.StepDefinitionSnippetBuilder.JavaScriptSyntax', function () {
  var Cucumber = requireLib('cucumber');
  var Syntax   = Cucumber.SupportCode.StepDefinitionSnippetBuilder.JavaScriptSyntax();

  describe('build()', function () {
    it('returns the proper snippet', function () {
      var actual = Syntax.build('functionName', '/^pattern$/', ['arg1', 'arg2', 'callback'], 'comment');
      var expected =
        'this.functionName(/^pattern$/, function (arg1, arg2, callback) {' + '\n' +
        '  // comment' + '\n' +
        '  callback.pending();' + '\n' +
        '});' + '\n';
      expect(actual).toEqual(expected);
    });
  });
});
