if (typeof define !== 'function') { var define = require('amdefine')(module); }
define(["require"], function(require) {
var PendingStepResult = function(payload) {
  var Runtime = require('../runtime');

  var self = Runtime.StepResult(payload);

  self.isPending = function isPending() { return true; };

  return self;
};
return PendingStepResult;
});
