var StepDefinition = function(regexp, code) {
  var Cucumber = require('../../cucumber');

  var constructor = function() {
    // Converts a string to a proper regular expression
    var parseRegexString = function( regexString ) {

      // Define the supported parametertypes.
      var replaceArray = {
        '%s': '([^"]*)',
        '%d': '(\\d+)',
        '%f': '(\\f+)'
      };

      // JavaScript does not have a replaceAll feature, here's one.
      var replaceAll = function( string, target, replacement ) {
        while( string.indexOf(target) != -1 ) {
          string = string.replace(target, replacement);
        }
        return string;
      }


      for( var i in replaceArray ) {
        regexString = replaceAll(regexString, i, replaceArray[i] );
      }

      return new RegExp( regexString );
    }

    if( typeof(regexp)=='string' ) {
      // regexp is a string, convert it to a regexp.
      regexp = parseRegexString(regexp);
    }
  }

  constructor();

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
        var pendingStepResult = Cucumber.Runtime.PendingStepResult(reason);
        callback(pendingStepResult);
      };

      codeCallback.fail = function fail(failureReason) {
        var failedStepResult = Cucumber.Runtime.FailedStepResult(failureReason);
        callback(failedStepResult);
      };

      var parameters = self.buildInvocationParameters(stepName, stepAttachment, codeCallback);
      try {
        code.apply(world, parameters);
      } catch (exception) {
        if (exception)
          Cucumber.Debug.warn(exception.stack || exception, 'exception inside feature', 3);
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
module.exports = StepDefinition;
