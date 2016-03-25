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
    var step, world, scenario, defaultTimeout, callback;
    var parameters, exceptionHandler;
    var timestamp = 0;

    beforeEach(function () {
      step                          = createSpy("step");
      world                         = createSpy("world");
      scenario                      = createSpyWithStubs("scenario", {getAttachments: undefined});
      defaultTimeout                = 5 * 1000;
      callback                      = createSpy("callback");
      parameters                    = createSpy("code execution parameters");
      exceptionHandler              = createSpy("exception handler");
      spyOn(Cucumber.Util.Exception, 'registerUncaughtExceptionHandler');
      spyOn(stepDefinition, 'buildCodeCallback').and.callFake(function (codeCallback) { return codeCallback; });
      spyOn(stepDefinition, 'buildInvocationParameters').and.returnValue(parameters);
      spyOn(stepDefinition, 'buildExceptionHandlerToCodeCallback').and.returnValue(exceptionHandler);
      spyOn(stepDefinitionCode, 'apply');

      if (process.hrtime) {
        spyOn(process, 'hrtime').and.callFake(function (time) {
          if (time) {
            return [0 - time[0], (timestamp * 1e6) - time[1]];
          }
          else {
            return [0, timestamp * 1e6];
          }
        });
      }
      else {
        spyOn(global, 'Date').and.callFake(function () {
          return {
            getTime: function () {
              return timestamp;
            }
          };
        });
      }
    });

    it("builds the step invocation parameters", function () {
      stepDefinition.invoke(step, world, scenario, defaultTimeout, callback);
      expect(stepDefinition.buildInvocationParameters).toHaveBeenCalled();
      expect(stepDefinition.buildInvocationParameters).toHaveBeenCalledWithValueAsNthParameter(step, 1);
      expect(stepDefinition.buildInvocationParameters).toHaveBeenCalledWithValueAsNthParameter(scenario, 2);
      expect(stepDefinition.buildInvocationParameters).toHaveBeenCalledWithAFunctionAsNthParameter(3);
    });

    it("builds an exception handler for the code callback", function () {
      stepDefinition.invoke(step, world, scenario, defaultTimeout, callback);
      expect(stepDefinition.buildExceptionHandlerToCodeCallback).toHaveBeenCalledWithAFunctionAsNthParameter(1);

      var codeExecutionCallbackPassedToParameterBuilder = stepDefinition.buildInvocationParameters.calls.mostRecent().args[2];
      var codeExecutionCallbackPassedToExceptionHandlerBuilder = stepDefinition.buildExceptionHandlerToCodeCallback.calls.mostRecent().args[0];
      expect(codeExecutionCallbackPassedToExceptionHandlerBuilder).toBe(codeExecutionCallbackPassedToParameterBuilder);
    });

    it("registers the exception handler for uncaught exceptions", function () {
      stepDefinition.invoke(step, world, scenario, defaultTimeout, callback);
      expect(Cucumber.Util.Exception.registerUncaughtExceptionHandler).toHaveBeenCalledWith(exceptionHandler);
    });

    it("calls the step definition code with the parameters and World as 'this'", function () {
      stepDefinition.invoke(step, world, scenario, defaultTimeout, callback);
      expect(stepDefinitionCode.apply).toHaveBeenCalledWith(world, parameters);
    });

    it("builds the code callback", function () {
      stepDefinition.invoke(step, world, scenario, defaultTimeout, callback);
      expect(stepDefinition.buildCodeCallback).toHaveBeenCalled();
      expect(stepDefinition.buildCodeCallback).toHaveBeenCalledWithAFunctionAsNthParameter(1);
    });

    describe("callback used to build the code callback", function () {
      var codeExecutionCallback, stepResult, attachments;

      beforeEach(function () {
        stepDefinition.invoke(step, world, scenario, defaultTimeout, callback);
        codeExecutionCallback = stepDefinition.buildCodeCallback.calls.mostRecent().args[0];
        stepResult            = createSpy("step result");
        attachments           = createSpy("attachments");
        spyOn(Cucumber.Runtime, 'StepResult').and.returnValue(stepResult);
        spyOn(Cucumber.Util.Exception, 'unregisterUncaughtExceptionHandler');
      });

      it("is passed to the step definition code", function () {
        expect(stepDefinition.buildInvocationParameters.calls.mostRecent().args[2]).toBe(codeExecutionCallback);
      });

      describe("when called without an error", function () {
        beforeEach(function () {
          timestamp = 1;
          spyOnStub(scenario, 'getAttachments').and.returnValue(attachments);
          codeExecutionCallback();
        });

        it("gets the attachments from the scenario", function () {
          expect(scenario.getAttachments).toHaveBeenCalled();
        });

        it("creates a successful step result", function () {
          expect(Cucumber.Runtime.StepResult).toHaveBeenCalledWith({
            step: step,
            stepDefinition: stepDefinition,
            duration: 1e6,
            attachments: attachments,
            status: Cucumber.Status.PASSED
          });
        });

        it("unregisters the exception handler", function () {
          expect(Cucumber.Util.Exception.unregisterUncaughtExceptionHandler).toHaveBeenCalledWith(exceptionHandler);
        });

        it("calls back", function () {
          expect(callback).toHaveBeenCalledWith(stepResult);
        });

        afterEach(function () {
          timestamp = 0;
        });
      });

      describe("when called with an error", function () {
        var failureReason;

        beforeEach(function () {
          timestamp = 1;
          spyOnStub(scenario, 'getAttachments').and.returnValue(attachments);
          failureReason = 'an error';
          codeExecutionCallback(failureReason);
        });

        it("gets the attachments from the scenario", function () {
          expect(scenario.getAttachments).toHaveBeenCalled();
        });

        it("creates a failing step result", function () {
          expect(Cucumber.Runtime.StepResult).toHaveBeenCalledWith({
            step: step,
            stepDefinition: stepDefinition,
            failureException: failureReason,
            duration: 1e6,
            attachments: attachments,
            status: Cucumber.Status.FAILED
          });
        });

        it("unregisters the exception handler", function () {
          expect(Cucumber.Util.Exception.unregisterUncaughtExceptionHandler).toHaveBeenCalledWith(exceptionHandler);
        });

        it("calls back", function () {
          expect(callback).toHaveBeenCalledWith(stepResult);
        });

        afterEach(function () {
          timestamp = 0;
        });
      });

      describe("pending()", function () {
        beforeEach(function () {
          timestamp = 1;
          spyOnStub(scenario, "getAttachments").and.returnValue(attachments);
        });

        afterEach(function () {
          timestamp = 0;
        });

        it("gets the attachments from the scenario", function () {
          codeExecutionCallback(null, 'pending');
          expect(scenario.getAttachments).toHaveBeenCalled();
        });

        it("creates a pending step result", function () {
          codeExecutionCallback(null, 'pending');
          expect(Cucumber.Runtime.StepResult).toHaveBeenCalledWith({
            step: step,
            stepDefinition: stepDefinition,
            duration: 1e6,
            attachments: attachments,
            status: Cucumber.Status.PENDING
          });
        });

        it("unregisters the exception handler", function () {
          codeExecutionCallback(null, 'pending');
          expect(Cucumber.Util.Exception.unregisterUncaughtExceptionHandler).toHaveBeenCalledWith(exceptionHandler);
        });

        it("calls back", function () {
          codeExecutionCallback(null, 'pending');
          expect(callback).toHaveBeenCalledWith(stepResult);
        });
      });
    });

    describe("when the step definition code throws an exception", function () {
      var failureException;

      beforeEach(function () {
        failureException = new Error("failing step definition exception");
        stepDefinitionCode.apply.and.throwError(failureException);
      });

      it("handles the exception with the exception handler", function () {
        stepDefinition.invoke(step, world, scenario, defaultTimeout, callback);
        expect(exceptionHandler).toHaveBeenCalledWith(failureException);
      });
    });
  });

  describe("buildCodeCallback", function () {
    it("is just a pass through", function () {
      var callback = createSpy("callback");
      var returnValue = stepDefinition.buildCodeCallback(callback);
      expect(returnValue).toBe(callback);
    });
  });

  describe("buildInvocationParameters()", function () {
    var patternRegexp, step, stepName, stepAttachmentContents;
    var matches, scenario, callback;

    beforeEach(function () {
      stepName               = createSpy("step name to match");
      matches                = ['full match', 'arg1', 'arg2'];
      patternRegexp          = createSpyWithStubs("pattern regexp", {test: matches});
      stepAttachmentContents = createSpy("step attachment contents");
      step                   = createSpyWithStubs("step", {hasAttachment: null, getName: stepName, getAttachmentContents: stepAttachmentContents});
      scenario               = createSpy("scenario");
      callback               = createSpy("callback");
      spyOn(stepDefinition, 'getPatternRegexp').and.returnValue(patternRegexp);
      spyOnStub(patternRegexp, 'exec').and.returnValue(matches);
      spyOnStub(step, 'getArguments').and.returnValue([]);
    });

    it("executes the pattern regexp against the step name", function () {
      stepDefinition.buildInvocationParameters(step, scenario, callback);
      expect(patternRegexp.exec).toHaveBeenCalledWith(stepName);
    });

    it("returns the args with a callback", function () {
      var result = stepDefinition.buildInvocationParameters(step, scenario, callback);
      expect(result).toEqual(['arg1', 'arg2', jasmine.any(Function)]);
    });

    describe("when the step has an doc string argument", function () {
      beforeEach(function () {
        var docStringArgument = createSpyWithStubs('doc string', {getContent: 'doc string content', getType: 'DocString'});
        step.getArguments.and.returnValue([docStringArgument]);
      });

      it("adds the doc string content as an argument", function () {
        var result = stepDefinition.buildInvocationParameters(step, scenario, callback);
        expect(result).toEqual(['arg1', 'arg2', 'doc string content', callback]);
      });
    });

    describe("when the step has an doc string argument", function () {
      var dataTableArgument;

      beforeEach(function () {
        dataTableArgument = createSpyWithStubs('data table', {getType: 'DataTable'});
        step.getArguments.and.returnValue([dataTableArgument]);
      });

      it("adds the data table as an argument", function () {
        var result = stepDefinition.buildInvocationParameters(step, scenario, callback);
        expect(result).toEqual(['arg1', 'arg2', dataTableArgument, callback]);
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
