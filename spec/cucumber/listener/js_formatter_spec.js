
require('../../support/spec_helper');

describe("Cucumber.Listener.JSFormatter", function () {
  var Cucumber = requireLib('cucumber');
  var formatter, jsFormatter, options;

  beforeEach(function () {
    options             = createSpy(options);
    formatter           = createSpyWithStubs("formatter", {log: null});
    spyOn(Cucumber.Listener, 'Formatter').andReturn(formatter);
    jsFormatter = Cucumber.Listener.JSFormatter(options);
  });

  describe("constructor", function () {
    it("creates a formatter", function() {
      expect(Cucumber.Listener.Formatter).toHaveBeenCalledWith(options);
    });

    it("extends the formatter", function () {
      expect(jsFormatter).toBe(formatter);
    });
  });

  describe("handleBeforeFeatureEvent()", function () {
    var event, callback, feature, jsFeature;

    beforeEach(function () {
      jsFeature = createSpy('js feature');
      feature = createSpy("feature");
      event      = createSpyWithStubs("event", {getPayloadItem: feature});
      callback   = createSpy("Callback");
      spyOn(jsFormatter, 'buildFeature').andReturn(jsFeature);
    });

    it("gets the feature from the event payload", function () {
      jsFormatter.handleBeforeFeatureEvent(event, callback);
      expect(event.getPayloadItem).toHaveBeenCalledWith('feature');
    });

    it("builds the JSON feature", function () {
      jsFormatter.handleBeforeFeatureEvent(event, callback);
      expect(jsFormatter.buildFeature).toHaveBeenCalledWith(feature);
    });

    it("assigns the new feature to the current feature", function () {
      jsFormatter.handleBeforeFeatureEvent(event, callback);
      expect(jsFormatter.currentFeature).toEqual(jsFeature);
    });

    it("calls back", function () {
      jsFormatter.handleBeforeFeatureEvent(event, callback);
      expect(callback).toHaveBeenCalled();
    });
  });

  describe("handleAfterFeatureEvent()", function () {
    var callback;

    beforeEach(function () {
      callback   = createSpy("Callback");
      jsFormatter.currentFeature = {test:'hello'};
    });

    it("logs the JSON feature", function() {
      jsFormatter.handleAfterFeatureEvent(null, callback);
      expect(jsFormatter.log).toHaveBeenCalledWith('{"test":"hello"}');
    });

    it("calls back", function () {
      jsFormatter.handleAfterFeatureEvent(event, callback);
      expect(callback).toHaveBeenCalled();
    });
  });

  describe("handleBeforeScenarioEvent()", function () {
    var event, callback, scenario, jsScenario;

    beforeEach(function () {
      jsScenario = createSpy('js scenario');
      scenario = createSpy("scenario");
      event      = createSpyWithStubs("event", {getPayloadItem: scenario});
      callback   = createSpy("Callback");
      spyOn(jsFormatter, 'buildScenario').andReturn(jsScenario);
      spyOn(jsFormatter, 'addScenario');
    });

    it("gets the scenario from the event payload", function () {
      jsFormatter.handleBeforeScenarioEvent(event, callback);
      expect(event.getPayloadItem).toHaveBeenCalledWith('scenario');
    });

    it("builds the JSON scenario", function () {
      jsFormatter.handleBeforeScenarioEvent(event, callback);
      expect(jsFormatter.buildScenario).toHaveBeenCalledWith(scenario);
    });

    it("assigns the new feature to the current scenario", function () {
      jsFormatter.handleBeforeScenarioEvent(event, callback);
      expect(jsFormatter.currentScenario).toEqual(jsScenario);
    });

    it("adds the new scenario to the result", function () {
      jsFormatter.handleBeforeScenarioEvent(event, callback);
      expect(jsFormatter.addScenario).toHaveBeenCalledWith(jsScenario);
    });

    it("calls back", function () {
      jsFormatter.handleBeforeScenarioEvent(event, callback);
      expect(callback).toHaveBeenCalled();
    });
  });

  describe("handleStepResultEvent()", function () {
    var event, callback, stepResult, step, jsStep;

    beforeEach(function () {
      jsStep = createSpy('js step');
      step = createSpy('step');
      stepResult = createSpyWithStubs("step result", {getStep: step});
      event      = createSpyWithStubs("event", {getPayloadItem: stepResult});
      callback   = createSpy("Callback");
      spyOn(jsFormatter, 'buildStep').andReturn(jsStep);
      spyOn(jsFormatter, 'addStep');
    });

    it("gets the step result from the event payload", function () {
      jsFormatter.handleStepResultEvent(event, callback);
      expect(event.getPayloadItem).toHaveBeenCalledWith('stepResult');
    });

    it("gets the step from the step result", function () {
      jsFormatter.handleStepResultEvent(event, callback);
      expect(stepResult.getStep).toHaveBeenCalled();
    });

    it("builds the JSON step", function () {
      jsFormatter.handleStepResultEvent(event, callback);
      expect(jsFormatter.buildStep).toHaveBeenCalledWith(stepResult, step);
    });

    it("adds the new step to the result", function () {
      jsFormatter.handleStepResultEvent(event, callback);
      expect(jsFormatter.addStep).toHaveBeenCalledWith(jsStep);
    });

    it("calls back", function () {
      jsFormatter.handleStepResultEvent(event, callback);
      expect(callback).toHaveBeenCalled();
    });
  });

});
