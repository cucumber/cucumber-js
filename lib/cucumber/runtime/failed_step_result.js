var FailedStepResult = function(payload) {
  var Cucumber = require('../../cucumber');

  var self = Cucumber.Runtime.StepResult(payload);

  self.isFailed = function isFailed() { return true; };

  self.getFailureException = function getFailureException() {
    return payload.failureException;
  };

  return self;
};
module.exports = FailedStepResult;
