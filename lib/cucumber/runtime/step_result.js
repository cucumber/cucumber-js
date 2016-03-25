function StepResult(payload) {
  var self = {
    getAmbiguousStepDefinitions: function getAmbiguousStepDefinitions() {
      return payload.ambiguousStepDefinitions;
    },

    getAttachments: function getAttachments() {
      return payload.attachments;
    },

    getDuration: function getDuration() {
      return payload.duration;
    },

    getFailureException: function getFailureException() {
      return payload.failureException;
    },

    getPendingReason: function getPendingReason() {
      return payload.pendingReason;
    },

    getStep: function getStep() {
      return payload.step;
    },

    getStepDefinition: function getStepDefinition() {
      return payload.stepDefinition;
    },

    getStatus: function getStatus() {
      return payload.status;
    },

    hasAttachments: function hasAttachments() {
      return payload.attachments && payload.attachments.length > 0;
    }
  };

  return self;
}

module.exports = StepResult;
