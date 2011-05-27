require('../../support/spec_helper');

describe("Cucumber.Ast.Scenario", function() {
  var Cucumber = require('cucumber');
  var stepCollection, steps;
  var scenario, keyword, name, lastStep;
  
  beforeEach(function() {
    keyword        = createSpy("Feature keyword");
    name           = createSpy("Feature name");
    lastStep       = createSpy("Last step");
    stepCollection = createSpy("Step collection");
    spyOnStub(stepCollection, 'add');
    spyOnStub(stepCollection, 'getLast').andReturn(lastStep);
    spyOnStub(stepCollection, 'forEach');
    spyOn(Cucumber.Types, 'Collection').andReturn(stepCollection);
    scenario = Cucumber.Ast.Scenario(keyword, name);
  });
  
  describe("constructor", function() {
    it("creates a new collection to store steps", function() {
      expect(Cucumber.Types.Collection).toHaveBeenCalled();
    });
  });

  describe("getKeyword()", function() {
    it("returns the keyword of the scenario", function() {
      expect(scenario.getKeyword()).toBe(keyword);
    });
  });

  describe("getName()", function() {
    it("returns the name of the scenario", function() {
      expect(scenario.getName()).toBe(name);
    });
  });
  
  describe("addStep()", function() {
    it("adds the step to the steps (collection)", function() {
      var step = createSpy("Step AST element");
      scenario.addStep(step);
      expect(stepCollection.add).toHaveBeenCalledWith(step);
    });
  });

  describe("getLastStep()", function() {
    it("gets the last step from the collection", function() {
      scenario.getLastStep();
      expect(stepCollection.getLast).toHaveBeenCalled();
    });

    it("returns that last step from the collection", function() {
      expect(scenario.getLastStep()).toBe(lastStep);
    });
  });

  describe("acceptVisitor", function() {
    var visitor, callback;

    beforeEach(function() {
      visitor  = createSpyWithStubs("Visitor", {visitStep: null});
      callback = createSpy("Callback");
    });
    
    it ("iterates over the steps with a user function and the callback", function() {
      scenario.acceptVisitor(visitor, callback);
      expect(stepCollection.forEach).toHaveBeenCalled();
      expect(stepCollection.forEach).toHaveBeenCalledWithAFunctionAsNthParameter(1);
      expect(stepCollection.forEach).toHaveBeenCalledWithValueAsNthParameter(callback, 2);
    });

    describe("for each step", function() {
      var userFunction, step, forEachCallback;

      beforeEach(function() {
        scenario.acceptVisitor(visitor, callback);
        userFunction    = stepCollection.forEach.mostRecentCall.args[0];
        step            = createSpy("A step from the collection");
        forEachCallback = createSpy("forEach() callback");
      });

      it("tells the visitor to visit the step and call back when finished", function() {
        userFunction(step, forEachCallback);
        expect(visitor.visitStep).toHaveBeenCalledWith(step, forEachCallback);
      });
    });
  });
});
