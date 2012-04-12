require('../../support/spec_helper');

describe("Cucumber.SupportCode.StepDefinition", function() {
  var Cucumber = requireLib('cucumber');
  var stepDefinition, stepRegexp, stepDefinitionCode;

  beforeEach(function() {
    stepRegexp         = createSpyWithStubs("Step regexp", {test:null});
    stepDefinitionCode = createSpy("step definition code");
    stepDefinition     = Cucumber.SupportCode.StepDefinition(stepRegexp, stepDefinitionCode);
  });

  describe("matchesStepName()", function() {
    var stepName;

    beforeEach(function() {
      stepName = createSpy("Step name to match");
    });

    it("tests the string against the step name", function() {
      stepDefinition.matchesStepName(stepName);
      expect(stepRegexp.test).toHaveBeenCalledWith(stepName);
    });

    it("returns true when the step name matches the step definition regexp", function() {
      stepRegexp.test.andReturn(true);
      expect(stepDefinition.matchesStepName(stepName)).toBeTruthy();
    });

    it("returns false when the step name does not match the step definition regexp", function() {
      stepRegexp.test.andReturn(false);
      expect(stepDefinition.matchesStepName(stepName)).toBeFalsy();
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
        expect(Cucumber.Runtime.SuccessfulStepResult).toHaveBeenCalled();
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
          expect(Cucumber.Runtime.PendingStepResult).toHaveBeenCalledWith(pendingReason);
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
          expect(Cucumber.Runtime.FailedStepResult).toHaveBeenCalledWith(failureReason);
        });

        describe("when no failure reason is given", function() {
          it("creates a failing step result with a generic step failure exception", function() {
            codeExecutionCallback.fail();
            expect(Cucumber.Runtime.FailedStepResult).toHaveBeenCalledWithInstanceOfConstructorAsNthParameter(Error, 1);
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
        expect(Cucumber.Runtime.FailedStepResult).toHaveBeenCalledWith(failureException);
      });

      it("calls back with the step result", function() {
        stepDefinition.invoke(step, world, callback);
        expect(callback).toHaveBeenCalledWith(failedStepResult);
      });
    });
  });

  describe("buildInvocationParameters()", function() {
    var step, stepName, stepAttachment, stepAttachmentContents;
    var matches, callback;

    beforeEach(function() {
      stepName               = createSpy("step name to match");
      stepAttachmentContents = createSpy("step attachment contents");
      step                   = createSpyWithStubs("step", {hasAttachment: null, getName: stepName, getAttachmentContents: stepAttachmentContents});
      matches                = createSpyWithStubs("matches", {shift: null, push: null});
      callback               = createSpy("callback");
      spyOnStub(stepRegexp, 'exec').andReturn(matches);
    });

    it("gets the step name", function() {
      stepDefinition.buildInvocationParameters(step, callback);
      expect(step.getName).toHaveBeenCalled();
    });

    it("executes the step regexp against the step name", function() {
      stepDefinition.buildInvocationParameters(step, callback);
      expect(stepRegexp.exec).toHaveBeenCalledWith(stepName);
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
