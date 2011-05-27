require('../../support/spec_helper');

describe("Cucumber.Ast.Feature", function() {
  var Cucumber = require('cucumber');
  var scenarioCollection, lastScenario;
  var feature, keyword, name;

  beforeEach(function() {
    lastScenario = createSpy("Last scenario");
    scenarioCollection = [createSpy("first scenario"), createSpy("second scenario")];
    spyOnStub(scenarioCollection, 'add');
    spyOnStub(scenarioCollection, 'getLast').andReturn(lastScenario);
    spyOnStub(scenarioCollection, 'forEach');
    spyOn(Cucumber.Types, 'Collection').andReturn(scenarioCollection);
    keyword     = createSpy("Feature keyword");
    name        = createSpy("Feature name");
    description = createSpy("Feature description");
    feature     = Cucumber.Ast.Feature(keyword, name, description);
  });

  describe("constructor", function() {
    it("creates a new collection to store scenarios", function() {
      expect(Cucumber.Types.Collection).toHaveBeenCalled();
    });
  });

  describe("getKeyword()", function() {
    it("returns the keyword of the feature", function() {
      expect(feature.getKeyword()).toBe(keyword);
    });
  });

  describe("getName()", function() {
    it("returns the name of the feature", function() {
      expect(feature.getName()).toBe(name);
    });
  });

  describe("getDescription()", function() {
    it("returns the description of the feature", function() {
      expect(feature.getDescription()).toBe(description);
    });
  });
  
  describe("addScenario()", function() {
    it("adds the scenario to the scenarios (collection)", function() {
      var scenario = createSpy("scenario AST element");
      feature.addScenario(scenario);
      expect(scenarioCollection.add).toHaveBeenCalledWith(scenario);
    });
  });

  describe("getLastScenario()", function() {
    it("gets the last scenario from the collection", function() {
      feature.getLastScenario();
      expect(scenarioCollection.getLast).toHaveBeenCalled();
    });

    it("returns the last scenario", function() {
      expect(feature.getLastScenario()).toBe(lastScenario);
    });
  });

  describe("acceptVisitor", function() {
    var visitor, callback;

    beforeEach(function() {
      visitor  = createSpyWithStubs("Visitor", {visitScenario: null});
      callback = createSpy("Callback");
    });
    
    it ("iterates over the scenarios with a user function and the callback", function() {
      feature.acceptVisitor(visitor, callback);
      expect(scenarioCollection.forEach).toHaveBeenCalled();
      expect(scenarioCollection.forEach).toHaveBeenCalledWithAFunctionAsNthParameter(1);
      expect(scenarioCollection.forEach).toHaveBeenCalledWithValueAsNthParameter(callback, 2);
    });

    describe("for each scenario", function() {
      var userFunction, scenario, forEachCallback;

      beforeEach(function() {
        feature.acceptVisitor(visitor, callback);
        userFunction    = scenarioCollection.forEach.mostRecentCall.args[0];
        scenario        = createSpy("A scenario from the collection");
        forEachCallback = createSpy("forEach() callback");
      });

      it("tells the visitor to visit the scenario and call back when finished", function() {
        userFunction(scenario, forEachCallback);
        expect(visitor.visitScenario).toHaveBeenCalledWith(scenario, forEachCallback);
      });
    });
  });
});
