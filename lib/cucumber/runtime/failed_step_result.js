if (typeof define !== 'function') { var define = require('amdefine')(module); }
define(["require"], function(require) {
var FailedStepResult = function(payload) {
  var Runtime = require('../runtime');

  var self = Runtime.StepResult(payload);

  self.isFailed = function isFailed() { return true; };

  self.getFailureException = function getFailureException() {
    return payload.failureException;
  };

  return self;
};

return FailedStepResult;
});
