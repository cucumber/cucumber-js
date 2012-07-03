
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

  describe("handleAfterFeaturesEvent()", function () {
    var callback;

    beforeEach(function () {
      callback   = createSpy("Callback");
      jsFormatter.allFeatures = [{test:'hello'},{test:'world'}];
    });

    it("logs the list of features", function() {
      jsFormatter.handleAfterFeaturesEvent(null, callback);
      expect(jsFormatter.log).toHaveBeenCalledWith('[{"test":"hello"},{"test":"world"}]');
    });

    it("calls back", function () {
      jsFormatter.handleAfterFeaturesEvent(event, callback);
      expect(callback).toHaveBeenCalled();
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
      spyOn(jsFormatter, 'addFeature');
    });

    it("adds the feature to the list of features", function() {
      jsFormatter.handleAfterFeatureEvent(null, callback);
      expect(jsFormatter.addFeature).toHaveBeenCalledWith({test:'hello'});
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

  describe('buildFeature()', function() {
    var feature;

    beforeEach(function() {
      feature = createSpyWithStubs('feature', {
        getName: 'featureName',
        getDescription: 'featureDescription'
      });
    });

    it('gets the name', function() {
      jsFormatter.buildFeature(feature);
      expect(feature.getName).toHaveBeenCalled();
    });

    it('gets the description', function() {
      jsFormatter.buildFeature(feature);
      expect(feature.getDescription).toHaveBeenCalled();
    });

    it ('returns the feature', function() {
      var theFeature = jsFormatter.buildFeature(feature);
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
      jsFormatter.buildScenario(scenario);
      expect(scenario.getName).toHaveBeenCalled();
    });

    it('gets the description', function() {
      jsFormatter.buildScenario(scenario);
      expect(scenario.getDescription).toHaveBeenCalled();
    });

    it ('returns the feature', function() {
      var theScenario = jsFormatter.buildScenario(scenario);
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
      jsFormatter.buildStep(stepResult, step);
      expect(step.getName).toHaveBeenCalled();
    });

    it('gets the step keyword', function() {
      jsFormatter.buildStep(stepResult, step);
      expect(step.getKeyword).toHaveBeenCalled();
    });

    describe('failed', function() {
      beforeEach(function() {
        stepResult.isFailed.andReturn(true);
        spyOn(jsFormatter, 'getStepFailureMessage').andReturn('failureMessage');
      });

      it('calls getStepFailureMessage', function() {
        jsFormatter.buildStep(stepResult, step);
        expect(jsFormatter.getStepFailureMessage).wasCalledWith(stepResult);
      });

      it('returns a step that failed and contains a failure message', function() {
        var theStep = jsFormatter.buildStep(stepResult, step);
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
        var theStep = jsFormatter.buildStep(stepResult, step);
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
        var theStep = jsFormatter.buildStep(stepResult, step);
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
        var theStep = jsFormatter.buildStep(stepResult, step);
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
        var theStep = jsFormatter.buildStep(stepResult, step);
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
      jsFormatter.getStepFailureMessage(stepResult);
      expect(stepResult.getFailureException).toHaveBeenCalled();
    });

    it('returns the exception if there is no stack', function() {
      var message = jsFormatter.getStepFailureMessage(stepResult);
      expect(message).toEqual(exception);
    });

    it('returns the stack if it exists', function() {
      exception.stack = 'theStack'
      var message = jsFormatter.getStepFailureMessage(stepResult);
      expect(message).toEqual('theStack');
    });
  });

  describe('addFeature()', function() {
    it('adds a feature to the allFeatures list', function() {
      jsFormatter.addFeature({test:'feature'});
      expect(jsFormatter.allFeatures.features).toContain({test:'feature'});
    });
  });

  describe('addScenario()', function() {
    it('adds a scenario to the current feature', function() {
      jsFormatter.currentFeature = {scenarios: []}
      jsFormatter.addScenario({test:'scenario'});
      expect(jsFormatter.currentFeature.scenarios).toContain({test:'scenario'});
    });
  });

  describe('addStep()', function() {
    it('adds a step to the current scenario', function() {
      jsFormatter.currentScenario = {steps: []}
      jsFormatter.addStep({test:'step'});
      expect(jsFormatter.currentScenario.steps).toContain({test:'step'});
    });
  });

});
