require('../../support/spec_helper');

describe("Cucumber.Ast.Assembler", function() {
  var Cucumber = requireLib('cucumber');
  var assembler, features;

  beforeEach(function() {
    features  = createSpy("features");
    assembler = Cucumber.Ast.Assembler(features);
  });

  describe("getCurrentFeature()", function() {
    var lastFeature;

    beforeEach(function() {
      lastFeature = createSpy("Last recorded feature");
      spyOnStub(features, 'getLastFeature').andReturn(lastFeature);
    });

    it("gets the last feature from the root features", function() {
      assembler.getCurrentFeature();
      expect(features.getLastFeature).toHaveBeenCalled();
    });

    it("returns the last feature", function() {
      expect(assembler.getCurrentFeature()).toEqual(lastFeature);
    });
  });

  describe("getCurrentScenarioOrBackground()", function() {
    var currentFeature;

    beforeEach(function() {
      currentFeature = createSpyWithStubs("Current feature", {getLastScenario: undefined, getBackground: undefined});
      spyOn(assembler, 'getCurrentFeature').andReturn(currentFeature);
    });

    it("gets the current feature", function() {
      assembler.getCurrentScenarioOrBackground();
      expect(assembler.getCurrentFeature).toHaveBeenCalled();
    });

    it("asks the current feature for its last scenario", function() {
      assembler.getCurrentScenarioOrBackground();
      expect(currentFeature.getLastScenario).toHaveBeenCalled();
    });

    describe("when there is a last scenario", function() {
      var lastScenario;

      beforeEach(function() {
        lastScenario = createSpy("Last scenario of the feature");
        currentFeature.getLastScenario.andReturn(lastScenario);
      });

      it("returns the last scenario", function() {
        expect(assembler.getCurrentScenarioOrBackground()).toBe(lastScenario);
      });
    });

    describe("when there is no last scenario", function() {
      var background;

      beforeEach(function() {
        background = createSpy("background");
        spyOnStub(currentFeature, 'getBackground').andReturn(background);
      });

      it("gets the background", function() {
        assembler.getCurrentScenarioOrBackground();
        expect(currentFeature.getBackground).toHaveBeenCalled();
      });

      it("returns the background", function() {
        expect(assembler.getCurrentScenarioOrBackground()).toBe(background);
      });
    });
  });

  describe("getCurrentStep()", function() {
    var currentScenario, lastStep;

    beforeEach(function() {
      lastStep = createSpy("Last step of the scenario");
      currentScenario = createSpyWithStubs("Current scenario", {getLastStep: lastStep});
      spyOn(assembler, 'getCurrentScenarioOrBackground').andReturn(currentScenario);
    });

    it("gets the current scenario or background", function() {
      assembler.getCurrentStep();
      expect(assembler.getCurrentScenarioOrBackground).toHaveBeenCalled();
    });

    it("asks the current scenario or background for its last step", function() {
      assembler.getCurrentStep();
      expect(currentScenario.getLastStep).toHaveBeenCalled();
    });

    it("returns the last step", function() {
      expect(assembler.getCurrentStep()).toBe(lastStep);
    });
  });

  describe("insertBackground()", function() {
    var background, currentFeature;

    beforeEach(function() {
      background     = createSpy("background");
      currentFeature = createSpyWithStubs("current feature", {addBackground: null});
      spyOn(assembler, 'getCurrentFeature').andReturn(currentFeature);
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
      spyOnStub(features, 'addFeature');
    });

    it("adds the feature to the root features", function() {
      assembler.insertFeature(feature);
      expect(features.addFeature).toHaveBeenCalledWith(feature);
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
      scenario     = createSpy("scenario");
      currentFeature = createSpyWithStubs("current feature", {addScenario: null});
      spyOn(assembler, 'getCurrentFeature').andReturn(currentFeature);
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

  describe("insertStep()", function() {
    var step, currentScenario;

    beforeEach(function() {
      step                        = createSpy("step");
      currentScenarioOrBackground = createSpyWithStubs("current scenario or background", {addStep: null});
      spyOn(assembler, 'getCurrentScenarioOrBackground').andReturn(currentScenarioOrBackground);
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
});
