require('../../support/spec_helper');

describe("Cucumber.Ast.Assembler", function() {
  var Cucumber = requireLib('cucumber');
  var assembler, features, filter;

  beforeEach(function() {
    features  = createSpy("features");
    filter    = createSpy("filter");
    assembler = Cucumber.Ast.Assembler(features, filter);
  });

  describe("setCurrentFeature()", function() {
    var currentFeature;

    beforeEach(function() {
      currentFeature = createSpy("current feature");
      spyOn(assembler, 'setCurrentScenarioOrBackground');
    });

    it("unsets the current scenario", function() {
      assembler.setCurrentFeature(currentFeature);
      expect(assembler.setCurrentScenarioOrBackground).toHaveBeenCalledWith(undefined);
    });
  });

  describe("getCurrentFeature() [setCurrentFeature()]", function() {
    var currentFeature;

    beforeEach(function() {
      currentFeature = createSpy("current feature");
    });

    it("returns the current feature", function() {
      assembler.setCurrentFeature(currentFeature);
      expect(assembler.getCurrentFeature()).toBe(currentFeature);
    });
  });

  describe("setCurrentScenarioOrBackground()", function() {
    var currentScenarioOrBackground;

    beforeEach(function() {
      currentScenarioOrBackground = createSpy("current scenario or background");
      spyOn(assembler, 'setCurrentStep');
    });

    it("unsets the current step", function() {
      assembler.setCurrentScenarioOrBackground(currentScenarioOrBackground);
      expect(assembler.setCurrentStep).toHaveBeenCalledWith(undefined);
    });
  });

  describe("getCurrentScenarioOrBackground() [setCurrentScenarioOrBackground()]", function() {
    var currentScenarioOrBackground;

    beforeEach(function() {
      currentScenarioOrBackground = createSpy("current scenario or background");
    });

    it("returns the current scenario or background", function() {
      assembler.setCurrentScenarioOrBackground(currentScenarioOrBackground);
      expect(assembler.getCurrentScenarioOrBackground()).toBe(currentScenarioOrBackground);
    });
  });

  describe("getCurrentStep() [setCurrentStep()]", function() {
    var currentStep;

    beforeEach(function() {
      currentStep = createSpy("current step");
    });

    it("returns the current step", function() {
      assembler.setCurrentStep(currentStep);
      expect(assembler.getCurrentStep()).toBe(currentStep);
    });
  });

  describe("revealTags() [stashTag()]", function() {
    var firstTag, secondTag;

    beforeEach(function() {
      firstTag  = createSpy("first tag");
      secondTag = createSpy("second tag");
      assembler.stashTag(firstTag);
      assembler.stashTag(secondTag);
    });

    it("returns the stashed tags", function() {
      expect(assembler.revealTags()).toEqual([firstTag, secondTag]);
    });

    it("removes the tags from the stash", function() {
      var thirdTag = createSpy("third tag");
      assembler.revealTags();
      assembler.stashTag(thirdTag);
      expect(assembler.revealTags()).toEqual([thirdTag]);
    });
  });

  describe("applyCurrentFeatureTagsToElement()", function() {
    var feature, featureTags, element;

    beforeEach(function() {
      element     = createSpyWithStubs("AST element", {addInheritedtags: null});
      featureTags = createSpy("feature tags");
      feature     = createSpyWithStubs("current feature", {getTags: featureTags});
      spyOn(assembler, 'getCurrentFeature').andReturn(feature);
    });

    it("gets the current feature", function() {
      assembler.applyCurrentFeatureTagsToElement(element);
      expect(assembler.getCurrentFeature).toHaveBeenCalled();
    });

    it("gets the feature tags", function() {
      assembler.applyCurrentFeatureTagsToElement(element);
      expect(feature.getTags).toHaveBeenCalled();
    });

    it("adds the feature tags to the element", function() {
      assembler.applyCurrentFeatureTagsToElement(element);
      expect(element.addInheritedtags).toHaveBeenCalledWith(featureTags);
    });
  });

  describe("applyStashedTagsToElement()", function() {
    var element, revealedTags;

    beforeEach(function() {
      element      = createSpyWithStubs("any AST element accepting tags", {addTags: null});
      revealedTags = createSpy("revealed tags");
      spyOn(assembler, 'revealTags').andReturn(revealedTags);
    });

    it("reveals the tags", function() {
      assembler.applyStashedTagsToElement(element);
      expect(assembler.revealTags).toHaveBeenCalled();
    });

    it("adds the tags to the element", function() {
      assembler.applyStashedTagsToElement(element);
      expect(element.addTags).toHaveBeenCalledWith(revealedTags);
    });
  });

  describe("insertBackground()", function() {
    var background, currentFeature;

    beforeEach(function() {
      background     = createSpy("background");
      currentFeature = createSpyWithStubs("current feature", {addBackground: null});
      spyOn(assembler, 'getCurrentFeature').andReturn(currentFeature);
      spyOn(assembler, 'setCurrentScenarioOrBackground');
    });

    it("sets the background as the current background", function() {
      assembler.insertBackground(background);
      expect(assembler.setCurrentScenarioOrBackground).toHaveBeenCalledWith(background);
    });

    it("gets the current feature", function() {
      assembler.insertBackground(background);
      expect(assembler.getCurrentFeature).toHaveBeenCalled();
    });

     it("adds the background to the current feature", function() {
      assembler.insertBackground(background);
      expect(currentFeature.addBackground).toHaveBeenCalledWith(background);
    });
  });

  describe("insertFeature()", function() {
    var feature;

    beforeEach(function() {
      feature = createSpy("feature");
      spyOn(assembler, 'tryEnrollingSuggestedFeature');
      spyOn(assembler, 'applyStashedTagsToElement');
      spyOn(assembler, 'setCurrentFeature');
      spyOn(assembler, 'suggestFeature');
    });

    it("tries to enroll the suggested feature, if any", function () {
      assembler.insertFeature(feature);
      expect(assembler.tryEnrollingSuggestedFeature).toHaveBeenCalled();
    });

    it("applies the stashed tags to the feature", function() {
      assembler.insertFeature(feature);
      expect(assembler.applyStashedTagsToElement).toHaveBeenCalledWith(feature);
    });

    it("sets the feature as the current feature", function() {
      assembler.insertFeature(feature);
      expect(assembler.setCurrentFeature).toHaveBeenCalledWith(feature);
    });

    it("suggests the feature to be added to root features", function() {
      assembler.insertFeature(feature);
      expect(assembler.suggestFeature).toHaveBeenCalledWith(feature);
    });
  });

  describe("insertDataTableRow()", function() {
    var dataTableRow, currentStep;

    beforeEach(function() {
      dataTableRow = createSpy("data table row");
      currentStep  = createSpyWithStubs("current step", {attachDataTableRow: null});
      spyOn(assembler, 'getCurrentStep').andReturn(currentStep);
    });

    it("gets the current step", function() {
      assembler.insertDataTableRow(dataTableRow);
      expect(assembler.getCurrentStep).toHaveBeenCalled();
    });

    it("attaches the data table row to the current step", function() {
      assembler.insertDataTableRow(dataTableRow);
      expect(currentStep.attachDataTableRow).toHaveBeenCalledWith(dataTableRow);
    });
  });

  describe("insertDocString()", function() {
    var docString, currentStep;

    beforeEach(function() {
      docString = createSpy("data table row");
      currentStep  = createSpyWithStubs("current step", {attachDocString: null});
      spyOn(assembler, 'getCurrentStep').andReturn(currentStep);
    });

    it("gets the current step", function() {
      assembler.insertDocString(docString);
      expect(assembler.getCurrentStep).toHaveBeenCalled();
    });

    it("attaches the data table row to the current step", function() {
      assembler.insertDocString(docString);
      expect(currentStep.attachDocString).toHaveBeenCalledWith(docString);
    });
  });

  describe("insertScenario()", function() {
    var scenario, currentFeature;

    beforeEach(function() {
      scenario       = createSpy("scenario");
      currentFeature = createSpyWithStubs("current feature", {addScenario: null});
      spyOnStub(filter, 'isElementEnrolled');
      spyOn(assembler, 'applyStashedTagsToElement');
      spyOn(assembler, 'applyCurrentFeatureTagsToElement');
      spyOn(assembler, 'getCurrentFeature').andReturn(currentFeature);
      spyOn(assembler, 'setCurrentScenarioOrBackground');
    });

    it("applies the current feature tags to the scenario", function() {
      assembler.insertScenario(scenario);
      expect(assembler.applyCurrentFeatureTagsToElement).toHaveBeenCalledWith(scenario);
    });

    it("applies the stashed tags to the scenario", function() {
      assembler.insertScenario(scenario);
      expect(assembler.applyStashedTagsToElement).toHaveBeenCalledWith(scenario);
    });

    it("sets the scenario as the current scenario", function() {
      assembler.insertScenario(scenario);
      expect(assembler.setCurrentScenarioOrBackground).toHaveBeenCalledWith(scenario);
    });

    it("asks the filter if the scenario is enrolled", function() {
      assembler.insertScenario(scenario);
      expect(filter.isElementEnrolled).toHaveBeenCalledWith(scenario);
    });

    describe("when the scenario is enrolled", function() {
      beforeEach(function() {
        filter.isElementEnrolled.andReturn(true);
      });

      it("gets the current feature", function() {
        assembler.insertScenario(scenario);
        expect(assembler.getCurrentFeature).toHaveBeenCalled();
      });

      it("adds the scenario to the current feature", function() {
        assembler.insertScenario(scenario);
        expect(currentFeature.addScenario).toHaveBeenCalledWith(scenario);
      });
    });

    describe("when the scenario is not enrolled", function() {
      beforeEach(function() {
        filter.isElementEnrolled.andReturn(false);
      });

      it("does not get the current feature", function() {
        assembler.insertScenario(scenario);
        expect(assembler.getCurrentFeature).not.toHaveBeenCalled();
      });

      it("does not add the scenario to the current feature", function() {
        assembler.insertScenario(scenario);
        expect(currentFeature.addScenario).not.toHaveBeenCalledWith(scenario);
      });
    });
  });

  describe("insertStep()", function() {
    var step, currentScenario;

    beforeEach(function() {
      step                        = createSpy("step");
      currentScenarioOrBackground = createSpyWithStubs("current scenario or background", {addStep: null});
      spyOn(assembler, 'getCurrentScenarioOrBackground').andReturn(currentScenarioOrBackground);
      spyOn(assembler, 'setCurrentStep');
    });

    it("sets the step as the current step", function() {
      assembler.insertStep(step);
      expect(assembler.setCurrentStep).toHaveBeenCalledWith(step);
    });

    it("gets the current scenario or background", function() {
      assembler.insertStep(step);
      expect(assembler.getCurrentScenarioOrBackground).toHaveBeenCalled();
    });

    it("adds the step to the scenario or background", function() {
      assembler.insertStep(step);
      expect(currentScenarioOrBackground.addStep).toHaveBeenCalledWith(step);
    });
  });

  describe("insertTag()", function() {
    var tag;

    beforeEach(function() {
      tag = createSpy("tag");
      spyOn(assembler, 'stashTag');
    });

    it("stashes the tag", function() {
      assembler.insertTag(tag);
      expect(assembler.stashTag).toHaveBeenCalledWith(tag);
    });
  });

  describe("finish()", function () {
    beforeEach(function() {
      spyOn(assembler, 'tryEnrollingSuggestedFeature');
    });

    it("tries to enroll the suggested feature, if any", function () {
      assembler.finish();
      expect(assembler.tryEnrollingSuggestedFeature).toHaveBeenCalled();
    });
  });

  describe("isSuggestedFeatureEnrollable() [suggestFeature()]", function () {
    it("is falsy when no feature is suggested for enrolment", function () {
      var enrollable = assembler.isSuggestedFeatureEnrollable();
      expect(enrollable).toBeFalsy();
    });

    describe("when a feature is suggested", function () {
      var feature;

      beforeEach(function () {
        feature = createSpyWithStubs("suggested feature", {hasScenarios: null});
        assembler.suggestFeature(feature);
        spyOnStub(filter, 'isElementEnrolled');
      });

      it("checks whether the feature has scenarios or not", function () {
        assembler.isSuggestedFeatureEnrollable();
        expect(feature.hasScenarios).toHaveBeenCalled();
      });

      describe("when the feature has scenarios", function () {
        beforeEach(function () {
          feature.hasScenarios.andReturn(true);
        });

        it("is truthy", function () {
          var enrollable = assembler.isSuggestedFeatureEnrollable();
          expect(enrollable).toBeTruthy();
        });
      });

      describe("when the feature has got no scenarios", function () {
        beforeEach(function () {
          feature.hasScenarios.andReturn(false);
        });

        it("asks the filter is the feature should be enrolled", function () {
          assembler.isSuggestedFeatureEnrollable();
          expect(filter.isElementEnrolled).toHaveBeenCalledWith(feature);
        });

        it("is truthy when the filter tells the feature should be enrolled", function () {
          filter.isElementEnrolled.andReturn(true);
          var enrollable = assembler.isSuggestedFeatureEnrollable();
          expect(enrollable).toBeTruthy();
        });

        it("is falsy when the filter tells the feature should be enrolled", function () {
          filter.isElementEnrolled.andReturn(false);
          var enrollable = assembler.isSuggestedFeatureEnrollable();
          expect(enrollable).toBeFalsy();
        });
      });
    });
  });

  describe("tryEnrollingSuggestedFeature()", function () {
    beforeEach(function () {
      spyOn(assembler, 'isSuggestedFeatureEnrollable');
      spyOn(assembler, 'enrolSuggestedFeature');
    });

    it("checks whether the possible suggested feature is enrollable", function () {
      assembler.tryEnrollingSuggestedFeature();
      expect(assembler.isSuggestedFeatureEnrollable).toHaveBeenCalled();
    });

    describe("when the suggested feature is enrollable", function () {
      beforeEach(function () {
        assembler.isSuggestedFeatureEnrollable.andReturn(true);
      });

      it("enrols the suggested feature", function () {
        assembler.tryEnrollingSuggestedFeature();
        expect(assembler.enrolSuggestedFeature).toHaveBeenCalled();
      });
    });

    describe("when the suggested feature is not enrollable (or there is no suggested feature yet)", function () {
      beforeEach(function () {
        assembler.isSuggestedFeatureEnrollable.andReturn(false);
      });

      it("enrols the suggested feature", function () {
        assembler.tryEnrollingSuggestedFeature();
        expect(assembler.enrolSuggestedFeature).not.toHaveBeenCalled();
      });
    });
  });

  describe("enrolSuggestedFeature", function () {
    var feature;

    beforeEach(function () {
      feature = createSpyWithStubs("suggested feature", {hasScenarios: true});
      spyOnStub(features, 'addFeature');
      assembler.suggestFeature(feature);
      expect(assembler.isSuggestedFeatureEnrollable()).toBeTruthy();
    });

    it("adds the feature to the root features", function () {
      assembler.enrolSuggestedFeature();
      expect(features.addFeature).toHaveBeenCalledWith(feature);
    });

    it("removes the suggested feature", function () {
      assembler.enrolSuggestedFeature();
      expect(assembler.isSuggestedFeatureEnrollable()).toBeFalsy();
    });
  });
});
