function StepResult(payload) {
  var self = {
    getAttachments: function getAttachments() {
      return payload.attachments;
    },

    getDuration: function getDuration() {
      return payload.duration;
    },

    getFailureException: function getFailureException() {
      return payload.failureException;
    },

    getStep: function getStep() {
      return payload.step;
    },

    getStatus: function getStatus() {
      return payload.status;
    },

    hasAttachments: function hasAttachments() {
      return payload.attachments.length > 0;
    }
  };

  return self;
}

module.exports = StepResult;
