if (typeof define !== 'function') { var define = require('amdefine')(module); }
define([], function() {
var SkippedStepResult = function(payload) {
  var Cucumber = require('../../cucumber');

  var self = Cucumber.Runtime.StepResult(payload);

  self.isSkipped = function isSkipped() { return true; };

  return self;
};
return SkippedStepResult;
});
