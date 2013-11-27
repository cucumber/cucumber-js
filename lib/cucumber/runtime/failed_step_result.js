var FailedStepResult = function(payload) {
  var Cucumber = require('../../cucumber');

  var self = Cucumber.Runtime.StepResult(payload);

  self.isFailed = function isFailed() { return true; };

  self.getFailureException = function getFailureException() {
    return payload.failureException;
  };

  self.getDuration = function getDuration() {
    return payload.duration;
  };

  return self;
};
module.exports = FailedStepResult;
