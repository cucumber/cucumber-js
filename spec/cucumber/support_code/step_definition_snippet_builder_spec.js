require('../../support/spec_helper');

describe("Cucumber.SupportCode.StepDefinitionSnippetBuilder", function () {
  var Cucumber                     = requireLib('cucumber');
  var snippetBuilder, step, syntax;

  beforeEach(function () {
    step           = createSpy("step");
    syntax         = createSpyWithStubs("step syntax", {build: null});
    snippetBuilder = Cucumber.SupportCode.StepDefinitionSnippetBuilder(step, syntax);
  });

  describe("buildSnippet()", function () {
    var functionName, pattern, parameters, snippet;

    beforeEach(function () {
      functionName   = "defineSomeStep";
      pattern        = "/^some step pattern$/";
      parameters     = ['some', 'parameters', 'and', 'the', 'callback'];
      snippet        = 'snippet';
      spyOn(snippetBuilder, 'buildStepDefinitionFunctionName').and.returnValue(functionName);
      spyOn(snippetBuilder, 'buildStepDefinitionPattern').and.returnValue(pattern);
      spyOn(snippetBuilder, 'buildStepDefinitionParameters').and.returnValue(parameters);
      syntax.build.and.returnValue(snippet);
    });

    it("builds the step definition's function name", function () {
      snippetBuilder.buildSnippet();
      expect(snippetBuilder.buildStepDefinitionFunctionName).toHaveBeenCalled();
    });

    it("builds the step definition's pattern", function () {
      snippetBuilder.buildSnippet();
      expect(snippetBuilder.buildStepDefinitionPattern).toHaveBeenCalled();
    });

    it("builds the step definition's parameters", function () {
      snippetBuilder.buildSnippet();
      expect(snippetBuilder.buildStepDefinitionParameters).toHaveBeenCalled();
    });

    it("builds the snippet in the given syntax", function () {
      snippetBuilder.buildSnippet();
      expect(syntax.build).toHaveBeenCalledWith(functionName, pattern, parameters, jasmine.any(String));
    });

    it("returns the snippet", function () {
      expect(snippetBuilder.buildSnippet()).toBe(snippet);
    });
  });

  describe("buildStepDefinitionFunctionName()", function () {
    beforeEach(function () {
      spyOnStub(step, 'isOutcomeStep');
      spyOnStub(step, 'isEventStep');
    });

    it("checks whether the step is a context step", function () {
      snippetBuilder.buildStepDefinitionFunctionName();
      expect(step.isOutcomeStep).toHaveBeenCalled();
    });

    describe("when the step is a context step", function () {
      beforeEach(function () {
        step.isOutcomeStep.and.returnValue(true);
      });

      it("returns the outcome step definition function name", function () {
        expect(snippetBuilder.buildStepDefinitionFunctionName()).toBe("Then");
      });
    });

    describe("when the step is not a context step", function () {
      beforeEach(function () {
        step.isOutcomeStep.and.returnValue(false);
      });

      it("checks whether the step is an event step", function () {
        snippetBuilder.buildStepDefinitionFunctionName();
        expect(step.isEventStep).toHaveBeenCalled();
      });

      describe("when the step is an event step", function () {
        beforeEach(function () {
          step.isEventStep.and.returnValue(true);
        });

        it("returns the event step definition function name", function () {
          expect(snippetBuilder.buildStepDefinitionFunctionName()).toBe("When");
        });
      });

      describe("when the step is not an event step", function () {
        beforeEach(function () {
          step.isEventStep.and.returnValue(false);
        });

        it("returns the context step definition function name", function () {
          expect(snippetBuilder.buildStepDefinitionFunctionName()).toBe("Given");
        });
      });
    });
  });

  describe("buildStepDefinitionPattern()", function () {
    var stepName, escapedStepName, parameterizedStepName;

    beforeEach(function () {
      parameterizedStepName = "step name-" + (Math.random()*10);
      escapedStepName = createSpy("escaped step name");
      stepName        = createSpy("step name");
      spyOnStub(step, 'getName').and.returnValue(stepName);
      spyOnStub(step, 'isOutlineStep');
      spyOnStub(Cucumber.Util.RegExp, 'escapeString').and.returnValue(escapedStepName);
      spyOn(snippetBuilder, 'parameterizeStepName').and.returnValue(parameterizedStepName);
    });

    it("gets the step name", function () {
      snippetBuilder.buildStepDefinitionPattern();
      expect(step.getName).toHaveBeenCalled();
    });

    it("escapes the step name for use as a regexp", function () {
      snippetBuilder.buildStepDefinitionPattern();
      expect(Cucumber.Util.RegExp.escapeString).toHaveBeenCalledWith(stepName);
    });

    it("parameterizes the step name", function () {
      snippetBuilder.buildStepDefinitionPattern();
      expect(snippetBuilder.parameterizeStepName).toHaveBeenCalledWith(escapedStepName);
    });

    it("returns the step name within a full line-matching regexp", function () {
      var pattern = snippetBuilder.buildStepDefinitionPattern();
      expect(pattern).toBe('/^' + parameterizedStepName + '$/');
    });
  });

  describe("parameterizeStepName()", function () {
    var stepName, parameterizedNumbersStepName, parameterizedStepName, parameterizedExamplesStepName;

    beforeEach(function () {
      parameterizedStepName         = createSpy("parameterized step name");
      parameterizedExamplesStepName = createSpyWithStubs("step name with parameterized numbers", {replace: parameterizedStepName});
      parameterizedNumbersStepName  = createSpyWithStubs("step name with parameterized numbers", {replace: parameterizedExamplesStepName});
      stepName                      = createSpyWithStubs("step name", {replace: parameterizedNumbersStepName});
    });

    it("replaces numbers with matching groups", function () {
      snippetBuilder.parameterizeStepName(stepName);
      expect(stepName.replace).toHaveBeenCalled();
      expect(stepName.replace).toHaveBeenCalledWithRegExpAsNthParameter(/\d+/gi, 1);
      expect(stepName.replace).toHaveBeenCalledWithValueAsNthParameter('(\\d+)', 2);
    });

    it("replaces quoted strings with matching groups", function () {
      snippetBuilder.parameterizeStepName(stepName);
      expect(parameterizedNumbersStepName.replace).toHaveBeenCalled();
      expect(parameterizedNumbersStepName.replace).toHaveBeenCalledWithRegExpAsNthParameter(/"[^"]*"/gi, 1);
      expect(parameterizedNumbersStepName.replace).toHaveBeenCalledWithValueAsNthParameter('"([^"]*)"', 2);
    });

    it("returns the parameterized step name", function () {
      expect(snippetBuilder.parameterizeStepName(stepName)).toBe(parameterizedStepName);
    });
  });

  describe("buildStepDefinitionParameters()", function () {
    var patternMatchingGroupParameters;

    beforeEach(function () {
      patternMatchingGroupParameters = ['some', 'stepdef', 'parameters'];
      spyOn(snippetBuilder, 'getStepDefinitionPatternMatchingGroupParameters').and.returnValue(patternMatchingGroupParameters);
      spyOnStub(step, 'hasDocString');
      spyOnStub(step, 'hasDataTable');
      spyOnStub(step, 'isOutlineStep');
    });

    it("gets the step definition pattern matching group parameters", function () {
      snippetBuilder.buildStepDefinitionParameters();
      expect(snippetBuilder.getStepDefinitionPatternMatchingGroupParameters).toHaveBeenCalled();
    });

    it("checks whether the step has a doc string attached or not", function () {
      snippetBuilder.buildStepDefinitionParameters();
      expect(step.hasDocString).toHaveBeenCalled();
    });

    it("checks whether the step has a data table attached or not", function () {
      snippetBuilder.buildStepDefinitionParameters();
      expect(step.hasDataTable).toHaveBeenCalled();
    });

    it("returns the parameters and a callback joined", function () {
      var parameters = patternMatchingGroupParameters.concat(['callback']);
      expect(snippetBuilder.buildStepDefinitionParameters()).toEqual(parameters);
    });

    describe("when there is a doc string", function () {
      it("returns the parameters, an additional 'string' parameter and a callback joined", function () {
        step.hasDocString.and.returnValue(true);
        var parameters = patternMatchingGroupParameters.concat(['string', 'callback']);
        expect(snippetBuilder.buildStepDefinitionParameters()).toEqual(parameters);
      });
    });

    describe("when there is a data table", function () {
      it("returns the parameters, an additional 'table' parameter and a callback joined", function () {
        step.hasDataTable.and.returnValue(true);
        var parameters = patternMatchingGroupParameters.concat(['table', 'callback']);
        expect(snippetBuilder.buildStepDefinitionParameters()).toEqual(parameters);
      });
    });
  });

  describe("getStepDefinitionPatternMatchingGroupParameters()", function () {
    beforeEach(function () {
      spyOn(snippetBuilder, 'countStepDefinitionPatternMatchingGroups');
      spyOnStub(step, 'isOutlineStep');
      spyOnStub(step, 'getName');
      step.getName.and.returnValue('stepName');
    });

    it("gets the number of step definition pattern matching groups", function () {
      snippetBuilder.countStepDefinitionPatternMatchingGroups.and.returnValue(0);
      snippetBuilder.getStepDefinitionPatternMatchingGroupParameters();
      expect(snippetBuilder.countStepDefinitionPatternMatchingGroups).toHaveBeenCalled();
    });

    it("returns an empty array when there are no matching groups", function () {
      snippetBuilder.countStepDefinitionPatternMatchingGroups.and.returnValue(0);
      var parameters = snippetBuilder.getStepDefinitionPatternMatchingGroupParameters();
      expect(parameters).toEqual([]);
    });

    it("returns one parameter when there is one matching group", function () {
      snippetBuilder.countStepDefinitionPatternMatchingGroups.and.returnValue(1);
      var parameters = snippetBuilder.getStepDefinitionPatternMatchingGroupParameters();
      expect(parameters).toEqual(['arg1']);
    });

    it("returns two joined parameters when there are two matching groups", function () {
      snippetBuilder.countStepDefinitionPatternMatchingGroups.and.returnValue(2);
      var parameters = snippetBuilder.getStepDefinitionPatternMatchingGroupParameters();
      expect(parameters).toEqual(['arg1', 'arg2']);
    });
  });

  describe("countStepDefinitionPatternMatchingGroups()", function () {
    var stepDefinitionPattern, numberCount, stringCount, count;

    beforeEach(function () {
      numberCount = Math.floor(Math.random() * 10);
      stringCount = Math.floor(Math.random() * 10);
      count       = numberCount + stringCount;
      stepDefinitionPattern = createSpy("step definition pattern");
      spyOn(snippetBuilder, 'buildStepDefinitionPattern').and.returnValue(stepDefinitionPattern);
      spyOn(Cucumber.Util.String, 'count').and.returnValues.apply(null, [numberCount, stringCount]);
    });

    it("builds the step definition pattern", function () {
      snippetBuilder.countStepDefinitionPatternMatchingGroups();
      expect(snippetBuilder.buildStepDefinitionPattern).toHaveBeenCalled();
    });

    it("counts the number matching groups inside the pattern", function () {
      snippetBuilder.countStepDefinitionPatternMatchingGroups();
      expect(Cucumber.Util.String.count).toHaveBeenCalledWith(stepDefinitionPattern, '(\\d+)');
    });

    it("counts the quoted string matching groups inside the pattern", function () {
      snippetBuilder.countStepDefinitionPatternMatchingGroups();
      expect(Cucumber.Util.String.count).toHaveBeenCalledWith(stepDefinitionPattern, '"([^"]*)"');
    });

    it("returns the sum of both counts", function () {
      expect(snippetBuilder.countStepDefinitionPatternMatchingGroups()).toBe(count);
    });
  });
});
