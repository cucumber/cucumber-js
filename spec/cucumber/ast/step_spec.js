require('../../support/spec_helper');

describe("Cucumber.Ast.Step", function() {
  var Cucumber = require('cucumber');
  var step, keyword, name, stepLine;
  
  beforeEach(function() {
    name     = createSpy("Step name");
    keyword  = createSpy("Step keyword");
    stepLine = createSpy("Step line");
    pyString = createSpy("PY string AST element");
    step     = Cucumber.Ast.Step(keyword, name, stepLine);
  });
  
  describe("getKeyword()", function() {
    it("returns the keyword of the step", function() {
      expect(step.getKeyword()).toBe(keyword);
    });
  });

  describe("getName()", function() {
    it("returns the name of the step", function() {
      expect(step.getName()).toBe(name);
    });
  });

  describe("hasPyString()", function() {
    it("returns true when a PY string was attached to the step", function() {
      step.attachPyString(pyString);
      expect(step.hasPyString()).toBeTruthy();
    });

    it("returns false when no PY string was attached to the step", function() {
      expect(step.hasPyString()).toBeFalsy();
    });
  });

  describe("getPyString()", function() {
    it("returns the PY string that was attached to the step through attachPyString()", function() {
      step.attachPyString(pyString);
      expect(step.getPyString()).toBe(pyString);
    });
  });

  describe("acceptVisitor()", function() {
    var visitor, callback;
    
    beforeEach(function() {
      visitor  = createSpyWithStubs("Visitor", {visitStepResult: null});
      callback = createSpy("Callback");
      spyOn(step, 'execute');
    });

    it("executes the step with a callback", function() {
      step.acceptVisitor(visitor, callback);
      expect(step.execute).toHaveBeenCalled();
      expect(step.execute).toHaveBeenCalledWithValueAsNthParameter(visitor, 1);
      expect(step.execute).toHaveBeenCalledWithAFunctionAsNthParameter(2);
    });

    describe("after the step was executed", function() {
      var executeCallback;
      var stepResult;

      beforeEach(function() {
        step.acceptVisitor(visitor, callback);
        stepResult = createSpy("Step execution result");
        executeCallback = step.execute.mostRecentCall.args[1];
      });

      it("tells the visitor to visit the step result", function() {
        executeCallback(stepResult);
        expect(visitor.visitStepResult).toHaveBeenCalledWith(stepResult, callback);
      });
    });
  });

  describe("execute()", function() {
    var stepDefinition;
    var visitor, callback;
    
    beforeEach(function() {
      stepDefinition = createSpy("Step definition");
      visitor        = createSpy("Visitor");
      callback       = createSpy("Callback received by execute()");
      spyOnStub(stepDefinition, 'invoke');
      spyOnStub(visitor, 'lookupStepDefinitionByName').andReturn(stepDefinition);
    });
    
    it("looks up the step definition based on the step string", function() {
      step.execute(visitor, callback);
      expect(visitor.lookupStepDefinitionByName).toHaveBeenCalledWith(name);
    });

    it("invokes the step definition with the step name, PY string and the callback", function() {
      var pyString = createSpy("PY string");
      step.attachPyString(pyString);
      step.execute(visitor, callback);
      expect(stepDefinition.invoke).toHaveBeenCalledWith(name, pyString, callback);
    });
  });
});
