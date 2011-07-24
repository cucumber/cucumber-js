var PendingStepResult = function() {
  var self = {
    isSuccessful: function isSuccessful() { return false; },
    isPending:    function isPending()    { return true; },
    isFailed:     function isFailed()     { return false; }
  };
  return self;
};
module.exports = PendingStepResult;
