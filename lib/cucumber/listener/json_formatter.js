/* jshint -W106 */
function JsonFormatter(options) {
  var Cucumber = require('../../cucumber');
  var base64 = require('base-64');

  var self = Cucumber.Listener.Formatter(options);

  var features = [];
  var currentFeature;
  var currentScenario;

  var formatTag = function formatTag(tag) {
    return {
      name: tag.getName(),
      line: tag.getLine()
    };
  };

  self.handleBeforeFeatureEvent = function handleBeforeFeatureEvent(event, callback) {
    var feature = event.getPayloadItem('feature');
    currentFeature = {
      description: feature.getDescription(),
      elements: [],
      id: feature.getName().replace(/ /g, '-').toLowerCase(),
      keyword: feature.getKeyword(),
      line: feature.getLine(),
      name: feature.getName(),
      tags: feature.getTags().map(formatTag),
      uri: feature.getUri()
    };
    features.push(currentFeature);
    callback();
  };

  self.handleBeforeScenarioEvent = function handleBeforeScenarioEvent(event, callback) {
    var scenario = event.getPayloadItem('scenario');
    currentScenario = {
      description: scenario.getDescription(),
      id: currentFeature.id + ';' + scenario.getName().replace(/ /g, '-').toLowerCase(),
      keyword: 'Scenario',
      line: scenario.getLine(),
      name: scenario.getName(),
      steps: [],
      tags: scenario.getTags().map(formatTag),
      type: 'scenario'
    };
    currentFeature.elements.push(currentScenario);
    callback();
  };

  self.handleStepResultEvent = function handleStepResultEvent(event, callback) {
    var stepResult = event.getPayloadItem('stepResult');
    var step = stepResult.getStep();
    var status = stepResult.getStatus();

    var currentStep = {
      arguments: step.getArguments().map(function(arg) {
        switch (arg.getType()) {
          case 'DataTable':
            return {
              rows: arg.raw().map(function (row) {
                return { cells: row };
              })
            };
          case 'DocString':
            return {
              line: arg.getLine(),
              content: arg.getContent(),
              contentType: arg.getContentType()
            };
          default:
            throw new Error('Unknown argument type:' + arg.getType());
        }
      }),
      keyword: step.getKeyword(),
      name: step.getName(),
      result: {
        status: status
      }
    };

    if (step.isHidden()) {
      currentStep.hidden = true;
    } else {
      currentStep.line = step.getLine();
    }

    if (status === Cucumber.Status.PASSED || status === Cucumber.Status.FAILED) {
      currentStep.result.duration = stepResult.getDuration();
    }

    if (stepResult.hasAttachments()) {
      currentStep.embeddings = stepResult.getAttachments().map(function (attachment) {
        return {
          data: base64.encode(attachment.getData()),
          mime_type: attachment.getMimeType(),
        };
      });
    }

    if (status === Cucumber.Status.FAILED) {
      var failureMessage = stepResult.getFailureException();
      if (failureMessage) {
        currentStep.result.error_message = (failureMessage.stack || failureMessage);
      }
    }

    var stepDefinition = stepResult.getStepDefinition();
    if (stepDefinition) {
      var location = stepDefinition.getUri() + ':' + stepDefinition.getLine();
      currentStep.match = {location: location};
    }

    currentScenario.steps.push(currentStep);
    callback();
  };

  self.handleAfterFeaturesEvent = function handleAfterFeaturesEvent(event, callback) {
    self.log(JSON.stringify(features, null, 2));
    self.finish(callback);
  };

  return self;
}

module.exports = JsonFormatter;
