function FeaturesResult(strict) {
  var Cucumber = require('../../cucumber');

  var success = true;

  var self = {
    isSuccessful: function isSuccessful() {
      return success;
    },

    witnessStepResult: function witnessStepResult(stepResult) {
      var stepStatus = stepResult.getStatus();
      switch (stepStatus) {
        case Cucumber.Status.AMBIGUOUS:
        case Cucumber.Status.FAILED:
          success = false;
          break;
        case Cucumber.Status.PENDING:
        case Cucumber.Status.UNDEFINED:
          if (strict) {
            success = false;
          }
          break;
      }
    }
  };

  return self;
}

module.exports = FeaturesResult;
