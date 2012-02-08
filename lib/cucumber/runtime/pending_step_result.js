var PendingStepResult = function() {
  var self = {
    isFailed:     function isFailed()     { return false; },
    isPending:    function isPending()    { return true; },
    isSkipped:    function isSkipped()    { return false; },
    isSuccessful: function isSuccessful() { return false; },
    isUndefined:  function isUndefined()  { return false; }
  };
  return self;
};
module.exports = PendingStepResult;
