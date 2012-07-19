var JsonFormatterWrapper = function(io) {

  var JSONFormatter = require('gherkin/lib/gherkin/formatter/json_formatter');
  var formatter = new JSONFormatter(io);

  var currentFeatureId = '';

  var Cucumber = require('../../cucumber');
  var self = Cucumber.Listener();

  function formatStep(step) {

    var stepProperties = {name: step.getName(), line: step.getLine(), keyword: step.getKeyword()};
    if (step.hasDocString()) {
      var docString = step.getDocString();
      stepProperties['doc_string'] = {value: docString.getContents(), line: docString.getLine(), content_type: docString.getContentType()};
    }

    formatter.step(stepProperties);

  }

  self.handleBeforeFeatureEvent = function handleBeforeFeatureEvent(event, callback) {

    var feature = event.getPayloadItem('feature');
    currentFeatureId = feature.getName().replace(' ','-');

    formatter.uri(feature.getUri());

    formatter.feature({id: currentFeatureId,
                       name: feature.getName(), 
                       description: feature.getDescription(), 
                       line: feature.getLine(),
                       keyword: feature.getKeyword()});

    callback();
  }

  self.handleBackgroundEvent = function handleBackgroundEvent(event, callback) {
    var background = event.getPayloadItem('background');
    formatter.background({name: background.getName(), keyword: "Background", description: background.getDescription(), type: "background", line: background.getLine()})
    var steps = background.getSteps();
    steps.forEach(function(value, index, ar) { formatStep(value); });
    callback();      
  }

  self.handleBeforeScenarioEvent = function handleBeforeScenarioEvent(event, callback) {

    var scenario = event.getPayloadItem('scenario');

    var id = currentFeatureId + ';' + scenario.getName().replace(/ /g, '-').toLowerCase();

    formatter.scenario({name: scenario.getName(), id: id, line: scenario.getLine(), keyword: "Scenario",  description: scenario.getDescription(), type: "scenario"});

    callback();
  }

  self.handleStepResultEvent = function handleStepResult(event, callback) {
    var stepResult = event.getPayloadItem('stepResult');

    var step = stepResult.getStep();
    formatStep(step);

    var stepOutput = {};
    var resultStatus = 'failed';

    if (stepResult.isSuccessful()) {
      resultStatus = 'passed';
    }
    else if (stepResult.isPending()) {
      resultStatus = 'pending';
      stepOutput['error_message'] = 'TODO';
    }
    else if (stepResult.isSkipped()) {
      resultStatus = 'skipped';
    }
    else if (stepResult.isUndefined()) {
      resultStatus = 'undefined';
    }
    else {
      var failureMessage = stepResult.getFailureException();
      stepOutput['error_message'] = (failureMessage.stack || failureMessage);
    }

    stepOutput['status'] = resultStatus;

    formatter.result(stepOutput);      
    formatter.match({location: 'TODO'});
    callback();
  }

  self.handleAfterFeaturesEvent = function handleAfterFeaturesEvent(event, callback) {

    formatter.eof();
    formatter.done();

    callback();
  }

  return self;
};

module.exports = JsonFormatterWrapper;

