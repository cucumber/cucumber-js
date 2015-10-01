require('../../support/spec_helper');

describe('Cucumber.SupportCode.StepDefinitionSnippetBuilderSyntax', function () {
  var Cucumber                 = requireLib('cucumber');
  var Syntax                   = Cucumber.SupportCode.StepDefinitionSnippetBuilderSyntax;

  function testBaseSyntax(syntax) {

    describe('getStepDefinitionDocString()', function () {
      it('returns "string"', function () {
        expect(syntax.getStepDefinitionDocString()).toBe('string');
      });
    });

    describe('getStepDefinitionDataTable()', function () {
      it('returns "table"', function () {
        expect(syntax.getStepDefinitionDataTable()).toBe('table');
      });
    });

    describe('getStepDefinitionCallback()', function () {
      it('returns "callback"', function () {
        expect(syntax.getStepDefinitionCallback()).toBe('callback');
      });
    });

    describe('getPatternStart()', function () {
      it('returns "/^"', function () {
        expect(syntax.getPatternStart()).toBe('/^');
      });
    });

    describe('getPatternEnd()', function () {
      it('returns "$/"', function () {
        expect(syntax.getPatternEnd()).toBe('$/');
      });
    });

    describe('getContextStepDefinitionFunctionName()', function () {
      it('returns "Given"', function () {
        expect(syntax.getContextStepDefinitionFunctionName()).toBe('Given');
      });
    });

    describe('getEventStepDefinitionFunctionName()', function () {
      it('returns "When"', function () {
        expect(syntax.getEventStepDefinitionFunctionName()).toBe('When');
      });
    });

    describe('getOutcomeStepDefinitionFunctionName()', function () {
      it('returns "Then"', function () {
        expect(syntax.getOutcomeStepDefinitionFunctionName()).toBe('Then');
      });
    });

    describe('getNumberMatchingGroup()', function () {
      it('returns (\\d+)', function () {
        expect(syntax.getNumberMatchingGroup()).toBe('(\\d+)');
      });
    });

    describe('getQuotedStringMatchingGroup()', function () {
      it('returns "([^"]*)"', function () {
        expect(syntax.getQuotedStringMatchingGroup()).toBe('"([^"]*)"');
      });
    });

    describe('getFunctionParameterSeparator()', function () {
      it('returns ", "', function () {
        expect(syntax.getFunctionParameterSeparator()).toBe(', ');
      });
    });

    describe('getStepDefinitionComments()', function () {
      it('returns an array of lines', function () {
        expect(syntax.getStepDefinitionComments().constructor).toBe(Array);
      });
    });

  }

  describe('JavaScript', function () {
    var syntax = new Syntax.JavaScript();

    testBaseSyntax(syntax);

    describe('getStepDefinitionStart()', function () {
      it('returns "this."', function () {
        expect(syntax.getStepDefinitionStart()).toBe('this.');
      });
    });

    describe('getStepDefinitionInner1()', function () {
      it('returns "("', function () {
        expect(syntax.getStepDefinitionInner1()).toBe('(');
      });
    });

    describe('getStepDefinitionInner2()', function () {
      it('returns ") //, function ("', function () {
        expect(syntax.getStepDefinitionInner2()).toBe(') //, function (');
      });
    });

    describe('getStepDefinitionEnd()', function () {
      var str = ") {\n  // line1\n  // line2\n// });\n";
      it('returns the function body', function () {
        spyOn(syntax, 'getStepDefinitionComments').andReturn(['line1', 'line2']);
        expect(syntax.getStepDefinitionEnd()).toBe(str);
      });
    });
  });

  describe('CoffeeScipt', function () {
    var syntax = new Syntax.CoffeeScript();

    testBaseSyntax(syntax);

    describe('getStepDefinitionStart()', function () {
      it('returns "@"', function () {
        expect(syntax.getStepDefinitionStart()).toBe('@');
      });
    });

    describe('getStepDefinitioninner1()', function () {
      it('returns " "', function () {
        expect(syntax.getStepDefinitionInner1()).toBe(' ');
      });
    });

    describe('getStepDefinitionInner2()', function () {
      it('returns " #, ("', function () {
        expect(syntax.getStepDefinitionInner2()).toBe(' #, (');
      });
    });

    describe('getStepDefinitionEnd()', function () {
      var str = ") ->\n  # line1\n  # line2\n";
      it('returns the function body', function () {
        spyOn(syntax, 'getStepDefinitionComments').andReturn(['line1', 'line2']);
        expect(syntax.getStepDefinitionEnd()).toBe(str);
      });
    });
  });
});
