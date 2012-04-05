define(['../runtime', '../debug'], function(Runtime, Debug) {
var UNKNOWN_STEP_FAILURE_MESSAGE = "Step failure";

var StepDefinition = function(regexp, code) {

  var self = {
    matchesStepName: function matchesStepName(stepName) {
      return regexp.test(stepName);
    },

    invoke: function invoke(stepName, world, stepAttachment, callback) {
      var codeCallback = function() {
        var successfulStepResult = Runtime.SuccessfulStepResult();
        callback(successfulStepResult);
      };

      codeCallback.pending = function pending(reason) {
        var pendingStepResult = Runtime.PendingStepResult(reason);
        callback(pendingStepResult);
      };

      codeCallback.fail = function fail(failureReason) {
        var failedStepResult = Runtime.FailedStepResult(failureReason || new Error(UNKNOWN_STEP_FAILURE_MESSAGE));
        callback(failedStepResult);
      };

      var parameters = self.buildInvocationParameters(stepName, stepAttachment, codeCallback);
      try {
        code.apply(world, parameters);
      } catch (exception) {
        if (exception)
          Debug.warn(exception.stack || exception, 'exception inside feature', 3);
        codeCallback.fail(exception);
      }
    },

    buildInvocationParameters: function buildInvocationParameters(stepName, stepAttachment, callback) {
      var parameters = regexp.exec(stepName);
      parameters.shift();
      if (stepAttachment) {
        var contents = stepAttachment.getContents();
        parameters.push(contents);
      }
      parameters.push(callback);
      return parameters;
    }
  };
  return self;
};
return StepDefinition;
});
