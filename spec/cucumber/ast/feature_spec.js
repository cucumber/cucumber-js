require('../../support/spec_helper');

describe("Cucumber.Ast.Feature", function () {
  var Cucumber = requireLib('cucumber');
  var scenarioCollection, lastScenario;
  var feature, keyword, name, description, uri, line;

  beforeEach(function () {
    lastScenario = createSpy("Last scenario");
    scenarioCollection = {}; // bare objects because we need .length
                             // which is not available on jasmine spies
    spyOnStub(scenarioCollection, 'add');
    spyOnStub(scenarioCollection, 'insert');
    spyOnStub(scenarioCollection, 'removeAtIndex');
    spyOnStub(scenarioCollection, 'indexOf');
    spyOnStub(scenarioCollection, 'getLast').andReturn(lastScenario);
    spyOnStub(scenarioCollection, 'syncForEach');
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

  describe("getBackground() [setBackground()]", function () {
    describe("when a background was previously added", function () {
      var background;

      beforeEach(function () {
        background = createSpy("background");
        feature.setBackground(background);
      });

      it("returns the background", function () {
        expect(feature.getBackground()).toBe(background);
      });
    });

    describe("when no background was previousyly added", function () {
      it("returns nothing", function () {
        expect(feature.getBackground()).toBeUndefined();
      });
    });
  });

  describe("hasBackground()", function () {
    it("returns true when a background was set", function () {
      var background = createSpy("background");
      feature.setBackground(background);
      expect(feature.hasBackground()).toBeTruthy();
    });

    it("returns false when no background was set", function () {
      expect(feature.hasBackground()).toBeFalsy();
    });
  });

  describe("addFeatureElement()", function () {
    var scenario, background;

    beforeEach(function () {
      scenario   = createSpyWithStubs("scenario AST element", {setBackground: null});
      background = createSpy("scenario background");
      spyOn(feature, 'getBackground').andReturn(background);
    });

    it("sets the background on the scenario", function () {
      feature.addFeatureElement(scenario);
      expect(scenario.setBackground).toHaveBeenCalledWith(background);
    });

    it("adds the scenario to the scenarios (collection)", function () {
      feature.addFeatureElement(scenario);
      expect(scenarioCollection.add).toHaveBeenCalledWith(scenario);
    });
  });

  describe("insertFeatureElement()", function () {
    var index, scenario, background;

    beforeEach(function () {
      index      = createSpy("index");
      scenario   = createSpyWithStubs("scenario AST element", {setBackground: null});
      background = createSpy("scenario background");
      spyOn(feature, 'getBackground').andReturn(background);
    });

    it("sets the background on the scenario", function () {
      feature.insertFeatureElement(index, scenario);
      expect(scenario.setBackground).toHaveBeenCalledWith(background);
    });

    it("adds the scenario to the scenarios (collection)", function () {
      feature.insertFeatureElement(index, scenario);
      expect(scenarioCollection.insert).toHaveBeenCalledWith(index, scenario);
    });
  });

  describe("convertScenarioOutlinesToScenarios()", function () {
    it ("iterates over the feature elements", function () {
      feature.convertScenarioOutlinesToScenarios();
      expect(scenarioCollection.syncForEach).toHaveBeenCalled();
      expect(scenarioCollection.syncForEach).toHaveBeenCalledWithAFunctionAsNthParameter(1);
    });

    describe("for each feature element", function () {
      var userFunction, featureElement;

      beforeEach(function () {
        feature.convertScenarioOutlinesToScenarios();
        userFunction   = scenarioCollection.syncForEach.mostRecentCall.args[0];
        featureElement = createSpyWithStubs("feature element", {isScenarioOutline: null});
        spyOn(feature, 'convertScenarioOutlineToScenarios');
      });

      describe("when the feature element is a scenario outline", function () {
        beforeEach(function () {
          featureElement.isScenarioOutline.andReturn(true);
          userFunction (featureElement);
        });

        it("converts the scenario outline into scenarios", function () {
          expect(feature.convertScenarioOutlineToScenarios).toHaveBeenCalledWith(featureElement);
        });
      });

      describe("when the feature element is not a scenario outline", function () {
        beforeEach(function () {
          featureElement.isScenarioOutline.andReturn(false);
          userFunction (featureElement);
        });

        it("converts the scenario outline into scenarios", function () {
          expect(feature.convertScenarioOutlineToScenarios).not.toHaveBeenCalled();
        });
      });
    });
  });

  describe("convertScenarioOutlineToScenarios()", function () {
    var scenarios, scenarioOutlineTags, scenarioOutline, scenarioOutlineIndex;

    beforeEach(function () {
      scenarios            = createSpyWithStubs("scenarios", {syncForEach: null});
      scenarioOutlineTags  = createSpy("tags");
      scenarioOutline      = createSpyWithStubs("scenario outline", {buildScenarios: scenarios, getTags: scenarioOutlineTags});
      scenarioOutlineIndex = 1;
      scenarioCollection.indexOf.andReturn(scenarioOutlineIndex);
      feature.convertScenarioOutlineToScenarios(scenarioOutline);
    });

    it ("builds the scenarios for the scenario outline", function () {
      expect(scenarioOutline.buildScenarios).toHaveBeenCalled();
    });

    it ("gets the index of the scenario outline in the scenario collection", function () {
      expect(scenarioCollection.indexOf).toHaveBeenCalledWith(scenarioOutline);
    });

    it("removes the scenario outline from the scenario collection", function () {
      expect(scenarioCollection.removeAtIndex).toHaveBeenCalledWith(scenarioOutlineIndex);
    });

    it("gets the tags from the scenario outline just once", function () {
      expect(scenarioOutline.getTags).toHaveBeenCalledNTimes(1);
    });

    it ("iterates over the scenarios", function () {
      expect(scenarios.syncForEach).toHaveBeenCalled();
      expect(scenarios.syncForEach).toHaveBeenCalledWithAFunctionAsNthParameter(1);
    });

    describe("for each scenario", function () {
      var userFunction, scenario, index;

      beforeEach(function () {
        userFunction   = scenarios.syncForEach.mostRecentCall.args[0];
        scenario       = createSpyWithStubs("scenario", {addTags: null});
        index          = 2;
        spyOn(feature, 'insertFeatureElement');
        userFunction (scenario, index);
      });

      it("adds the scenario outline's tags to the scenario", function () {
        expect(scenario.addTags).toHaveBeenCalledWith(scenarioOutlineTags);
      });

      it("inserts the scenario into the scenario collection", function () {
        expect(feature.insertFeatureElement).toHaveBeenCalledWith(scenarioOutlineIndex + index, scenario);
      });
    });
  });

  describe("getLastScenario()", function () {
    it("gets the last scenario from the collection", function () {
      feature.getLastFeatureElement();
      expect(scenarioCollection.getLast).toHaveBeenCalled();
    });

    it("returns the last scenario", function () {
      expect(feature.getLastFeatureElement()).toBe(lastScenario);
    });
  });

  describe("hasScenarios()", function () {
    beforeEach(function () {
      spyOnStub(scenarioCollection, 'length');
    });

    it("gets the number of scenarios", function () {
      feature.hasFeatureElements();
      expect(scenarioCollection.length).toHaveBeenCalled();
    });

    it("is falsy when there are 0 scenarios", function () {
      scenarioCollection.length.andReturn(0);
      expect(feature.hasFeatureElements()).toBeFalsy();
    });

    it("is truthy when there is 1 scenario", function () {
      scenarioCollection.length.andReturn(1);
      expect(feature.hasFeatureElements()).toBeTruthy();
    });

    it("is truthy when there are more than 1 scenarios", function () {
      scenarioCollection.length.andReturn(2);
      expect(feature.hasFeatureElements()).toBeTruthy();
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
