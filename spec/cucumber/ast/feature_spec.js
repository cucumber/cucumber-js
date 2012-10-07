require('../../support/spec_helper');

describe("Cucumber.Ast.Feature", function () {
  var Cucumber = requireLib('cucumber');
  var scenarioCollection, lastScenario;
  var feature, keyword, name, uri, line;

  beforeEach(function () {
    lastScenario = createSpy("Last scenario");
    scenarioCollection = new Object(); // bare objects because we need .length
                                       // which is not available on jasmine spies
    spyOnStub(scenarioCollection, 'add');
    spyOnStub(scenarioCollection, 'getLast').andReturn(lastScenario);
    spyOnStub(scenarioCollection, 'forEach');
    spyOn(Cucumber.Type, 'Collection').andReturn(scenarioCollection);
    keyword     = createSpy("keyword");
    name        = createSpy("name");
    description = createSpy("description");
    uri         = createSpy("uri");
    line        = createSpy("line number");
    feature     = Cucumber.Ast.Feature(keyword, name, description, uri, line);
  });

  describe("constructor", function () {
    it("creates a new collection to store scenarios", function () {
      expect(Cucumber.Type.Collection).toHaveBeenCalled();
    });
  });

  describe("getKeyword()", function () {
    it("returns the keyword of the feature", function () {
      expect(feature.getKeyword()).toBe(keyword);
    });
  });

  describe("getName()", function () {
    it("returns the name of the feature", function () {
      expect(feature.getName()).toBe(name);
    });
  });

  describe("getDescription()", function () {
    it("returns the description of the feature", function () {
      expect(feature.getDescription()).toBe(description);
    });
  });

  describe("getUri()", function () {
    it("returns the URI of the feature", function () {
      expect(feature.getUri()).toBe(uri);
    });
  });

  describe("getLine()", function () {
    it("returns the line number on which the feature starts", function () {
      expect(feature.getLine()).toBe(line);
    });
  });

  describe("getBackground() [addBackground()]", function () {
    describe("when a background was previously added", function () {
      var background;

      beforeEach(function () {
        background = createSpy("background");
        feature.addBackground(background);
      });

      it("returns the background", function () {
        expect(feature.getBackground()).toBe(background);
      });
    });

    describe("when no background was previousyly added", function () {
      it("returns nothing", function () {
        expect(feature.getBackground()).toBeUndefined();
      })
    });
  });

  describe("hasBackground()", function () {
    it("returns true when a background was added", function () {
      var background = createSpy("background");
      feature.addBackground(background);
      expect(feature.hasBackground()).toBeTruthy();
    });

    it("returns false when no background was added", function () {
      expect(feature.hasBackground()).toBeFalsy();
    });
  });

  describe("addScenario()", function () {
    var scenario, background;

    beforeEach(function () {
      scenario  = createSpyWithStubs("scenario AST element", {setBackground: null});
      background = createSpy("scenario background");
      spyOn(feature, 'getBackground').andReturn(background);
    });

    it("gets the background", function () {
      feature.addScenario(scenario);
      expect(feature.getBackground).toHaveBeenCalled();
    });

    it("sets the background on the scenario", function () {
      feature.addScenario(scenario);
      expect(scenario.setBackground).toHaveBeenCalledWith(background);
    });

    it("adds the scenario to the scenarios (collection)", function () {
      feature.addScenario(scenario);
      expect(scenarioCollection.add).toHaveBeenCalledWith(scenario);
    });
  });

  describe("getLastScenario()", function () {
    it("gets the last scenario from the collection", function () {
      feature.getLastScenario();
      expect(scenarioCollection.getLast).toHaveBeenCalled();
    });

    it("returns the last scenario", function () {
      expect(feature.getLastScenario()).toBe(lastScenario);
    });
  });

  describe("hasScenarios()", function () {
    beforeEach(function () {
      spyOnStub(scenarioCollection, 'length');
    });

    it("gets the number of scenarios", function () {
      feature.hasScenarios();
      expect(scenarioCollection.length).toHaveBeenCalled();
    });

    it("is falsy when there are 0 scenarios", function () {
      scenarioCollection.length.andReturn(0);
      expect(feature.hasScenarios()).toBeFalsy();
    });

    it("is truthy when there is 1 scenario", function () {
      scenarioCollection.length.andReturn(1);
      expect(feature.hasScenarios()).toBeTruthy();
    });

    it("is truthy when there are more than 1 scenarios", function () {
      scenarioCollection.length.andReturn(2);
      expect(feature.hasScenarios()).toBeTruthy();
    });
  });

  describe("getTags() [addTags()]", function () {
    it("returns an empty set when no tags were added", function () {
      expect(feature.getTags()).toEqual([]);
    });

    it("returns the tags", function () {
      var tag1 = createSpy("tag 1");
      var tag2 = createSpy("tag 2");
      var tag3 = createSpy("tag 3");
      feature.addTags([tag1, tag2]);
      feature.addTags([tag3]);
      expect(feature.getTags()).toEqual([tag1, tag2, tag3]);
    });
  });

  describe("acceptVisitor", function () {
    var visitor, callback;

    beforeEach(function () {
      visitor  = createSpyWithStubs("visitor", {visitStep: null});
      callback = createSpy("callback");
      spyOn(feature, 'instructVisitorToVisitBackground');
      spyOn(feature, 'instructVisitorToVisitScenarios');
    });

    it("instructs the visitor to visit the feature background", function () {
      feature.acceptVisitor(visitor, callback);
      expect(feature.instructVisitorToVisitBackground).toHaveBeenCalledWithValueAsNthParameter(visitor, 1);
      expect(feature.instructVisitorToVisitBackground).toHaveBeenCalledWithAFunctionAsNthParameter(2);
    });

    describe("when the visitor has finished visiting the background", function () {
      var featureStepsVisitCallback;

      beforeEach(function () {
        feature.acceptVisitor(visitor, callback);
        featureStepsVisitCallback = feature.instructVisitorToVisitBackground.mostRecentCall.args[1];
      });

      it("instructs the visitor to visit the feature steps", function () {
        featureStepsVisitCallback();
        expect(feature.instructVisitorToVisitScenarios).toHaveBeenCalledWith(visitor, callback);
      });
    });
  });

  describe("instructVisitorToVisitBackground()", function () {
    var visitor, callback;

    beforeEach(function () {
      visitor  = createSpyWithStubs("visitor", {visitBackground: undefined});
      callback = createSpy("callback");
      spyOn(feature, 'hasBackground');
    });

    it("checks whether the feature has a background", function () {
      feature.instructVisitorToVisitBackground(visitor, callback);
      expect(feature.hasBackground).toHaveBeenCalled();
    });

    describe("when there is a background", function () {
      var background;

      beforeEach(function () {
        background = createSpy("background");
        feature.hasBackground.andReturn(true);
        spyOn(feature, 'getBackground').andReturn(background);
      });

      it("gets the background", function () {
        feature.instructVisitorToVisitBackground(visitor, callback);
        expect(feature.getBackground).toHaveBeenCalled();
      });

      it("instructs the visitor to visit the background", function () {
        feature.instructVisitorToVisitBackground(visitor, callback);
        expect(visitor.visitBackground).toHaveBeenCalledWith(background, callback);
      });

      it("does not call back", function () {
        feature.instructVisitorToVisitBackground(visitor, callback);
        expect(callback).not.toHaveBeenCalled();
      });
    });

    describe("when there is no background", function () {
      beforeEach(function () {
        feature.hasBackground.andReturn(false);
      });

      it("calls back", function () {
        feature.instructVisitorToVisitBackground(visitor, callback);
        expect(callback).toHaveBeenCalled();
      });
    });
  });

  describe("instructVisitorToVisitScenarios()", function () {
    var visitor, callback;

    beforeEach(function () {
      visitor  = createSpyWithStubs("Visitor", {visitScenario: null});
      callback = createSpy("Callback");
    });

    it ("iterates over the scenarios with a user function and the callback", function () {
      feature.instructVisitorToVisitScenarios(visitor, callback);
      expect(scenarioCollection.forEach).toHaveBeenCalled();
      expect(scenarioCollection.forEach).toHaveBeenCalledWithAFunctionAsNthParameter(1);
      expect(scenarioCollection.forEach).toHaveBeenCalledWithValueAsNthParameter(callback, 2);
    });

    describe("for each scenario", function () {
      var userFunction, scenario, forEachCallback;

      beforeEach(function () {
        feature.instructVisitorToVisitScenarios(visitor, callback);
        userFunction    = scenarioCollection.forEach.mostRecentCall.args[0];
        scenario        = createSpy("A scenario from the collection");
        forEachCallback = createSpy("forEach() callback");
      });

      it("tells the visitor to visit the scenario and call back when finished", function () {
        userFunction (scenario, forEachCallback);
        expect(visitor.visitScenario).toHaveBeenCalledWith(scenario, forEachCallback);
      });
    });
  });
});
