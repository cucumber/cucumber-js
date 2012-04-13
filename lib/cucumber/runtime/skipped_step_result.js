var SkippedStepResult = function(payload) {
  var Cucumber = require('../../cucumber');

  var self = Cucumber.Runtime.StepResult(payload);

  self.isSkipped = function isSkipped() { return true; };

  return self;
};
module.exports = SkippedStepResult;
