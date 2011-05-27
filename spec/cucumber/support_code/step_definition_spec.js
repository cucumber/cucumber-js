require('../../support/spec_helper');

describe("Cucumber.SupportCode.StepDefinition", function() {
  var Cucumber = require('cucumber');
  var stepDefinition, stepRegexp, stepCode;
  
  beforeEach(function() {
    stepRegexp     = createSpyWithStubs("Step regexp", {test:null});
    stepCode       = createSpy("Step code");
    stepDefinition = Cucumber.SupportCode.StepDefinition(stepRegexp, stepCode);
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
    var stepName, pyString, callback;
    var parameters;
    
    beforeEach(function() {
      stepName   = createSpy("Step name to match");
      pyString   = createSpy("Step PY string");
      callback   = createSpy("Callback");
      parameters = createSpy("Code execution parameters");
      spyOn(stepDefinition, 'buildInvocationParameters').andReturn(parameters);
      spyOn(stepCode, 'apply');
    });

    it("builds the step invocation parameters", function() {
      stepDefinition.invoke(stepName, pyString, callback);
      expect(stepDefinition.buildInvocationParameters).toHaveBeenCalled();
      expect(stepDefinition.buildInvocationParameters).toHaveBeenCalledWithValueAsNthParameter(stepName, 1);
      expect(stepDefinition.buildInvocationParameters).toHaveBeenCalledWithValueAsNthParameter(pyString, 2);
      expect(stepDefinition.buildInvocationParameters).toHaveBeenCalledWithAFunctionAsNthParameter(3);
    });

    it("calls the step code with the parameters", function() {
      stepDefinition.invoke(stepName, pyString, callback);
      expect(stepCode.apply).toHaveBeenCalledWith(undefined, parameters);
    });

    describe("when the step code has finished executing", function() {
      var codeExecutionCallback;
      var stepResult;

      beforeEach(function() {
        stepDefinition.invoke(stepName, pyString, callback);
        codeExecutionCallback = stepDefinition.buildInvocationParameters.mostRecentCall.args[2];
        stepResult = createSpy("Step result");
        spyOn(Cucumber.Runtime, 'StepResult').andReturn(stepResult);
      });

      it("creates a new step result AST element", function() {
        codeExecutionCallback();
        expect(Cucumber.Runtime.StepResult).toHaveBeenCalledWith(true);
      });

      it("calls back", function() {
        codeExecutionCallback();
        expect(callback).toHaveBeenCalledWith(stepResult);
      });
    });
  });

  describe("buildInvocationParameters()", function() {
    var stepName, pyString, pyStringString;
    var matches, callback;

    beforeEach(function() {
      stepName       = createSpy("Step name to match");
      pyStringString = createSpy("PY string string");
      pyString       = createSpyWithStubs("Step PY string", {getString:pyStringString});
      matches        = createSpyWithStubs("Matches", {shift:null, push:null});
      callback       = createSpy("Callback");
      spyOnStub(stepRegexp, 'exec').andReturn(matches);
    });

    it("executes the step regexp against the step name", function() {
      stepDefinition.buildInvocationParameters(stepName, pyString, callback);
      expect(stepRegexp.exec).toHaveBeenCalledWith(stepName);
    });

    it("removes the whole matched string of the regexp result array (to only keep matching groups)", function() {
      stepDefinition.buildInvocationParameters(stepName, pyString, callback);
      expect(matches.shift).toHaveBeenCalled();
    });

    describe("when a pyString is present", function() {
      it("gets the PY string's string", function() {
        stepDefinition.buildInvocationParameters(stepName, pyString, callback);
        expect(pyString.getString).toHaveBeenCalled();
      });

      it("adds the string to the parameter array", function() {
        stepDefinition.buildInvocationParameters(stepName, pyString, callback);
        expect(matches.push).toHaveBeenCalledWith(pyStringString);
      });
    });

    describe("when no pyString is present", function() {
      it("does not add the string to the parameter array", function() {
        pyString = undefined;
        stepDefinition.buildInvocationParameters(stepName, pyString, callback);
        expect(matches.push).not.toHaveBeenCalledWith(undefined);
      });
    });

    it("adds the callback to the parameter array", function() {
      stepDefinition.buildInvocationParameters(stepName, pyString, callback);
      expect(matches.push).toHaveBeenCalledWith(callback);
    });

    it("returns the parameters", function() {
      expect(stepDefinition.buildInvocationParameters(stepName, pyString, callback)).toBe(matches);
    });
  });
});
