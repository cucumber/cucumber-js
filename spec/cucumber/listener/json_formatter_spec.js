
require('../../support/spec_helper');

describe("Cucumber.Listener.JsonFormatter", function () {
  var Cucumber = requireLib('cucumber');
  var formatter, jsonFormatter, options;

  beforeEach(function () {
    options             = createSpy(options);
    formatter           = createSpyWithStubs("formatter", {log: null});
    spyOn(Cucumber.Listener, 'Formatter').andReturn(formatter);
    jsonFormatter = Cucumber.Listener.JsonFormatter(options);
  });

  describe("constructor", function () {
    it("creates a formatter", function() {
      expect(Cucumber.Listener.Formatter).toHaveBeenCalledWith(options);
    });

    it("extends the formatter", function () {
      expect(jsonFormatter).toBe(formatter);
    });
  });

  describe("handleAfterFeaturesEvent()", function () {
    var callback;

    beforeEach(function () {
      callback   = createSpy("Callback");
      jsonFormatter.allFeatures = [{test:'hello'},{test:'world'}];
    });

    it("logs the list of features", function() {
      jsonFormatter.handleAfterFeaturesEvent(null, callback);
      expect(jsonFormatter.log).toHaveBeenCalledWith('[{"test":"hello"},{"test":"world"}]');
    });

    it("calls back", function () {
      jsonFormatter.handleAfterFeaturesEvent(null, callback);
      expect(callback).toHaveBeenCalled();
    });
  });

  describe("handleBeforeFeatureEvent()", function () {
    var event, callback, feature, jsonFeature;

    beforeEach(function () {
      jsonFeature = createSpy('json feature');
      feature = createSpy("feature");
      event      = createSpyWithStubs("event", {getPayloadItem: feature});
      callback   = createSpy("Callback");
      spyOn(jsonFormatter, 'buildFeature').andReturn(jsonFeature);
    });

    it("gets the feature from the event payload", function () {
      jsonFormatter.handleBeforeFeatureEvent(event, callback);
      expect(event.getPayloadItem).toHaveBeenCalledWith('feature');
    });

    it("builds the JSON feature", function () {
      jsonFormatter.handleBeforeFeatureEvent(event, callback);
      expect(jsonFormatter.buildFeature).toHaveBeenCalledWith(feature);
    });

    it("assigns the new feature to the current feature", function () {
      jsonFormatter.handleBeforeFeatureEvent(event, callback);
      expect(jsonFormatter.currentFeature).toEqual(jsonFeature);
    });

    it("calls back", function () {
      jsonFormatter.handleBeforeFeatureEvent(event, callback);
      expect(callback).toHaveBeenCalled();
    });
  });

  describe("handleAfterFeatureEvent()", function () {
    var callback;

    beforeEach(function () {
      callback   = createSpy("Callback");
      jsonFormatter.currentFeature = {test:'hello'};
      spyOn(jsonFormatter, 'addFeature');
    });

    it("adds the feature to the list of features", function() {
      jsonFormatter.handleAfterFeatureEvent(null, callback);
      expect(jsonFormatter.addFeature).toHaveBeenCalledWith({test:'hello'});
    });

    it("calls back", function () {
      jsonFormatter.handleAfterFeatureEvent(null, callback);
      expect(callback).toHaveBeenCalled();
    });
  });

  describe("handleBeforeScenarioEvent()", function () {
    var event, callback, scenario, jsonScenario;

    beforeEach(function () {
      jsonScenario = createSpy('json scenario');
      scenario = createSpy("scenario");
      event      = createSpyWithStubs("event", {getPayloadItem: scenario});
      callback   = createSpy("Callback");
      spyOn(jsonFormatter, 'buildScenario').andReturn(jsonScenario);
      spyOn(jsonFormatter, 'addScenario');
    });

    it("gets the scenario from the event payload", function () {
      jsonFormatter.handleBeforeScenarioEvent(event, callback);
      expect(event.getPayloadItem).toHaveBeenCalledWith('scenario');
    });

    it("builds the JSON scenario", function () {
      jsonFormatter.handleBeforeScenarioEvent(event, callback);
      expect(jsonFormatter.buildScenario).toHaveBeenCalledWith(scenario);
    });

    it("assigns the new feature to the current scenario", function () {
      jsonFormatter.handleBeforeScenarioEvent(event, callback);
      expect(jsonFormatter.currentScenario).toEqual(jsonScenario);
    });

    it("adds the new scenario to the result", function () {
      jsonFormatter.handleBeforeScenarioEvent(event, callback);
      expect(jsonFormatter.addScenario).toHaveBeenCalledWith(jsonScenario);
    });

    it("calls back", function () {
      jsonFormatter.handleBeforeScenarioEvent(event, callback);
      expect(callback).toHaveBeenCalled();
    });
  });

  describe("handleStepResultEvent()", function () {
    var event, callback, stepResult, step, jsonStep;

    beforeEach(function () {
      jsonStep = createSpy('json step');
      step = createSpy('step');
      stepResult = createSpyWithStubs("step result", {getStep: step});
      event      = createSpyWithStubs("event", {getPayloadItem: stepResult});
      callback   = createSpy("Callback");
      spyOn(jsonFormatter, 'buildStep').andReturn(jsonStep);
      spyOn(jsonFormatter, 'addStep');
    });

    it("gets the step result from the event payload", function () {
      jsonFormatter.handleStepResultEvent(event, callback);
      expect(event.getPayloadItem).toHaveBeenCalledWith('stepResult');
    });

    it("gets the step from the step result", function () {
      jsonFormatter.handleStepResultEvent(event, callback);
      expect(stepResult.getStep).toHaveBeenCalled();
    });

    it("builds the JSON step", function () {
      jsonFormatter.handleStepResultEvent(event, callback);
      expect(jsonFormatter.buildStep).toHaveBeenCalledWith(stepResult, step);
    });

    it("adds the new step to the result", function () {
      jsonFormatter.handleStepResultEvent(event, callback);
      expect(jsonFormatter.addStep).toHaveBeenCalledWith(jsonStep);
    });

    it("calls back", function () {
      jsonFormatter.handleStepResultEvent(event, callback);
      expect(callback).toHaveBeenCalled();
    });
  });

  describe('buildFeature()', function() {
    var feature;

    beforeEach(function() {
      feature = createSpyWithStubs('feature', {
        getName: 'featureName',
        getDescription: 'featureDescription'
      });
    });

    it('gets the name', function() {
      jsonFormatter.buildFeature(feature);
      expect(feature.getName).toHaveBeenCalled();
    });

    it('gets the description', function() {
      jsonFormatter.buildFeature(feature);
      expect(feature.getDescription).toHaveBeenCalled();
    });

    it ('returns the feature', function() {
      var theFeature = jsonFormatter.buildFeature(feature);
      expect(theFeature).toEqual({
        name: 'featureName',
        description: 'featureDescription',
        scenarios: []
      });
    });
  });

  describe('buildScenario()', function() {
    var scenario;

    beforeEach(function() {
      scenario = createSpyWithStubs('scenario', {
        getName: 'scenarioName',
        getDescription: 'scenarioDescription'
      });
    });

    it('gets the name', function() {
      jsonFormatter.buildScenario(scenario);
      expect(scenario.getName).toHaveBeenCalled();
    });

    it('gets the description', function() {
      jsonFormatter.buildScenario(scenario);
      expect(scenario.getDescription).toHaveBeenCalled();
    });

    it ('returns the feature', function() {
      var theScenario = jsonFormatter.buildScenario(scenario);
      expect(theScenario).toEqual({
        name: 'scenarioName',
        description: 'scenarioDescription',
        steps: []
      });
    });
  });

  describe('buildStep()', function() {
    var stepResult, step;

    beforeEach(function() {
      stepResult = createSpyWithStubs('step result', {
        isFailed: undefined,
        isPending: undefined,
        isSkipped: undefined,
        isSuccessful: undefined
      });
      step = createSpyWithStubs('step', {
        getName: 'stepName',
        getKeyword: 'stepKeyword'
      });
    });

    it('gets the step name', function() {
      jsonFormatter.buildStep(stepResult, step);
      expect(step.getName).toHaveBeenCalled();
    });

    it('gets the step keyword', function() {
      jsonFormatter.buildStep(stepResult, step);
      expect(step.getKeyword).toHaveBeenCalled();
    });

    describe('failed', function() {
      beforeEach(function() {
        stepResult.isFailed.andReturn(true);
        spyOn(jsonFormatter, 'getStepFailureMessage').andReturn('failureMessage');
      });

      it('calls getStepFailureMessage', function() {
        jsonFormatter.buildStep(stepResult, step);
        expect(jsonFormatter.getStepFailureMessage).wasCalledWith(stepResult);
      });

      it('returns a step that failed and contains a failure message', function() {
        var theStep = jsonFormatter.buildStep(stepResult, step);
        expect(theStep).toEqual({
          name:'stepName',
          keyword:'stepKeyword',
          result:'failed',
          message:'failureMessage'
        });
      });
    });

    describe('pending', function() {
      beforeEach(function() {
        stepResult.isPending.andReturn(true);
      });

      it('returns a step that failed and contains a failure message', function() {
        var theStep = jsonFormatter.buildStep(stepResult, step);
        expect(theStep).toEqual({
          name:'stepName',
          keyword:'stepKeyword',
          result:'pending',
          message:undefined
        });
      });
    });

    describe('skipped', function() {
      beforeEach(function() {
        stepResult.isSkipped.andReturn(true);
      });

      it('returns a step that failed and contains a failure message', function() {
        var theStep = jsonFormatter.buildStep(stepResult, step);
        expect(theStep).toEqual({
          name:'stepName',
          keyword:'stepKeyword',
          result:'skipped',
          message:undefined
        });
      });
    });

    describe('successful', function() {
      beforeEach(function() {
        stepResult.isSuccessful.andReturn(true);
      });

      it('returns a step that failed and contains a failure message', function() {
        var theStep = jsonFormatter.buildStep(stepResult, step);
        expect(theStep).toEqual({
          name:'stepName',
          keyword:'stepKeyword',
          result:'successful',
          message:undefined
        });
      });
    });

    describe('undefined', function() {
      it('returns a step that failed and contains a failure message', function() {
        var theStep = jsonFormatter.buildStep(stepResult, step);
        expect(theStep).toEqual({
          name:'stepName',
          keyword:'stepKeyword',
          result:'undefined',
          message:undefined
        });
      });
    });
  });

  describe('getStepFailureMessage()', function() {
    var exception, stepResult;

    beforeEach(function() {
      exception = createSpyWithStubs('exception');
      stepResult = createSpyWithStubs('step result', { getFailureException: exception });
    });

    it('gets the failure exception', function() {
      jsonFormatter.getStepFailureMessage(stepResult);
      expect(stepResult.getFailureException).toHaveBeenCalled();
    });

    it('returns the exception if there is no stack', function() {
      var message = jsonFormatter.getStepFailureMessage(stepResult);
      expect(message).toEqual(exception);
    });

    it('returns the stack if it exists', function() {
      exception.stack = 'theStack'
      var message = jsonFormatter.getStepFailureMessage(stepResult);
      expect(message).toEqual('theStack');
    });
  });

  describe('addFeature()', function() {
    it('adds a feature to the allFeatures list', function() {
      jsonFormatter.addFeature({test:'feature'});
      expect(jsonFormatter.allFeatures.features).toContain({test:'feature'});
    });
  });

  describe('addScenario()', function() {
    it('adds a scenario to the current feature', function() {
      jsonFormatter.currentFeature = {scenarios: []}
      jsonFormatter.addScenario({test:'scenario'});
      expect(jsonFormatter.currentFeature.scenarios).toContain({test:'scenario'});
    });
  });

  describe('addStep()', function() {
    it('adds a step to the current scenario', function() {
      jsonFormatter.currentScenario = {steps: []}
      jsonFormatter.addStep({test:'step'});
      expect(jsonFormatter.currentScenario.steps).toContain({test:'step'});
    });
  });

});
