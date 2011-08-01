var FailedStepResult = function(failureException) {
  var self = {
    isSuccessful: function isSuccessful() { return false; },
    isPending:    function isPending()    { return false; },
    isFailed:     function isFailed()     { return true; },

    getFailureException: function getFailureException() {
      return failureException;
    }
  };
  return self;
};
module.exports = FailedStepResult;
