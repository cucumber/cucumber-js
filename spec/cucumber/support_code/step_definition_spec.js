require('../../support/spec_helper');

describe("Cucumber.SupportCode.StepDefinition", function () {
  var Cucumber = requireLib('cucumber');
  var stepDefinition, pattern, stepDefinitionCode;

  beforeEach(function () {
    pattern            = createSpyWithStubs("pattern", {test: null});
    stepDefinitionCode = createSpy("step definition code");
    spyOn(global, 'RegExp');
    stepDefinition = Cucumber.SupportCode.StepDefinition(pattern, stepDefinitionCode);
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
        spyOnStub(pattern, 'replace').andReturn(safeString);
        spyOnStub(safeString, 'replace').andReturn(quotedDollarParameterSubstitutedPattern);
        global.RegExp.andReturn(regexp);
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
      spyOn(stepDefinition, 'getPatternRegexp').andReturn(patternRegexp);
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
    var step, world, scenario, stepDomain, callback;
    var parameters, exceptionHandler;
    var timestamp = 0;

    beforeEach(function () {
      step                          = createSpy("step");
      world                         = createSpy("world");
      scenario                      = createSpyWithStubs("scenario", {getAttachments: undefined});
      stepDomain                    = createSpy("stepDomain");
      callback                      = createSpy("callback");
      parameters                    = createSpy("code execution parameters");
      exceptionHandler              = createSpy("exception handler");
      spyOn(Cucumber.Util.Exception, 'registerUncaughtExceptionHandler');
      spyOn(stepDefinition, 'buildCodeCallback').andCallFake(function (codeCallback) { return codeCallback; });
      spyOn(stepDefinition, 'buildInvocationParameters').andReturn(parameters);
      spyOn(stepDefinition, 'buildExceptionHandlerToCodeCallback').andReturn(exceptionHandler);
      spyOn(stepDefinitionCode, 'apply');

      if (process.hrtime) {
        spyOn(process, 'hrtime').andCallFake(function (time) {
          if (time) {
            return [0 - time[0], (timestamp * 1e6) - time[1]];
          }
          else {
            return [0, timestamp * 1e6];
          }
        });
      }
      else {
        spyOn(global, 'Date').andCallFake(function () {
          return {
            getTime: function () {
              return timestamp;
            }
          };
        });
      }
    });

    it("builds the step invocation parameters", function () {
      stepDefinition.invoke(step, world, scenario, stepDomain, callback);
      expect(stepDefinition.buildInvocationParameters).toHaveBeenCalled();
      expect(stepDefinition.buildInvocationParameters).toHaveBeenCalledWithValueAsNthParameter(step, 1);
      expect(stepDefinition.buildInvocationParameters).toHaveBeenCalledWithValueAsNthParameter(scenario, 2);
      expect(stepDefinition.buildInvocationParameters).toHaveBeenCalledWithAFunctionAsNthParameter(3);
    });

    it("builds an exception handler for the code callback", function () {
      stepDefinition.invoke(step, world, scenario, stepDomain, callback);
      expect(stepDefinition.buildExceptionHandlerToCodeCallback).toHaveBeenCalledWithAFunctionAsNthParameter(1);

      var codeExecutionCallbackPassedToParameterBuilder = stepDefinition.buildInvocationParameters.mostRecentCall.args[2];
      var codeExecutionCallbackPassedToExceptionHandlerBuilder = stepDefinition.buildExceptionHandlerToCodeCallback.mostRecentCall.args[0];
      var domainPassedToExceptionHandlerBuilder = stepDefinition.buildExceptionHandlerToCodeCallback.mostRecentCall.args[1];
      expect(codeExecutionCallbackPassedToExceptionHandlerBuilder).toBe(codeExecutionCallbackPassedToParameterBuilder);
      expect(domainPassedToExceptionHandlerBuilder).toBe(stepDomain);
    });

    it("registers the exception handler for uncaught exceptions", function () {
      stepDefinition.invoke(step, world, scenario, stepDomain, callback);
      expect(Cucumber.Util.Exception.registerUncaughtExceptionHandler).toHaveBeenCalledWith(exceptionHandler, stepDomain);
    });

    it("calls the step definition code with the parameters and World as 'this'", function () {
      stepDefinition.invoke(step, world, scenario, stepDomain, callback);
      expect(stepDefinitionCode.apply).toHaveBeenCalledWith(world, parameters);
    });

    it("builds the code callback", function () {
      stepDefinition.invoke(step, world, scenario, stepDomain, callback);
      expect(stepDefinition.buildCodeCallback).toHaveBeenCalled();
      expect(stepDefinition.buildCodeCallback).toHaveBeenCalledWithAFunctionAsNthParameter(1);
    });

    describe("callback used to build the code callback", function () {
      var codeExecutionCallback, successfulStepResult, attachments;

      beforeEach(function () {
        stepDefinition.invoke(step, world, scenario, stepDomain, callback);
        codeExecutionCallback = stepDefinition.buildCodeCallback.mostRecentCall.args[0];
        successfulStepResult  = createSpy("successful step result");
        attachments           = createSpy("attachments");
        spyOn(Cucumber.Runtime, 'SuccessfulStepResult').andReturn(successfulStepResult);
        spyOn(Cucumber.Util.Exception, 'unregisterUncaughtExceptionHandler');
      });

      it("is passed to the step definition code", function () {
        expect(stepDefinition.buildInvocationParameters.mostRecentCall.args[2]).toBe(codeExecutionCallback);
      });

      describe("when called without an error", function () {
        beforeEach(function () {
          timestamp = 1;
          spyOn(codeExecutionCallback, 'fail');
          spyOnStub(scenario, 'getAttachments').andReturn(attachments);
          codeExecutionCallback();
        });

        it("gets the attachments from the scenario", function () {
          expect(scenario.getAttachments).toHaveBeenCalled();
        });

        it("creates a successful step result", function () {
          expect(Cucumber.Runtime.SuccessfulStepResult).toHaveBeenCalledWith({step: step, duration: 1e6, attachments: attachments});
        });

        it("unregisters the exception handler", function () {
          expect(Cucumber.Util.Exception.unregisterUncaughtExceptionHandler).toHaveBeenCalledWith(exceptionHandler, stepDomain);
        });

        it("calls back", function () {
          expect(callback).toHaveBeenCalledWith(successfulStepResult);
        });

        it("does not fail", function () {
          expect(codeExecutionCallback.fail).not.toHaveBeenCalled();
        });

        afterEach(function () {
          timestamp = 0;
        });
      });

      describe("when called with an error", function () {
        var error;

        beforeEach(function () {
          error = createSpy("error");
          spyOn(codeExecutionCallback, 'fail');
          codeExecutionCallback(error);
        });

        it("does not create a successful step result", function () {
          expect(Cucumber.Runtime.SuccessfulStepResult).not.toHaveBeenCalled();
        });

        it("does not unregister the exception handler", function () {
          expect(Cucumber.Util.Exception.unregisterUncaughtExceptionHandler).not.toHaveBeenCalled();
        });

        it("does not call back", function () {
          expect(callback).not.toHaveBeenCalled();
        });

        it("fails", function () {
          expect(codeExecutionCallback.fail).toHaveBeenCalledWith(error);
        });
      });

      it("supplies a function to the step to let it claim its pendingness", function () {
        expect(codeExecutionCallback.pending).toBeAFunction ();
      });

      it("supplies a function to the step to let it fail asynchronously", function () {
        expect(codeExecutionCallback.fail).toBeAFunction ();
      });

      describe("pending()", function () {
        var pendingReason, pendingStepResult;

        beforeEach(function () {
          pendingReason     = createSpy("pending reason");
          pendingStepResult = createSpy("pending step result");
          spyOnStub(scenario, "getAttachments").andReturn(attachments);
          spyOn(Cucumber.Runtime, 'PendingStepResult').andReturn(pendingStepResult);
        });

        it("gets the attachments from the scenario", function () {
          codeExecutionCallback.pending(pendingReason);
          expect(scenario.getAttachments).toHaveBeenCalled();
        });

        it("creates a pending step result", function () {
          codeExecutionCallback.pending(pendingReason);
          expect(Cucumber.Runtime.PendingStepResult).toHaveBeenCalledWith({step: step, pendingReason: pendingReason, attachments: attachments});
        });

        it("unregisters the exception handler", function () {
          codeExecutionCallback.pending(pendingReason);
          expect(Cucumber.Util.Exception.unregisterUncaughtExceptionHandler).toHaveBeenCalledWith(exceptionHandler, stepDomain);
        });

        it("calls back", function () {
          codeExecutionCallback.pending(pendingReason);
          expect(callback).toHaveBeenCalledWith(pendingStepResult);
        });
      });

      describe("fail()", function () {
        var failureReason, failedStepResult;

        beforeEach(function () {
          timestamp = 1;
          failureReason     = createSpy("failure reason");
          failedStepResult  = createSpy("failed step result");
          spyOnStub(scenario, "getAttachments").andReturn(attachments);
          spyOn(Cucumber.Runtime, 'FailedStepResult').andReturn(failedStepResult);
        });

        it("gets the attachments from the scenario", function () {
          codeExecutionCallback.fail(failureReason);
          expect(scenario.getAttachments).toHaveBeenCalled();
        });

        it("creates a failing step result", function () {
          codeExecutionCallback.fail(failureReason);
          expect(Cucumber.Runtime.FailedStepResult).toHaveBeenCalledWith({step: step, failureException: failureReason, duration: 1e6, attachments: attachments});
        });

        describe("when no failure reason is given", function () {
          it("creates a failing step result with a generic step failure exception", function () {
            codeExecutionCallback.fail();
            var payload = Cucumber.Runtime.FailedStepResult.mostRecentCall.args[0];
            expect(payload.step).toBe(step);
            expect(payload.failureException).toBeAnInstanceOf(Error);
          });
        });

        it("unregisters the exception handler", function () {
          codeExecutionCallback.fail(failureReason);
          expect(Cucumber.Util.Exception.unregisterUncaughtExceptionHandler).toHaveBeenCalledWith(exceptionHandler, stepDomain);
        });

        it("calls back", function () {
          codeExecutionCallback.fail(failureReason);
          expect(callback).toHaveBeenCalledWith(failedStepResult);
        });

        afterEach(function () {
          timestamp = 0;
        });
      });
    });

    describe("when the step definition code throws an exception", function () {
      var failureException;

      beforeEach(function () {
        failureException = createSpy("failing step definition exception");
        stepDefinitionCode.apply.andThrow(failureException);
      });

      it("handles the exception with the exception handler", function () {
        stepDefinition.invoke(step, world, scenario, callback);
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
      matches                = createSpyWithStubs("matches", {shift: null, push: null});
      patternRegexp          = createSpyWithStubs("pattern regexp", {test: matches});
      stepAttachmentContents = createSpy("step attachment contents");
      step                   = createSpyWithStubs("step", {hasAttachment: null, getName: stepName, getAttachmentContents: stepAttachmentContents});
      scenario               = createSpy("scenario");
      callback               = createSpy("callback");
      spyOn(stepDefinition, 'getPatternRegexp').andReturn(patternRegexp);
      spyOnStub(patternRegexp, 'exec').andReturn(matches);
    });

    it("gets the step name", function () {
      stepDefinition.buildInvocationParameters(step, scenario, callback);
      expect(step.getName).toHaveBeenCalled();
    });

    it("gets the pattern regexp", function () {
      stepDefinition.buildInvocationParameters(step, scenario, callback);
      expect(stepDefinition.getPatternRegexp).toHaveBeenCalled();
    });

    it("executes the pattern regexp against the step name", function () {
      stepDefinition.buildInvocationParameters(step, scenario, callback);
      expect(patternRegexp.exec).toHaveBeenCalledWith(stepName);
    });

    it("removes the whole matched string of the regexp result array (to only keep matching groups)", function () {
      stepDefinition.buildInvocationParameters(step, scenario, callback);
      expect(matches.shift).toHaveBeenCalled();
    });

    it("checks whether the step has an attachment or not", function () {
      stepDefinition.buildInvocationParameters(step, scenario, callback);
      expect(step.hasAttachment).toHaveBeenCalled();
    });

    describe("when the step has an attachment", function () {
      beforeEach(function () {
        step.hasAttachment.andReturn(true);
      });

      it("gets the attachment contents", function () {
        stepDefinition.buildInvocationParameters(step, scenario, callback);
        expect(step.getAttachmentContents).toHaveBeenCalled();
      });

      it("adds the attachment contents to the parameter array", function () {
        stepDefinition.buildInvocationParameters(step, scenario, callback);
        expect(matches.push).toHaveBeenCalledWith(stepAttachmentContents);
      });
    });

    describe("when the step has no attachment", function () {
      beforeEach(function () {
        step.hasAttachment.andReturn(false);
      });

      it("does not get the attachment contents", function () {
        stepDefinition.buildInvocationParameters(step, scenario, callback);
        expect(step.getAttachmentContents).not.toHaveBeenCalled();
      });

      it("does not add the attachement contents to the parameter array", function () {
        stepDefinition.buildInvocationParameters(step, scenario, callback);
        expect(matches.push).toHaveBeenCalledNTimes(1);
      });
    });

    it("adds the callback to the parameter array", function () {
      stepDefinition.buildInvocationParameters(step, scenario, callback);
      expect(matches.push).toHaveBeenCalledWith(callback);
    });

    it("returns the parameters", function () {
      expect(stepDefinition.buildInvocationParameters(step, scenario, callback)).toBe(matches);
    });
  });

  describe("buildExceptionHandlerToCodeCallback()", function () {
    var codeCallback, exceptionHandler, stepDomain;

    beforeEach(function () {
      codeCallback = createSpyWithStubs("code callback", {fail: null});
      stepDomain = createSpy("step domain");
      exceptionHandler = stepDefinition.buildExceptionHandlerToCodeCallback(codeCallback, stepDomain);
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
        expect(codeCallback.fail).toHaveBeenCalledWith(exception);
      });
    });
  });
});
