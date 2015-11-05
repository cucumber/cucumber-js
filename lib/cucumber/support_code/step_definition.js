function StepDefinition(pattern, options, code, uri, line) {
  var Cucumber = require('../../cucumber');

  function time() {
    if (typeof process !== 'undefined' && process.hrtime) {
      return process.hrtime();
    }
    else {
      return new Date().getTime();
    }
  }

  function durationInNanoseconds(start) {
    if (typeof process !== 'undefined' && process.hrtime) {
      var duration = process.hrtime(start);
      return duration[0] * 1e9 + duration[1];
    }
    else {
      return (new Date().getTime() - start) * 1e6;
    }
  }

  var self = {
    getLine: function getLine() {
      return line;
    },

    getPattern: function getPatternRegexp() {
      return pattern;
    },

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

    getUri: function getUri() {
      return uri;
    },

    matchesStepName: function matchesStepName(stepName) {
      var regexp = self.getPatternRegexp();
      return regexp.test(stepName);
    },

    invoke: function invoke(step, world, scenario, defaultTimeout, callback) {
      var start = time();
      var timeoutId;

      var finish = function finish(result) {
        Cucumber.Debug.notice('cleaning up after step\n', 'Cucumber.SupportCode.StepDefinition', 5);
        Cucumber.Util.Exception.unregisterUncaughtExceptionHandler(handleException);
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        callback(result);
        callback = function() {};
      };

      var codeCallback = self.buildCodeCallback(function (error) {
        Cucumber.Debug.notice('stepdef calling back (via callback(...))\n', 'Cucumber.SupportCode.StepDefinition', 5);
        var stepResultData = {
          step: step,
          stepDefinition: self,
          duration: durationInNanoseconds(start),
          attachments: scenario.getAttachments(),
          status: (error ? Cucumber.Status.FAILED : Cucumber.Status.PASSED)
        };

        if (error) {
          stepResultData.failureException = error || new Error(StepDefinition.UNKNOWN_STEP_FAILURE_MESSAGE);
        }

        var stepResult = Cucumber.Runtime.StepResult(stepResultData);
        finish(stepResult);
      });

      codeCallback.pending = function pending(reason) {
        Cucumber.Debug.notice('stepdef calling back (via callback.pending())\n', 'Cucumber.SupportCode.StepDefinition', 5);
        var pendingStepResult = Cucumber.Runtime.StepResult({
          step: step,
          stepDefinition: self,
          pendingReason: reason,
          attachments: scenario.getAttachments(),
          status: Cucumber.Status.PENDING
        });
        finish(pendingStepResult);
      };

      var parameters      = self.buildInvocationParameters(step, scenario, codeCallback);
      var handleException = self.buildExceptionHandlerToCodeCallback(codeCallback);

      function onPromiseFulfilled() { codeCallback(); }
      function onPromiseRejected(error) {
        codeCallback(error || new Error(StepDefinition.UNKNOWN_STEP_FAILURE_MESSAGE));
      }

      var timeoutInMilliseconds = options.timeout || defaultTimeout;

      function initializeTimeout() {
        timeoutId = setTimeout(function(){
          codeCallback(new Error('Step timed out after ' + timeoutInMilliseconds + ' milliseconds'));
        }, timeoutInMilliseconds);
      }

      Cucumber.Util.Exception.registerUncaughtExceptionHandler(handleException);

      var validCodeLengths = self.validCodeLengths(parameters);
      if (validCodeLengths.indexOf(code.length) === -1) {
        return codeCallback(new Error(self.invalidCodeLengthMessage(parameters)));
      }

      initializeTimeout();

      var result;
      try {
        result = code.apply(world, parameters);
      } catch (exception) {
        return handleException(exception);
      }

      var callbackInterface = code.length === parameters.length;
      var promiseInterface = result && typeof result.then === 'function';
      if (callbackInterface && promiseInterface) {
        codeCallback(new Error(self.getType() + ' accepts a callback and returns a promise'));
      } else if (promiseInterface) {
        result.then(onPromiseFulfilled, onPromiseRejected);
      } else if (!callbackInterface) {
        codeCallback();
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

    buildExceptionHandlerToCodeCallback: function buildExceptionHandlerToCodeCallback(codeCallback) {
      var exceptionHandler = function handleScenarioException(exception) {
        if (exception)
          Cucumber.Debug.warn(exception.stack || exception, 'exception inside feature', 3);
        codeCallback(exception);
      };
      return exceptionHandler;
    },

    validCodeLengths: function validCodeLengths (parameters) {
      return [parameters.length - 1, parameters.length];
    },

    invalidCodeLengthMessage: function invalidCodeLengthMessage(parameters) {
      return self.buildInvalidCodeLengthMessage(parameters.length - 1, parameters.length);
    },

    buildInvalidCodeLengthMessage: function buildInvalidCodeLengthMessage(syncOrPromiseLength, callbackLength) {
      return self.getType() + ' has ' + code.length + ' arguments' +
          ', should have ' + syncOrPromiseLength + ' (if synchronous or returning a promise)' +
          ' or '  + callbackLength + ' (if accepting a callback)';
    },

    getType: function getType () {
      return 'step definition';
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
