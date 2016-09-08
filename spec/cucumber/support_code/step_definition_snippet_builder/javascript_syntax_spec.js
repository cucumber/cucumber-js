require('../../../support/spec_helper');

describe('Cucumber.SupportCode.StepDefinitionSnippetBuilder.JavaScriptSyntax', function () {
  var Cucumber = requireLib('cucumber');

  describe('build()', function () {
    var Syntax;

    describe('callback interface', function () {
      beforeEach(function() {
        Syntax = Cucumber.SupportCode.StepDefinitionSnippetBuilder.JavaScriptSyntax('callback');
      });

      it('returns the proper snippet', function () {
        var actual = Syntax.build('functionName', '/^pattern$/', ['arg1', 'arg2', 'callback'], 'comment');
        var expected =
          'this.functionName(/^pattern$/, function (arg1, arg2, callback) {' + '\n' +
          '  // comment' + '\n' +
          '  callback(null, \'pending\');' + '\n' +
          '});';
        expect(actual).toEqual(expected);
      });
    });

    describe('generator interface', function () {
      beforeEach(function() {
        Syntax = Cucumber.SupportCode.StepDefinitionSnippetBuilder.JavaScriptSyntax('generator');
      });

      it('returns the proper snippet', function () {
        var actual = Syntax.build('functionName', '/^pattern$/', ['arg1', 'arg2', 'callback'], 'comment');
        var expected =
          'this.functionName(/^pattern$/, function *(arg1, arg2) {' + '\n' +
          '  // comment' + '\n' +
          '  return \'pending\';' + '\n' +
          '});';
        expect(actual).toEqual(expected);
      });
    });

    describe('promise interface', function () {
      beforeEach(function() {
        Syntax = Cucumber.SupportCode.StepDefinitionSnippetBuilder.JavaScriptSyntax('promise');
      });

      it('returns the proper snippet', function () {
        var actual = Syntax.build('functionName', '/^pattern$/', ['arg1', 'arg2', 'callback'], 'comment');
        var expected =
          'this.functionName(/^pattern$/, function (arg1, arg2) {' + '\n' +
          '  // comment' + '\n' +
          '  return \'pending\';' + '\n' +
          '});';
        expect(actual).toEqual(expected);
      });
    });

    describe('synchronous interface', function () {
      beforeEach(function() {
        Syntax = Cucumber.SupportCode.StepDefinitionSnippetBuilder.JavaScriptSyntax('synchronous');
      });

      it('returns the proper snippet', function () {
        var actual = Syntax.build('functionName', '/^pattern$/', ['arg1', 'arg2', 'callback'], 'comment');
        var expected =
          'this.functionName(/^pattern$/, function (arg1, arg2) {' + '\n' +
          '  // comment' + '\n' +
          '  return \'pending\';' + '\n' +
          '});';
        expect(actual).toEqual(expected);
      });
    });
  });
});
