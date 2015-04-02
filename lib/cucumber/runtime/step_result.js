function StepResult(payload) {
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
    },

    hasAttachments: function hasAttachments() {
      return payload.attachments.length() > 0;
    },

    getAttachments: function getAttachments() {
      return payload.attachments;
    }
  };

  return self;
}

module.exports = StepResult;
