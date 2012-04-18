require('../../support/spec_helper');

describe("Cucumber.SupportCode.StepDefinition", function() {
  var Cucumber = requireLib('cucumber');
  var stepDefinition, pattern, stepDefinitionCode;

  beforeEach(function() {
    pattern            = createSpyWithStubs("pattern", {test: null});
    stepDefinitionCode = createSpy("step definition code");
    stepDefinition     = Cucumber.SupportCode.StepDefinition(pattern, stepDefinitionCode);
    spyOn(global, 'RegExp');
  });

  describe("getPatternRegexp()", function() {
    describe("when the pattern is a RegExp", function() {
      it("does not instantiate a RegExp", function() {
        expect(global.RegExp).not.toHaveBeenCalled();
      });

      it("returns the pattern itself", function() {
        expect(stepDefinition.getPatternRegexp()).toBe(pattern);
      });
    });

    describe("when the pattern is a String", function() {
      var regexp, quotedDollarParameterSubstitutedPattern, regexpString;

      beforeEach(function() {
        regexp                                  = createSpy("regexp");
        regexpString                            = createSpy("regexp string");
        quotedDollarParameterSubstitutedPattern = createSpyWithStubs("quoted dollar param substituted pattern", {replace: regexpString});
        spyOnStub(pattern, 'replace').andReturn(quotedDollarParameterSubstitutedPattern);
        global.RegExp.andReturn(regexp);
      });

      it("replaces quoted dollar-prefixed parameters with the regexp equivalent", function() {
        stepDefinition.getPatternRegexp();
        expect(pattern.replace).toHaveBeenCalledWith(Cucumber.SupportCode.StepDefinition.QUOTED_DOLLAR_PARAMETER_REGEXP, Cucumber.SupportCode.StepDefinition.QUOTED_DOLLAR_PARAMETER_SUBSTITUTION);
      });

      it("replaces other dollar-prefixed parameter with the regexp equivalent", function() {
        stepDefinition.getPatternRegexp();
        expect(quotedDollarParameterSubstitutedPattern.replace).toHaveBeenCalledWith(Cucumber.SupportCode.StepDefinition.DOLLAR_PARAMETER_REGEXP, Cucumber.SupportCode.StepDefinition.DOLLAR_PARAMETER_SUBSTITUTION);
      });

      it("instantiates a new RegExp", function() {
        stepDefinition.getPatternRegexp();
        expect(global.RegExp).toHaveBeenCalledWith(regexpString);
      });

      it("returns the new RegExp", function() {
        expect(stepDefinition.getPatternRegexp()).toBe(regexp);
      });
    });
  });

  describe("matchesStepName()", function() {
    var patternRegexp, stepName;

    beforeEach(function() {
      stepName      = createSpy("step name");
      matchResult   = createSpy("step match result (boolean)");
      patternRegexp = createSpyWithStubs("pattern regexp", {test: matchResult});
      spyOn(stepDefinition, 'getPatternRegexp').andReturn(patternRegexp);
    });

    it("gets the pattern regexp", function(){
      stepDefinition.matchesStepName(stepName);
      expect(stepDefinition.getPatternRegexp).toHaveBeenCalled();
    });

    it("tests the string against the step name", function() {
      stepDefinition.matchesStepName(stepName);
      expect(patternRegexp.test).toHaveBeenCalledWith(stepName);
    });

    it("returns the match result", function() {
      expect(stepDefinition.matchesStepName(stepName)).toBe(matchResult);
    });
  });

  describe("invoke()", function() {
    var step, world, callback;
    var parameters;

    beforeEach(function() {
      step           = createSpy("step");
      world          = createSpy("world");
      callback       = createSpy("callback");
      parameters     = createSpy("code execution parameters");
      spyOn(stepDefinition, 'buildInvocationParameters').andReturn(parameters);
      spyOn(stepDefinitionCode, 'apply');
    });

    it("builds the step invocation parameters", function() {
      stepDefinition.invoke(step, world, callback);
      expect(stepDefinition.buildInvocationParameters).toHaveBeenCalled();
      expect(stepDefinition.buildInvocationParameters).toHaveBeenCalledWithValueAsNthParameter(step, 1);
      expect(stepDefinition.buildInvocationParameters).toHaveBeenCalledWithAFunctionAsNthParameter(2);
    });

    it("calls the step definition code with the parameters and World as 'this'", function() {
      stepDefinition.invoke(step, world, callback);
      expect(stepDefinitionCode.apply).toHaveBeenCalledWith(world, parameters);
    });

    describe("callback passed to the step definition code", function() {
      var codeExecutionCallback;
      var successfulStepResult;

      beforeEach(function() {
        stepDefinition.invoke(step, world, callback);
        codeExecutionCallback = stepDefinition.buildInvocationParameters.mostRecentCall.args[1];
        successfulStepResult = createSpy("successful step result");
        spyOn(Cucumber.Runtime, 'SuccessfulStepResult').andReturn(successfulStepResult);
      });

      it("creates a successful step result", function() {
        codeExecutionCallback();
        expect(Cucumber.Runtime.SuccessfulStepResult).toHaveBeenCalledWith({step: step});
      });

      it("calls back", function() {
        codeExecutionCallback();
        expect(callback).toHaveBeenCalledWith(successfulStepResult);
      });

      it("supplies a function to the step to let it claim its pendingness", function() {
        expect(codeExecutionCallback.pending).toBeAFunction();
      });

      it("supplies a function to the step to let it fail asynchronously", function() {
        expect(codeExecutionCallback.fail).toBeAFunction();
      });

      describe("pending()", function() {
        var pendingReason, pendingStepResult;

        beforeEach(function() {
          pendingReason     = createSpy("pending reason");
          pendingStepResult = createSpy("pending step result");
          spyOn(Cucumber.Runtime, 'PendingStepResult').andReturn(pendingStepResult);
        });

        it("creates a pending step result", function() {
          codeExecutionCallback.pending(pendingReason);
          expect(Cucumber.Runtime.PendingStepResult).toHaveBeenCalledWith({step: step, pendingReason: pendingReason});
        });

        it("calls back", function() {
          codeExecutionCallback.pending(pendingReason);
          expect(callback).toHaveBeenCalledWith(pendingStepResult);
        });
      });

      describe("fail()", function() {
        var failureReason, failedStepResult;

        beforeEach(function() {
          failureReason     = createSpy("failure reason");
          failedStepResult  = createSpy("failed step result");
          spyOn(Cucumber.Runtime, 'FailedStepResult').andReturn(failedStepResult);
        });

        it("creates a failing step result", function() {
          codeExecutionCallback.fail(failureReason);
          expect(Cucumber.Runtime.FailedStepResult).toHaveBeenCalledWith({step: step, failureException: failureReason});
        });

        describe("when no failure reason is given", function() {
          it("creates a failing step result with a generic step failure exception", function() {
            codeExecutionCallback.fail();
            var payload = Cucumber.Runtime.FailedStepResult.mostRecentCall.args[0];
            expect(payload.step).toBe(step);
            expect(payload.failureException).toBeAnInstanceOf(Error);
          });
        });

        it("calls back", function() {
          codeExecutionCallback.fail(failureReason);
          expect(callback).toHaveBeenCalledWith(failedStepResult);
        });
      });
    });

    describe("when the step definition code throws an exception", function() {
      var failedStepResult, failureException;

      beforeEach(function() {
        failureException = createSpy("I am a failing step definition");
        failedStepResult = createSpy("failed step result");
        stepDefinitionCode.apply.andThrow(failureException);
        spyOn(Cucumber.Runtime, 'FailedStepResult').andReturn(failedStepResult);
      });

      it("creates a new failed step result", function() {
        stepDefinition.invoke(step, world, callback);
        expect(Cucumber.Runtime.FailedStepResult).toHaveBeenCalledWith({step: step, failureException: failureException});
      });

      it("calls back with the step result", function() {
        stepDefinition.invoke(step, world, callback);
        expect(callback).toHaveBeenCalledWith(failedStepResult);
      });
    });
  });

  describe("buildInvocationParameters()", function() {
    var patternRegexp, step, stepName, stepAttachment, stepAttachmentContents;
    var matches, callback;

    beforeEach(function() {
      stepName               = createSpy("step name to match");
      matches                = createSpyWithStubs("matches", {shift: null, push: null});
      patternRegexp          = createSpyWithStubs("pattern regexp", {test: matches});
      stepAttachmentContents = createSpy("step attachment contents");
      step                   = createSpyWithStubs("step", {hasAttachment: null, getName: stepName, getAttachmentContents: stepAttachmentContents});
      callback               = createSpy("callback");
      spyOn(stepDefinition, 'getPatternRegexp').andReturn(patternRegexp);
      spyOnStub(patternRegexp, 'exec').andReturn(matches);
    });

    it("gets the step name", function() {
      stepDefinition.buildInvocationParameters(step, callback);
      expect(step.getName).toHaveBeenCalled();
    });

    it("gets the pattern regexp", function() {
      stepDefinition.buildInvocationParameters(step, callback);
      expect(stepDefinition.getPatternRegexp).toHaveBeenCalled();
    });

    it("executes the pattern regexp against the step name", function() {
      stepDefinition.buildInvocationParameters(step, callback);
      expect(patternRegexp.exec).toHaveBeenCalledWith(stepName);
    });

    it("removes the whole matched string of the regexp result array (to only keep matching groups)", function() {
      stepDefinition.buildInvocationParameters(step, callback);
      expect(matches.shift).toHaveBeenCalled();
    });

    it("checks wether the step has an attachment or not", function() {
      stepDefinition.buildInvocationParameters(step, callback);
      expect(step.hasAttachment).toHaveBeenCalled();
    });

    describe("when the step has an attachment", function() {
      beforeEach(function() {
        step.hasAttachment.andReturn(true);
      });

      it("gets the attachment contents", function() {
        stepDefinition.buildInvocationParameters(step, callback);
        expect(step.getAttachmentContents).toHaveBeenCalled();
      });

      it("adds the attachment contents to the parameter array", function() {
        stepDefinition.buildInvocationParameters(step, callback);
        expect(matches.push).toHaveBeenCalledWith(stepAttachmentContents);
      });
    });

    describe("when the step has no attachment", function() {
      beforeEach(function() {
        step.hasAttachment.andReturn(false);
      });

      it("does not get the attachment contents", function() {
        stepDefinition.buildInvocationParameters(step, callback);
        expect(step.getAttachmentContents).not.toHaveBeenCalled();
      });

      it("does not add the attachement contents to the parameter array", function() {
        stepDefinition.buildInvocationParameters(step, callback);
        expect(matches.push.callCount).toBe(1);
      });
    });

    it("adds the callback to the parameter array", function() {
      stepDefinition.buildInvocationParameters(step, callback);
      expect(matches.push).toHaveBeenCalledWith(callback);
    });

    it("returns the parameters", function() {
      expect(stepDefinition.buildInvocationParameters(step, callback)).toBe(matches);
    });
  });
});
