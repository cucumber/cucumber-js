require('../../support/spec_helper');

describe("Cucumber.SupportCode.StepDefinition", function () {
  var Cucumber = requireLib('cucumber');
  var stepDefinition, pattern, stepDefinitionCode;

  beforeEach(function () {
    pattern            = createSpyWithStubs("pattern", {test: null});
    stepDefinitionCode = createSpy("step definition code");
    spyOn(global, 'RegExp');
    stepDefinition = Cucumber.SupportCode.StepDefinition(pattern, {}, stepDefinitionCode);
  });

  describe("getPatternRegexp()", function () {
    describe("when the pattern is a RegExp", function () {
      it("does not instantiate a RegExp", function () {
        expect(global.RegExp).not.toHaveBeenCalled();
      });

      it("returns the pattern itself", function () {
        expect(stepDefinition.getPatternRegexp()).toBe(pattern);
      });
    });

    describe("when the pattern is a String", function () {
      var regexp, quotedDollarParameterSubstitutedPattern, safeString, regexpString;

      beforeEach(function () {
        regexp                                  = createSpy("regexp");
        regexpString                            = "regexp string";
        safeString                              = createSpyWithStubs("safe string");
        quotedDollarParameterSubstitutedPattern = createSpyWithStubs("quoted dollar param substituted pattern", {replace: regexpString});
        spyOnStub(pattern, 'replace').and.returnValue(safeString);
        spyOnStub(safeString, 'replace').and.returnValue(quotedDollarParameterSubstitutedPattern);
        global.RegExp.and.returnValue(regexp);
      });

      it("escapes unsafe regexp characters from the string", function () {
        stepDefinition.getPatternRegexp();
        expect(pattern.replace).toHaveBeenCalledWith(Cucumber.SupportCode.StepDefinition.UNSAFE_STRING_CHARACTERS_REGEXP, Cucumber.SupportCode.StepDefinition.PREVIOUS_REGEXP_MATCH);
      });

      it("replaces quoted dollar-prefixed parameters with the regexp equivalent", function () {
        stepDefinition.getPatternRegexp();
        expect(safeString.replace).toHaveBeenCalledWith(Cucumber.SupportCode.StepDefinition.QUOTED_DOLLAR_PARAMETER_REGEXP, Cucumber.SupportCode.StepDefinition.QUOTED_DOLLAR_PARAMETER_SUBSTITUTION);
      });

      it("replaces other dollar-prefixed parameter with the regexp equivalent", function () {
        stepDefinition.getPatternRegexp();
        expect(quotedDollarParameterSubstitutedPattern.replace).toHaveBeenCalledWith(Cucumber.SupportCode.StepDefinition.DOLLAR_PARAMETER_REGEXP, Cucumber.SupportCode.StepDefinition.DOLLAR_PARAMETER_SUBSTITUTION);
      });

      it("instantiates a new RegExp", function () {
        stepDefinition.getPatternRegexp();
        expect(global.RegExp).toHaveBeenCalledWith("^" + regexpString + "$");
      });

      it("returns the new RegExp", function () {
        expect(stepDefinition.getPatternRegexp()).toBe(regexp);
      });
    });
  });

  describe("matchesStepName()", function () {
    var patternRegexp, stepName, matchResult;

    beforeEach(function () {
      stepName      = createSpy("step name");
      matchResult   = createSpy("step match result (boolean)");
      patternRegexp = createSpyWithStubs("pattern regexp", {test: matchResult});
      spyOn(stepDefinition, 'getPatternRegexp').and.returnValue(patternRegexp);
    });

    it("gets the pattern regexp", function () {
      stepDefinition.matchesStepName(stepName);
      expect(stepDefinition.getPatternRegexp).toHaveBeenCalled();
    });

    it("tests the string against the step name", function () {
      stepDefinition.matchesStepName(stepName);
      expect(patternRegexp.test).toHaveBeenCalledWith(stepName);
    });

    it("returns the match result", function () {
      expect(stepDefinition.matchesStepName(stepName)).toBe(matchResult);
    });
  });

  describe("invoke()", function () {
    var step, world, scenario, defaultTimeout, callback, parameters;

    beforeEach(function () {
      step = createSpy("step");
      world = createSpy("world");
      scenario = createSpyWithStubs("scenario", {getAttachments: undefined});
      defaultTimeout = 5 * 1000;
      callback = createSpy("callback");
      parameters = createSpy("code execution parameters");
      spyOn(Cucumber.Util, 'run');
      spyOn(stepDefinition, 'buildInvocationParameters').and.returnValue(parameters);
      stepDefinition.invoke(step, world, scenario, defaultTimeout, callback);
    });

    it("builds the step invocation parameters", function () {
      expect(stepDefinition.buildInvocationParameters).toHaveBeenCalledWith(step, scenario);
    });

    it("runs the function", function () {
      expect(Cucumber.Util.run).toHaveBeenCalledWith(stepDefinitionCode, world, parameters, defaultTimeout, jasmine.any(Function));
    });

    it("does not call back", function () {
      expect(callback).not.toHaveBeenCalled();
    });

    describe("function run completes", function() {
      var stepResult, attachments;

      beforeEach(function () {
        stepResult = createSpy("step result");
        attachments = createSpy("attachments");
        spyOn(Cucumber.Runtime, 'StepResult').and.returnValue(stepResult);
      });

      describe("without error", function() {
        beforeEach(function () {
          spyOnStub(scenario, 'getAttachments').and.returnValue(attachments);
          var runCallback = Cucumber.Util.run.calls.mostRecent().args[4];
          runCallback();
        });

        it("gets the attachments from the scenario", function () {
          expect(scenario.getAttachments).toHaveBeenCalled();
        });

        it("creates a successful step result", function () {
          expect(Cucumber.Runtime.StepResult).toHaveBeenCalledWith({
            step: step,
            stepDefinition: stepDefinition,
            duration: jasmine.any(Number),
            attachments: attachments,
            status: Cucumber.Status.PASSED
          });
        });

        it("calls back", function () {
          expect(callback).toHaveBeenCalledWith(stepResult);
        });
      });

      describe("with error", function () {
        beforeEach(function () {
          spyOnStub(scenario, 'getAttachments').and.returnValue(attachments);
          var failureReason = "failure reason";
          var runCallback = Cucumber.Util.run.calls.mostRecent().args[4];
          runCallback(failureReason);
        });

        it("gets the attachments from the scenario", function () {
          expect(scenario.getAttachments).toHaveBeenCalled();
        });

        it("creates a failing step result", function () {
          expect(Cucumber.Runtime.StepResult).toHaveBeenCalledWith({
            step: step,
            stepDefinition: stepDefinition,
            failureException: "failure reason",
            duration: jasmine.any(Number),
            attachments: attachments,
            status: Cucumber.Status.FAILED
          });
        });

        it("calls back", function () {
          expect(callback).toHaveBeenCalledWith(stepResult);
        });
      });

      describe("with 'pending'", function () {
        beforeEach(function () {
          spyOnStub(scenario, "getAttachments").and.returnValue(attachments);
          var runCallback = Cucumber.Util.run.calls.mostRecent().args[4];
          runCallback(null, 'pending');
        });

        it("gets the attachments from the scenario", function () {
          expect(scenario.getAttachments).toHaveBeenCalled();
        });

        it("creates a pending step result", function () {
          expect(Cucumber.Runtime.StepResult).toHaveBeenCalledWith({
            step: step,
            stepDefinition: stepDefinition,
            duration: jasmine.any(Number),
            attachments: attachments,
            status: Cucumber.Status.PENDING
          });
        });

        it("calls back", function () {
          expect(callback).toHaveBeenCalledWith(stepResult);
        });
      });
    });
  });

  describe("buildInvocationParameters()", function () {
    var patternRegexp, step, stepName, stepAttachmentContents;
    var matches, scenario;

    beforeEach(function () {
      stepName = createSpy("step name to match");
      matches = ['full match', 'arg1', 'arg2'];
      patternRegexp = createSpyWithStubs("pattern regexp", {test: matches});
      stepAttachmentContents = createSpy("step attachment contents");
      step = createSpyWithStubs("step", {hasAttachment: null, getName: stepName, getAttachmentContents: stepAttachmentContents});
      scenario = createSpy("scenario");
      spyOn(stepDefinition, 'getPatternRegexp').and.returnValue(patternRegexp);
      spyOnStub(patternRegexp, 'exec').and.returnValue(matches);
      spyOnStub(step, 'getArguments').and.returnValue([]);
    });

    it("executes the pattern regexp against the step name", function () {
      stepDefinition.buildInvocationParameters(step, scenario);
      expect(patternRegexp.exec).toHaveBeenCalledWith(stepName);
    });

    it("returns the arg", function () {
      var result = stepDefinition.buildInvocationParameters(step, scenario);
      expect(result).toEqual(['arg1', 'arg2']);
    });

    describe("when the step has an doc string argument", function () {
      beforeEach(function () {
        var docStringArgument = createSpyWithStubs('doc string', {getContent: 'doc string content', getType: 'DocString'});
        step.getArguments.and.returnValue([docStringArgument]);
      });

      it("adds the doc string content as an argument", function () {
        var result = stepDefinition.buildInvocationParameters(step, scenario);
        expect(result).toEqual(['arg1', 'arg2', 'doc string content']);
      });
    });

    describe("when the step has an doc string argument", function () {
      var dataTableArgument;

      beforeEach(function () {
        dataTableArgument = createSpyWithStubs('data table', {getType: 'DataTable'});
        step.getArguments.and.returnValue([dataTableArgument]);
      });

      it("adds the data table as an argument", function () {
        var result = stepDefinition.buildInvocationParameters(step, scenario);
        expect(result).toEqual(['arg1', 'arg2', dataTableArgument]);
      });
    });
  });

  describe("buildExceptionHandlerToCodeCallback()", function () {
    var codeCallback, exceptionHandler;

    beforeEach(function () {
      codeCallback = createSpy("code callback");
      exceptionHandler = stepDefinition.buildExceptionHandlerToCodeCallback(codeCallback);
    });

    it("returns an exception handler", function () {
      expect(exceptionHandler).toBeAFunction ();
    });

    describe("returned exception handler", function () {
      var exception;

      beforeEach(function () {
        exception = createSpy("exception");
      });

      it("calls back as a failure with the exception", function () {
        exceptionHandler(exception);
        expect(codeCallback).toHaveBeenCalledWith(exception);
      });
    });
  });
});
