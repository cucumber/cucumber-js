var StepDefinition = function(regexp, code) {
  var Cucumber = require('../../cucumber');

  var self = {
    matchesStepName: function matchesStepName(stepName) {
      return regexp.test(stepName);
    },

    invoke: function invoke(stepName, world, stepAttachment, callback) {
      var codeCallback = function() {
        var successfulStepResult = Cucumber.Runtime.SuccessfulStepResult();
        callback(successfulStepResult);
      };
      codeCallback.pending = function pending(reason) {
        throw Cucumber.Runtime.PendingStepException(reason);
      };

      var parameters = self.buildInvocationParameters(stepName, stepAttachment, codeCallback);
      try {
        code.apply(world, parameters);
      } catch (exception) {
        if (exception)
          Cucumber.Debug.warn(exception.stack || exception, 'exception inside feature', 3);
        var stepResult;
        if (exception instanceof Cucumber.Runtime.PendingStepException)
          stepResult = Cucumber.Runtime.PendingStepResult()
        else
          stepResult = Cucumber.Runtime.FailedStepResult(exception);
        callback(stepResult);
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
module.exports = StepDefinition;
