var SuccessfulStepResult = function() {
  var self = {
    isSuccessful: function isSuccessful() { return true; },
    isPending:    function isPending()    { return false; },
    isFailed:     function isFailed()     { return false; }
  };
  return self;
};
module.exports = SuccessfulStepResult;
