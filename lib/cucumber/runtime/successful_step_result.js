if (typeof define !== 'function') { var define = require('amdefine')(module); }
define([], function() {
var SuccessfulStepResult = function() {
  var self = {
    isFailed:     function isFailed()     { return false; },
    isPending:    function isPending()    { return false; },
    isSkipped:    function isSkipped()    { return false; },
    isSuccessful: function isSuccessful() { return true; },
    isUndefined:  function isUndefined()  { return false; }
  };
  return self;
};
return SuccessfulStepResult;
});
