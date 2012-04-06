if (typeof define !== 'function') { var define = require('amdefine')(module); }
define([], function() {
var SkippedStepResult = function(payload) {
  var self = {
    isFailed:     function isFailed()     { return false; },
    isPending:    function isPending()    { return false; },
    isSkipped:    function isSkipped()    { return true; },
    isSuccessful: function isSuccessful() { return false; },
    isUndefined:  function isUndefined()  { return false; },

    getStep: function getStep() {
      return payload['step'];
    }
  };
  return self;
};
return SkippedStepResult;
});
