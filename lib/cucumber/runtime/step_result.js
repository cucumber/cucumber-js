var StepResult = function (payload) {
  var self = {
    isFailed:     function isFailed()     { return false; },
    isPending:    function isPending()    { return false; },
    isSkipped:    function isSkipped()    { return false; },
    isSuccessful: function isSuccessful() { return false; },
    isUndefined:  function isUndefined()  { return false; },

    getStep: function getStep() {
      return payload.step;
    },

    getDuration: function getDuration() {
      return payload.duration;
    }
  };

  return self;
};

module.exports = StepResult;