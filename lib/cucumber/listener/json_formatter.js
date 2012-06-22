var JsonFormatter = function(options) {

  var currentFeatureId = '';
  var currentFeatureIndex = null;

  var output = [];
  
  var self = {

    getOutput: function getOutput() {
      return output;      
    },

    getCurrentFeatureIndex: function getCurrentFeatureIndex() {
      return currentFeatureIndex;
    },

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
      if (currentFeatureIndex == null) {
        currentFeatureIndex = 0;
      } else {
        currentFeatureIndex+=1;
      }

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

      if (!("elements" in output[currentFeatureIndex])) {
        output[currentFeatureIndex]["elements"] = [];
      }

      output[currentFeatureIndex]["elements"].push(scenarioOutput);

      callback();
    },

    handleStepResultEvent: function handleStepResult(event, callback) {
      var stepResult = event.getPayloadItem('stepResult');

      if (output.length == 0) {
        // There is no parent scenario so create an empty element to contain the step
        var parent_element = {};
        output.push(parent_element);
      }

      if (currentFeatureIndex == null) {
        currentFeatureIndex = 0;
      }

      if (!("elements" in output[currentFeatureIndex])) {
        var element = {steps: []};
        output[currentFeatureIndex]["elements"] = []; //TODO: Make Dry
        output[currentFeatureIndex]["elements"].push(element);
      }     

      var element = output[currentFeatureIndex]["elements"][output[currentFeatureIndex]["elements"].length-1]

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
      // TODO: Factor this out and get rid of magic number
      process.stdout.write(JSON.stringify(output, null, 2));
      callback();
    }

  };
  return self;
};

// TODO: Factor out to make common to all handlers
JsonFormatter.EVENT_HANDLER_NAME_PREFIX = 'handle';
JsonFormatter.EVENT_HANDLER_NAME_SUFFIX = 'Event';

module.exports                              = JsonFormatter;
