require('../../support/spec_helper');

describe("Cucumber.Ast.Step", function() {
  var Cucumber = require('cucumber');
  var step, keyword, name, line;

  beforeEach(function() {
    name      = createSpy("Step name");
    keyword   = createSpy("Step keyword");
    line      = createSpy("Step line");
    docString = createSpy("DocString AST element");
    step      = Cucumber.Ast.Step(keyword, name, line);
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

  describe("getLine()", function() {
    it("returns the line number on which the step lies", function() {
      expect(step.getLine()).toBe(line);
    });
  });

  describe("hasDocString()", function() {
    it("returns true when a DocString was attached to the step", function() {
      step.attachDocString(docString);
      expect(step.hasDocString()).toBeTruthy();
    });

    it("returns false when no DocString was attached to the step", function() {
      expect(step.hasDocString()).toBeFalsy();
    });
  });

  describe("getDocString()", function() {
    it("returns the DocString that was attached to the step through attachDocString()", function() {
      step.attachDocString(docString);
      expect(step.getDocString()).toBe(docString);
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
    var stepDefinition, world;
    var visitor, callback;

    beforeEach(function() {
      stepDefinition = createSpy("step definition");
      world          = createSpy("world");
      visitor        = createSpy("visitor");
      callback       = createSpy("callback received by execute()");
      spyOnStub(stepDefinition, 'invoke');
      spyOnStub(visitor, 'lookupStepDefinitionByName').andReturn(stepDefinition);
      spyOnStub(visitor, 'getWorld').andReturn(world);
    });

    it("looks up the step definition based on the step string", function() {
      step.execute(visitor, callback);
      expect(visitor.lookupStepDefinitionByName).toHaveBeenCalledWith(name);
    });

    it("gets the current World instance", function() {
      step.execute(visitor, callback);
      expect(visitor.getWorld).toHaveBeenCalled();
    });

    it("invokes the step definition with the step name, world, DocString and the callback", function() {
      var docString = createSpy("DocString");
      step.attachDocString(docString);
      step.execute(visitor, callback);
      expect(stepDefinition.invoke).toHaveBeenCalledWith(name, world, docString, callback);
    });
  });
});
