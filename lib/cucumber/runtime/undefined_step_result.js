if (typeof define !== 'function') { var define = require('amdefine')(module); }
define([], function() {
var UndefinedStepResult = function(payload) {
  var Cucumber = require('../../cucumber');

  var self = Cucumber.Runtime.StepResult(payload);

  self.isUndefined = function isUndefined() { return true; };

  return self;
};
return UndefinedStepResult;
});
