if (typeof define !== 'function') { var define = require('amdefine')(module); }
define(["require"], function(require) {
var SuccessfulStepResult = function(payload) {
  var Runtime = require('../runtime');

  var self = Runtime.StepResult(payload);

  self.isSuccessful = function isSuccessful() { return true; };

  return self;
};
return SuccessfulStepResult;
});
