var FailedStepResult = function(failureException) {
  var self = {
    isFailed:     function isFailed()     { return true; },
    isPending:    function isPending()    { return false; },
    isSkipped:    function isSkipped()    { return false; },
    isSuccessful: function isSuccessful() { return false; },
    isUndefined:  function isUndefined()  { return false; },

    getFailureException: function getFailureException() {
      return failureException;
    }
  };
  return self;
};
module.exports = FailedStepResult;
