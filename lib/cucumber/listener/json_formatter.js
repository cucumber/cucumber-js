var JsonFormatter = function(options) {
  var Cucumber = require('../../cucumber');

  var currentFeatureId = '';

  var output = [];
  
  var self = {

    hear: function hear(event, callback) {
      
      if (self.hasHandlerForEvent(event)) {
        var handler = self.getHandlerForEvent(event);
        handler(event, callback);
      } else {
        callback();      
      }
    },

    hasHandlerForEvent: function hasHandlerForEvent(event) {
      var handlerName = self.buildHandlerNameForEvent(event);
      return self[handlerName] != undefined;
    },

    buildHandlerNameForEvent: function buildHandlerNameForEvent(event) {
      var handlerName =
        JsonFormatter.EVENT_HANDLER_NAME_PREFIX +
        event.getName() +
        JsonFormatter.EVENT_HANDLER_NAME_SUFFIX;
      return handlerName;
    },

    getHandlerForEvent: function getHandlerForEvent(event) {
      var eventHandlerName = self.buildHandlerNameForEvent(event);
      return self[eventHandlerName];
    },

    handleBeforeFeatureEvent: function handleBeforeFeatureEvent(event, callback) {

      var feature = event.getPayloadItem('feature');
      currentFeatureId = feature.getName().replace(' ','-');

      var element = {
        id: currentFeatureId,
        name: feature.getName(),
        description: feature.getDescription(),
        line: feature.getLine(),
        keyword: feature.getKeyword(),
        uri: feature.getUri()
      }
      output.push(element);

      callback();
    },


    handleBeforeScenarioEvent: function handleBeforeScenarioEvent(event, callback) {

      var scenario = event.getPayloadItem('scenario');

      var id = currentFeatureId + ';' + scenario.getName().replace(/ /g, '-').toLowerCase();

      var scenarioOutput = {};
      scenarioOutput["name"]= scenario.getName();
      scenarioOutput["id"]= id;
      scenarioOutput["line"]= scenario.getLine();
      scenarioOutput["keyword"]= scenario.getKeyword();
      scenarioOutput["description"]= scenario.getDescription();
      scenarioOutput["type"]= "scenario";

      if (!("elements" in output[0])) {
        output[0]["elements"] = [];
      }

      output[0]["elements"].push(scenarioOutput);

      callback();
    },

    handleStepResultEvent: function handleStepResult(event, callback) {
      var stepResult = event.getPayloadItem('stepResult');

      if (!("elements" in output[0])) {
        output[0]["elements"] = []; //TODO: Make Dry
      }     

      var element = output[0]["elements"][output[0]["elements"].length-1]
      if (!element["steps"]) {
        element["steps"] = [];
      }

      var step = stepResult.getStep();

      var stepOutput = {};
      stepOutput["name"] = step.getName();
      stepOutput["line"] = step.getLine();
      stepOutput["keyword"] = step.getKeyword();

      stepOutput["result"] = {}

      var resultStatus = "failed";

      if (stepResult.isSuccessful()) {
        resultStatus = "passed";
      }
      else if (stepResult.isPending()) {
        resultStatus = "pending";
        stepOutput["result"]["error_message"] = 'TODO';
      }
      else if (stepResult.isSkipped()) {
        resultStatus = "skipped";
      }
      else if (stepResult.isUndefined()) {
        resultStatus = "undefined";
      }
      else {
        var failureMessage = stepResult.getFailureException();
        stepOutput["result"]["error_message"] = (failureMessage.stack || failureMessage);
      }

      stepOutput["result"]["status"] = resultStatus
      stepOutput["match"] = {location:"TODO"}
      element["steps"].push(stepOutput);

      callback();
    },

    handleAfterFeaturesEvent: function handleAfterFeaturesEvent(event, callback) {
      process.stdout.write(JSON.stringify(output, null, 2));
      callback();
    },

    handleAfterScenarioEvent: function handleAfterScenarioEvent(event, callback) {
      callback();
    },

  };
  return self;
};

// TODO: Factor out to make common to all handlers
JsonFormatter.EVENT_HANDLER_NAME_PREFIX = 'handle';
JsonFormatter.EVENT_HANDLER_NAME_SUFFIX = 'Event';

module.exports                              = JsonFormatter;
