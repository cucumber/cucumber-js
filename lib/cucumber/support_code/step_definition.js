function StepDefinition(pattern, code) {
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
        regexp = new RegExp(regexpString);
      }
      else
        regexp = pattern;
      return regexp;
    },

    matchesStepName: function matchesStepName(stepName) {
      var regexp = self.getPatternRegexp();
      return regexp.test(stepName);
    },

    invoke: function invoke(step, world, scenario, stepDomain, callback) {
      function time() {
        if (typeof process !== 'undefined' && process.hrtime) {
          return process.hrtime();
        }
        else {
          return new Date().getTime();
        }
      }

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
      var timeoutId;

      var finish = function finish(result) {
        Cucumber.Debug.notice('cleaning up after step (domain ' + stepDomain.id + ')\n', 'Cucumber.SupportCode.StepDefinition', 5);
        Cucumber.Util.Exception.unregisterUncaughtExceptionHandler(handleException, stepDomain);
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        callback(result);
        callback = function() {};
      };

      var codeCallback = self.buildCodeCallback(function (error) {
        Cucumber.Debug.notice('stepdef calling back (via callback(...))\n', 'Cucumber.SupportCode.StepDefinition', 5);
        if (error) {
          codeCallback.fail(error);
        } else {
          var duration = durationInNanoseconds(start);
          var successfulStepResult = Cucumber.Runtime.SuccessfulStepResult({step: step, duration: duration, attachments: scenario.getAttachments()});
          finish(successfulStepResult);
        }
      });

      codeCallback.pending = function pending(reason) {
        Cucumber.Debug.notice('stepdef calling back (via callback.pending())\n', 'Cucumber.SupportCode.StepDefinition', 5);
        var pendingStepResult = Cucumber.Runtime.PendingStepResult({step: step, pendingReason: reason, attachments: scenario.getAttachments()});
        finish(pendingStepResult);
      };

      codeCallback.fail = function fail(failureReason) {
        Cucumber.Debug.notice('stepdef calling back (via callback.fail(...))\n', 'Cucumber.SupportCode.StepDefinition', 5);
        var failureException = failureReason || new Error(StepDefinition.UNKNOWN_STEP_FAILURE_MESSAGE);
        var duration = durationInNanoseconds(start);
        var failedStepResult = Cucumber.Runtime.FailedStepResult({step: step, failureException: failureException, duration: duration, attachments: scenario.getAttachments()});
        finish(failedStepResult);
      };

      var parameters      = self.buildInvocationParameters(step, scenario, codeCallback);
      var handleException = self.buildExceptionHandlerToCodeCallback(codeCallback, stepDomain);

      function onPromiseFulfilled() { codeCallback(); }
      function onPromiseRejected(error) {
        codeCallback(error || new Error(StepDefinition.UNKNOWN_STEP_FAILURE_MESSAGE));
      }

      function initializeTimeout(milliseconds) {
        timeoutId = setTimeout(function(){
          codeCallback(new Error('Step timed out after ' + milliseconds + ' milliseconds'));
        }, milliseconds);
      }

      Cucumber.Util.Exception.registerUncaughtExceptionHandler(handleException, stepDomain);

      try {
        var defaultTimeout = world.timeout();
        var result = code.apply(world, parameters);
        var stepSpecificTimeout = world.timeout();
        world.timeout(defaultTimeout);
        var callbackOmitted = code.length < parameters.length;
        if (result && typeof result.then === 'function') {
          result.then(onPromiseFulfilled, onPromiseRejected);
          initializeTimeout(stepSpecificTimeout);
        } else if (callbackOmitted) {
          codeCallback();
        } else {
          initializeTimeout(stepSpecificTimeout);
        }
      } catch (exception) {
        handleException(exception);
      }
    },

    buildCodeCallback: function buildCodeCallback(callback) {
      return callback;
    },

    buildInvocationParameters: function buildInvocationParameters(step, scenario, callback) {
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

    buildExceptionHandlerToCodeCallback: function buildExceptionHandlerToCodeCallback(codeCallback, stepDomain) {
      var exceptionHandler = function handleScenarioException(exception) {
        if (exception)
          Cucumber.Debug.warn(exception.stack || exception, 'exception inside feature (domain ' + stepDomain.id + ')', 3);
        codeCallback.fail(exception);
      };
      return exceptionHandler;
    }
  };
  return self;
}

StepDefinition.DOLLAR_PARAMETER_REGEXP              = /\$[a-zA-Z_-]+/g;
StepDefinition.DOLLAR_PARAMETER_SUBSTITUTION        = '(.*)';
StepDefinition.PREVIOUS_REGEXP_MATCH                = '\\$&';
StepDefinition.QUOTED_DOLLAR_PARAMETER_REGEXP       = /"\$[a-zA-Z_-]+"/g;
StepDefinition.QUOTED_DOLLAR_PARAMETER_SUBSTITUTION = '"([^"]*)"';
StepDefinition.STRING_PATTERN_REGEXP_PREFIX         = '^';
StepDefinition.STRING_PATTERN_REGEXP_SUFFIX         = '$';
StepDefinition.UNSAFE_STRING_CHARACTERS_REGEXP      = /[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\|]/g;
StepDefinition.UNKNOWN_STEP_FAILURE_MESSAGE         = 'Step failure';

module.exports = StepDefinition;
