var JsonFormatterWrapper = function(io) {

  // This seems a pretty ugly way refering to the gherkin json_formatter. QUESTION: Is there a more direct way of refering to it?
  // Does Gherkin have to export it in gherkin.js?
  var JSONFormatter = require('../../../node_modules/gherkin/lib/gherkin/formatter/json_formatter.js');

  var formatter = new JSONFormatter(process.stdout); // HACK!!! io);

  var currentFeatureId = '';

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
        JsonFormatterWrapper.EVENT_HANDLER_NAME_PREFIX +
        event.getName() +
        JsonFormatterWrapper.EVENT_HANDLER_NAME_SUFFIX;
      return handlerName;
    },

    getHandlerForEvent: function getHandlerForEvent(event) {
      var eventHandlerName = self.buildHandlerNameForEvent(event);
      return self[eventHandlerName];
    },

    handleBeforeFeatureEvent: function handleBeforeFeatureEvent(event, callback) {

      var feature = event.getPayloadItem('feature');
      currentFeatureId = feature.getName().replace(' ','-');

      formatter.uri(feature.getUri());

      formatter.feature({id: currentFeatureId,
                         name: feature.getName(), 
                         description: feature.getDescription(), 
                         line: feature.getLine(),
                         keyword: feature.getKeyword()});

      callback();
    },

    handleBeforeScenarioEvent: function handleBeforeScenarioEvent(event, callback) {

      var scenario = event.getPayloadItem('scenario');

      var id = currentFeatureId + ';' + scenario.getName().replace(/ /g, '-').toLowerCase();

      formatter.scenario({name: scenario.getName(), id: id, line: scenario.getLine(), keyword: "Scenario",  description: scenario.getDescription(), type:"scenario"});

      callback();
    },

    handleStepResultEvent: function handleStepResult(event, callback) {
      var stepResult = event.getPayloadItem('stepResult');

      var step = stepResult.getStep();

      formatter.step({name: step.getName(), line: step.getLine(), keyword: step.getKeyword()});

      var stepOutput = {};
      var resultStatus = "failed";

      if (stepResult.isSuccessful()) {
        resultStatus = "passed";
      }
      else if (stepResult.isPending()) {
        resultStatus = "pending";
        stepOutput["error_message"] = 'TODO';
      }
      else if (stepResult.isSkipped()) {
        resultStatus = "skipped";
      }
      else if (stepResult.isUndefined()) {
        resultStatus = "undefined";
      }
      else {
        var failureMessage = stepResult.getFailureException();
        stepOutput["error_message"] = (failureMessage.stack || failureMessage);
      }

      stepOutput["status"] = resultStatus

      formatter.result(stepOutput);      
      formatter.match({location: "TODO"});

      callback();
    },

    handleAfterFeaturesEvent: function handleAfterFeaturesEvent(event, callback) {

      formatter.eof();
      formatter.done();

      callback();
    }

  };
  return self;
};

// TODO: Factor out to make common to all handlers
JsonFormatterWrapper.EVENT_HANDLER_NAME_PREFIX = 'handle';
JsonFormatterWrapper.EVENT_HANDLER_NAME_SUFFIX = 'Event';

module.exports                              = JsonFormatterWrapper;

