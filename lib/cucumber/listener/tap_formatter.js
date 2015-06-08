var tape = require('tape');
var test;
var currentStep;

function TapFormatter(options) {
  var Cucumber = require('../../cucumber');

  var self = Cucumber.Listener.Formatter(options);

  self.hear = function hear(event, callback) {
    if (typeof event === 'undefined') {
      callback();
      return;
    }

    var eventName = event.getName();
    switch (eventName) {

      case 'BeforeFeature':
        callback();
        break;

      case 'AfterFeature':
        callback();
        break;

      case 'BeforeScenario':
        var scenario = event.getPayloadItem('scenario');

        if (test) {
          test.test(scenario.getName(), function(t) {
            test = t;
            callback();
          });
        } else {
          tape(scenario.getName(), function(t) {
            test = t;
            test.end();
            callback();
          });
        }
        break;

      case 'BeforeStep':
        var step = event.getPayloadItem('step');
        currentStep = step;
        callback();
        break;

      case 'StepResult':
        var stepResult = event.getPayloadItem('stepResult');

        if (typeof currentStep === 'undefined') {
          callback();
          return;
        }

        if (stepResult.isSuccessful()) {
          test.pass(currentStep.getName());
        } else if (stepResult.isPending()) {
          test.skip(currentStep.getName());
        } else if (stepResult.isUndefined() || stepResult.isSkipped()) {
          test.skip(currentStep.getName());
        } else {
          var error = stepResult.getFailureException();
          var errorMessage = error.stack || error;
          test.fail(errorMessage);
        }
        callback();
        break;

      default:
        callback();
        break;
    }
  };

  return self;
}

module.exports = TapFormatter;
