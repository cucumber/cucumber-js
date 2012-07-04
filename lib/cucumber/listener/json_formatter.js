var JsonFormatter = function (options) {
  var Cucumber = require('../../cucumber');

  var self = Cucumber.Listener.Formatter(options);

  self.currentFeature = null;
  self.currentScenario = null;
  self.allFeatures = {
    features: []
  };

  self.handleAfterFeaturesEvent = function handleAfterFeaturesEvent(event, callback) {
    self.log(JSON.stringify(self.allFeatures));
    callback();
  };

  self.handleBeforeFeatureEvent = function handleBeforeFeatureEvent(event, callback) {
    var feature = event.getPayloadItem('feature');
    self.currentFeature = self.buildFeature(feature);
    callback();
  };

  self.handleAfterFeatureEvent = function handleAfterFeatureEvent(event, callback) {
    self.addFeature(self.currentFeature);
    callback();
  };

  self.handleBeforeScenarioEvent = function handleBeforeScenarioEvent(event, callback) {
    var scenario = event.getPayloadItem('scenario');
    self.currentScenario = self.buildScenario(scenario);
    self.addScenario(self.currentScenario);
    callback();
  };

  self.handleStepResultEvent = function handleStepResult(event, callback) {
    var stepResult = event.getPayloadItem('stepResult');
    var step = stepResult.getStep();
    var newStep = self.buildStep(stepResult, step);
    self.addStep(newStep);
    callback();
  };

  self.buildFeature = function(feature) {
    return {
      name: feature.getName(),
      description: feature.getDescription(),
      scenarios: []
    };
  };

  self.buildScenario = function(scenario) {
    return {
      name: scenario.getName(),
      description: scenario.getDescription(),
      steps: []
    };
  };

  self.buildStep = function(stepResult, step) {
    var result;
    var message;
    if (stepResult.isFailed()) {
      result = 'failed';
      message = self.getStepFailureMessage(stepResult);
    } else if (stepResult.isPending()) {
      result = 'pending';
    } else if (stepResult.isSkipped()) {
      result = 'skipped';
    } else if (stepResult.isSuccessful()) {
      result = 'successful';
    } else {
      result = 'undefined';
    }
    return {
      keyword: step.getKeyword(),
      name: step.getName(),
      result: result,
      message: message
    };
  };

  self.getStepFailureMessage = function(stepResult) {
    var failureException = stepResult.getFailureException();
    return failureException.stack || failureException;
  };

  self.addFeature = function(feature) {
    self.allFeatures.features.push(feature);
  };

  self.addScenario = function(scenario) {
    self.currentFeature.scenarios.push(scenario);
  };

  self.addStep = function(step) {
    self.currentScenario.steps.push(step);
  };

  return self;
};

module.exports = JsonFormatter;
