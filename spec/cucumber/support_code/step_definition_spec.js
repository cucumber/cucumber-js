require('../../support/spec_helper');

describe("Cucumber.SupportCode.StepDefinition", function() {
  var Cucumber = require('cucumber');
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
    var stepName, world, stepAttachment, callback;
    var parameters;

    beforeEach(function() {
      stepName       = createSpy("step name to match");
      world          = createSpy("world");
      stepAttachment = createSpy("step attachment");
      callback       = createSpy("callback");
      parameters     = createSpy("code execution parameters");
      spyOn(stepDefinition, 'buildInvocationParameters').andReturn(parameters);
      spyOn(stepDefinitionCode, 'apply');
    });

    it("builds the step invocation parameters", function() {
      stepDefinition.invoke(stepName, world, stepAttachment, callback);
      expect(stepDefinition.buildInvocationParameters).toHaveBeenCalled();
      expect(stepDefinition.buildInvocationParameters).toHaveBeenCalledWithValueAsNthParameter(stepName, 1);
      expect(stepDefinition.buildInvocationParameters).toHaveBeenCalledWithValueAsNthParameter(stepAttachment, 2);
      expect(stepDefinition.buildInvocationParameters).toHaveBeenCalledWithAFunctionAsNthParameter(3);
    });

    it("calls the step definition code with the parameters and World as 'this'", function() {
      stepDefinition.invoke(stepName, world, stepAttachment, callback);
      expect(stepDefinitionCode.apply).toHaveBeenCalledWith(world, parameters);
    });

    describe("callback passed to the step definition code", function() {
      var codeExecutionCallback;
      var successfulStepResult;

      beforeEach(function() {
        stepDefinition.invoke(stepName, world, stepAttachment, callback);
        codeExecutionCallback = stepDefinition.buildInvocationParameters.mostRecentCall.args[2];
        successfulStepResult = createSpy("successful step result");
        spyOn(Cucumber.Runtime, 'SuccessfulStepResult').andReturn(successfulStepResult);
      });

      describe("when the step definition code executes successfully and calls back", function() {
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
      });

      describe("pending()", function() {
        var pendingFunction, reason, exception;

        beforeEach(function() {
          reason          = createSpy("a reason for being pending");
          pendingFunction = codeExecutionCallback.pending;
          exception       = createSpy("pending step exception");
          spyOn(Cucumber.Runtime, 'PendingStepException').andReturn(exception);
        });

        it("creates a 'pending step' exception with the reason", function() {
          try { pendingFunction(reason); } catch (e) { }
          expect(Cucumber.Runtime.PendingStepException).toHaveBeenCalledWith(reason);
        });

        it("throws the pending step exception", function() {
          expect(function() { pendingFunction(reason) }).toThrow(exception);
        });
      });
    });

    describe("when the step calls back as pending", function() {
      var pendingReason, exception, pendingStepResult;

      beforeEach(function() {
        pendingReason     = createSpy("a reason for being pending");
        pendingStepResult = createSpy("pending step result");
        exception         = Cucumber.Runtime.PendingStepException(pendingReason);
        stepDefinitionCode.apply.andThrow(exception);
        spyOn(Cucumber.Runtime, 'PendingStepResult').andReturn(pendingStepResult);
        spyOn(Cucumber.Runtime, 'FailedStepResult');
      });

      it("creates a new pending step result", function() {
        stepDefinition.invoke(stepName, world, stepAttachment, callback);
        expect(Cucumber.Runtime.PendingStepResult).toHaveBeenCalled();
      });

      it("does not create a new failed step result", function() {
        stepDefinition.invoke(stepName, world, stepAttachment, callback);
        expect(Cucumber.Runtime.FailedStepResult).not.toHaveBeenCalled();
      });

      it("calls back with the step result", function() {
        stepDefinition.invoke(stepName, world, stepAttachment, callback);
        expect(callback).toHaveBeenCalledWith(pendingStepResult);
      });
    });

    describe("when the step definition code fails", function() {
      var failedStepResult, failureException;

      beforeEach(function() {
        failureException = createSpy("I am a failing step definition");
        failedStepResult = createSpy("failed step result");
        stepDefinitionCode.apply.andThrow(failureException);
        spyOn(Cucumber.Runtime, 'FailedStepResult').andReturn(failedStepResult);
        spyOn(Cucumber.Runtime, 'PendingStepResult');
      });

      it("creates a new failed step result", function() {
        stepDefinition.invoke(stepName, world, stepAttachment, callback);
        expect(Cucumber.Runtime.FailedStepResult).toHaveBeenCalledWith(failureException);
      });

      it("does not create a new pending step result", function() {
        stepDefinition.invoke(stepName, world, stepAttachment, callback);
        expect(Cucumber.Runtime.PendingStepResult).not.toHaveBeenCalled();
      });

      it("calls back with the step result", function() {
        stepDefinition.invoke(stepName, world, stepAttachment, callback);
        expect(callback).toHaveBeenCalledWith(failedStepResult);
      });
    });
  });

  describe("buildInvocationParameters()", function() {
    var stepName, stepAttachment, stepAttachmentContents;
    var matches, callback;

    beforeEach(function() {
      stepName             = createSpy("step name to match");
      stepAttachmentContents = createSpy("step attachment contents");
      stepAttachment       = createSpyWithStubs("step attachment", {getContents: stepAttachmentContents});
      matches              = createSpyWithStubs("matches", {shift: null, push: null});
      callback             = createSpy("callback");
      spyOnStub(stepRegexp, 'exec').andReturn(matches);
    });

    it("executes the step regexp against the step name", function() {
      stepDefinition.buildInvocationParameters(stepName, stepAttachment, callback);
      expect(stepRegexp.exec).toHaveBeenCalledWith(stepName);
    });

    it("removes the whole matched string of the regexp result array (to only keep matching groups)", function() {
      stepDefinition.buildInvocationParameters(stepName, stepAttachment, callback);
      expect(matches.shift).toHaveBeenCalled();
    });

    describe("when a step attachment is present", function() {
      it("gets the attachment's value", function() {
        stepDefinition.buildInvocationParameters(stepName, stepAttachment, callback);
        expect(stepAttachment.getContents).toHaveBeenCalled();
      });

      it("adds the attachment contents to the parameter array", function() {
        stepDefinition.buildInvocationParameters(stepName, stepAttachment, callback);
        expect(matches.push).toHaveBeenCalledWith(stepAttachmentContents);
      });
    });

    describe("when no step attachment is present", function() {
      it("does not add the attachment contents to the parameter array", function() {
        stepAttachment = undefined;
        stepDefinition.buildInvocationParameters(stepName, stepAttachment, callback);
        expect(matches.push).not.toHaveBeenCalledWith(undefined);
      });
    });

    it("adds the callback to the parameter array", function() {
      stepDefinition.buildInvocationParameters(stepName, stepAttachment, callback);
      expect(matches.push).toHaveBeenCalledWith(callback);
    });

    it("returns the parameters", function() {
      expect(stepDefinition.buildInvocationParameters(stepName, stepAttachment, callback)).toBe(matches);
    });
  });
});
