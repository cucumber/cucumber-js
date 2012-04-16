var UNKNOWN_STEP_FAILURE_MESSAGE = "Step failure";

var StepDefinition = function(pattern, code) {
  var Cucumber = require('../../cucumber');

  var constructor = function() {
    // Converts a string to a proper regular expression
    var parseRegexString = function( regexString ) {

      // Replace the $VARIABLES with the correct regex.
      regexString = regexString.replace(/\$[a-zA-Z0-9]+/g, '([^"]*)');
      return new RegExp( regexString );
    }

    if( typeof(regexp)=='string' ) {
      // regexp is a string, convert it to a regexp.
      regexp = parseRegexString(regexp);
    }
  }

  constructor();

  var self = {
    getPatternRegexp: function getPatternRegexp() {
      return pattern;
    },

    matchesStepName: function matchesStepName(stepName) {
      var regexp = self.getPatternRegexp();
      return regexp.test(stepName);
    },

    invoke: function invoke(step, world, callback) {
      var codeCallback = function() {
        var successfulStepResult = Cucumber.Runtime.SuccessfulStepResult({step: step});
        callback(successfulStepResult);
      };

      codeCallback.pending = function pending(reason) {
        var pendingStepResult = Cucumber.Runtime.PendingStepResult({step: step, pendingReason: reason});
        callback(pendingStepResult);
      };

      codeCallback.fail = function fail(failureReason) {
        var failureException = failureReason || new Error(UNKNOWN_STEP_FAILURE_MESSAGE);
        var failedStepResult = Cucumber.Runtime.FailedStepResult({step: step, failureException: failureException});
        callback(failedStepResult);
      };

      var parameters = self.buildInvocationParameters(step, codeCallback);
      try {
        code.apply(world, parameters);
      } catch (exception) {
        if (exception)
          Cucumber.Debug.warn(exception.stack || exception, 'exception inside feature', 3);
        codeCallback.fail(exception);
      }
    },

    buildInvocationParameters: function buildInvocationParameters(step, callback) {
      var stepName      = step.getName();
      var patternRegexp = self.getPatternRegexp();
      var parameters    = patternRegexp.exec(stepName);
      parameters.shift();
      if (step.hasAttachment()) {
        var attachmentContents = step.getAttachmentContents();
        parameters.push(attachmentContents);
      }
      parameters.push(callback);
      return parameters;
    }
  };
  return self;
};
module.exports = StepDefinition;
