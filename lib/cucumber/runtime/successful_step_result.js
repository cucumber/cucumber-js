var SuccessfulStepResult = function(payload) {
  var Cucumber = require('../../cucumber');

  var self = Cucumber.Runtime.StepResult(payload);

  self.isSuccessful = function isSuccessful() { return true; };

  self.getDuration = function getDuration() {
    return payload.duration;
  };

  return self;
};
module.exports = SuccessfulStepResult;
