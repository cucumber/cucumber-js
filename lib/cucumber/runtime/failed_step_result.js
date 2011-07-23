var FailedStepResult = function(status) {
  var self = {
    isSuccessful: function isSuccessful() { return false; },
    isPending:    function isPending()    { return false; },
    isFailed:     function isFailed()     { return true; }
  };
  return self;
};
module.exports = FailedStepResult;
