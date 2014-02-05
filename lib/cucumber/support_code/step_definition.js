var StepDefinition = function (pattern, code) {
  var Cucumber = require('../../cucumber');

  var self = {
    getPatternRegexp: function getPatternRegexp() {
      var regexp;
      if (pattern.replace) {
        var regexpString = pattern
          .replace(StepDefinition.UNSAFE_STRING_CHARACTERS_REGEXP, StepDefinition.PREVIOUS_REGEXP_MATCH)
          .replace(StepDefinition.QUOTED_DOLLAR_PARAMETER_REGEXP, StepDefinition.QUOTED_DOLLAR_PARAMETER_SUBSTITUTION)
          .replace(StepDefinition.DOLLAR_PARAMETER_REGEXP, StepDefinition.DOLLAR_PARAMETER_SUBSTITUTION);
        regexpString =
          StepDefinition.STRING_PATTERN_REGEXP_PREFIX +
          regexpString +
          StepDefinition.STRING_PATTERN_REGEXP_SUFFIX;
        regexp = RegExp(regexpString);
      }
      else
        regexp = pattern;
      return regexp;
    },

    matchesStepName: function matchesStepName(stepName) {
      var regexp = self.getPatternRegexp();
      return regexp.test(stepName);
    },

    invoke: function invoke(step, world, callback) {
      var time = function time() {
        if (typeof process !== 'undefined' && process.hrtime) {
          return process.hrtime();
        }
        else {
          return new Date().getTime();
        }
      };

      var durationInNanoseconds = function durationInNanoseconds(start) {
        if (typeof process !== 'undefined' && process.hrtime) {
          var duration = process.hrtime(start);
          return duration[0] * 1e9 + duration[1];
        }
        else {
          return (new Date().getTime() - start) * 1e6;
        }
      };

      var start = time();

      var cleanUp = function cleanUp() {
        Cucumber.Util.Exception.unregisterUncaughtExceptionHandler(handleException);
      };

      var codeCallback = function (error) {
        if (error) {
          codeCallback.fail(error);
        } else {
          var duration = durationInNanoseconds(start);
          var successfulStepResult = Cucumber.Runtime.SuccessfulStepResult({step: step, duration:duration});
          cleanUp();
          callback(successfulStepResult);
        }
      };

      codeCallback.pending = function pending(reason) {
        var pendingStepResult = Cucumber.Runtime.PendingStepResult({step: step, pendingReason: reason});
        cleanUp();
        callback(pendingStepResult);
      };

      codeCallback.fail = function fail(failureReason) {
        var failureException = failureReason || new Error(StepDefinition.UNKNOWN_STEP_FAILURE_MESSAGE);
        var duration = durationInNanoseconds(start);
        var failedStepResult = Cucumber.Runtime.FailedStepResult({step: step, failureException: failureException, duration: duration});
        cleanUp();
        callback(failedStepResult);
      };

      var parameters      = self.buildInvocationParameters(step, codeCallback);
      var handleException = self.buildExceptionHandlerToCodeCallback(codeCallback);
      Cucumber.Util.Exception.registerUncaughtExceptionHandler(handleException);

      try {
        code.apply(world, parameters);
      } catch (exception) {
        handleException(exception);
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
    },

    buildExceptionHandlerToCodeCallback: function buildExceptionHandlerToCodeCallback(codeCallback) {
      var exceptionHandler = function handleScenarioException(exception) {
        if (exception)
          Cucumber.Debug.warn(exception.stack || exception, 'exception inside feature', 3);
        codeCallback.fail(exception);
      };
      return exceptionHandler;
    }
  };
  return self;
};

StepDefinition.DOLLAR_PARAMETER_REGEXP              = /\$[a-zA-Z_-]+/;
StepDefinition.DOLLAR_PARAMETER_SUBSTITUTION        = '(.*)';
StepDefinition.PREVIOUS_REGEXP_MATCH                = "\\$&";
StepDefinition.QUOTED_DOLLAR_PARAMETER_REGEXP       = /"\$[a-zA-Z_-]+"/;
StepDefinition.QUOTED_DOLLAR_PARAMETER_SUBSTITUTION = '"([^"]*)"';
StepDefinition.STRING_PATTERN_REGEXP_PREFIX         = '^';
StepDefinition.STRING_PATTERN_REGEXP_SUFFIX         = '$';
StepDefinition.UNSAFE_STRING_CHARACTERS_REGEXP      = /[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\|]/g;
StepDefinition.UNKNOWN_STEP_FAILURE_MESSAGE         = "Step failure";

module.exports = StepDefinition;
