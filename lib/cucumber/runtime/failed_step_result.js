var jsondiff = require('json-diff');

function FailedStepResult(payload) {
  var Cucumber = require('../../cucumber');

  var self = Cucumber.Runtime.StepResult(payload);

  self.isFailed = function isFailed() { return true; };

  self.getFailureException = function getFailureException() {
    return payload.failureException;
  };

  self.getFailureDescription = function getFailureDescription() {
    var exception = payload.failureException;
    if (exception.showDiff && exception.actual && exception.expected) {
      var delta = jsondiff.diffString(exception.expected, exception.actual)
      return exception.name + ': ' + exception.message + '\n' + delta + '\n' + exception.stack;
    } else {
      return exception.stack || exception;
    }
  };

  return self;
}

module.exports = FailedStepResult;
