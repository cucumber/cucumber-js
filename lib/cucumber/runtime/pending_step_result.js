define(["require"], function(require) {
var PendingStepResult = function(payload) {
  var Cucumber = require('../../cucumber');

  var self = Cucumber.Runtime.StepResult(payload);

  self.isPending = function isPending() { return true; };

  return self;
};
return PendingStepResult;
});
