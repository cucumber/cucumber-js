var StepDefinition = function(regexp, code) {
  var Cucumber = require('../../cucumber');

  var self = {
    matchesStepName: function matchesStepName(stepName) {
      return regexp.test(stepName);
    },

    invoke: function invoke(stepName, docString, callback) {
      var codeCallback = function() {
        var successfulStepResult = Cucumber.Runtime.SuccessfulStepResult();
        callback(successfulStepResult);
      };
      codeCallback.pending = function pending(reason) {
        throw Cucumber.Runtime.PendingStepException(reason);
      };

      var parameters = self.buildInvocationParameters(stepName, docString, codeCallback);
      try {
        code.apply(undefined, parameters);
      } catch (err) {
        var stepResult = (err instanceof Cucumber.Runtime.PendingStepException) ?
          Cucumber.Runtime.PendingStepResult() :
          Cucumber.Runtime.FailedStepResult();
        callback(stepResult);
      }
    },

    buildInvocationParameters: function buildInvocationParameters(stepName, docString, callback) {
      var parameters = regexp.exec(stepName);
      parameters.shift();
      if (docString) {
        var string = docString.getString();
        parameters.push(string);
      }
      parameters.push(callback);
      return parameters;
    }
  };
  return self;
};
module.exports = StepDefinition;
