var Cucumber = require('../../../lib/cucumber');

var stepDefinitions = function() {
  var Given = When = Then = this.defineStep;

  var GIVEN_KEYWORD   = "Given";
  var WHEN_KEYWORD    = "When";
  var THEN_KEYWORD    = "Then";
  var _stepDefs       = [];
  var _finishedCuking = false;
  var _listener, _featureSource;
  var _recordedStepParameters;
  var _stepCallCount;

  // Creates a Given, When or Then step definition that does nothing and pass all the time.
  //
  // Matching groups:
  //   1. /Given|When|Then/ Step definition keyword (optional)
  //   2. /.*/              Step definition name
  //
  // Created step definition matching groups: none.
  //
  // The created step definition body should:
  //   1. Pass all the time.
  Given(/^a(?: "(Given|When|Then)")? step definition matching \/(.*)\/$/, function(keyword, name, callback) {
    var content = function(callback) { callback(); };
    _addStepDefinition(keyword, name, content);
    callback();
  });

  // Creates a Given, When or Then step definition that does nothing but fails all the time.
  //
  // Matching groups:
  //   1. /Given|When|Then/ Step definition keyword (optional)
  //   2. /.*/              Step definition name
  //   3. /.*/              Exception message
  //
  // Created step definition matching groups: none.
  //
  // The created step definition body should:
  //   1. Fail all the time.
  Given(/^a(?: "(Given|When|Then)")? step definition failing with message "(.*)" matching \/(.*)\/$/, function(keyword, errorMessage, name, callback) {
    var content = function(callback) { throw(new Error(errorMessage)); };
    _addStepDefinition(keyword, name, content);
    callback();
  });

  // Creates a When step definition that counts the calls it receives.
  //
  // Matching groups:
  //   1. /.*/ Step definition name
  //
  // Created step definition matching groups: none.
  //
  // The created step definition body should:
  //   1. Keep track of the number of calls it receives.
  Given(/^a step definition matching \/(.*)\/ counting its calls$/, function(name, callback) {
    var content = function(callback) {
      _stepCallCount++;
      callback();
    };
    _addStepDefinition(WHEN_KEYWORD, name, content);
    callback();
  });

  // Creates a When step definition that records the parameters it receives on the last call.
  //
  // Matching groups:
  //   1. /.*/ Step definition name
  //
  // Created step definition matching groups: none.
  //
  // The created step definition body should:
  //   1. Store all the parameters it receives on its last call;
  //   2. Pass all the time.
  Given(/^a step definition matching \/(.*)\/ recording its parameters$/, function(name, callback) {
    var content = function() {
      _recordedStepParameters = [];
      for(var i = 0; i < arguments.length - 1; i++) {
        _recordedStepParameters.push(arguments[i]);
      };
      var callback = arguments[arguments.length - 1];
      callback();
    };
    _addStepDefinition(WHEN_KEYWORD, name, content);
    callback();
  });

  // Creates a Then step definition that checks the value (2) of one parameter (1) passed to a
  // previous step that recorded its own parameters.
  //
  // Matching groups:
  //   1. /.*/ Step definition name
  //
  // Created step definition matching groups:
  //   1. /\d+/ The offset of the parameter
  //   2. /.*/  The expected value of the step parameter
  //
  // The created step definition body should:
  //   1. Compare the actual value against the expected value;
  //   2. Fail if the value mismatches, pass otherwise.
  Given(/^a step definition matching \/(.*)\/ checking a recorded parameter$/, function(name, callback) {
    var content = function(parameterOffset, expectedValue, callback) {
      var index       = translateParameterOffsetToIndex(parameterOffset);
      var actualValue = _recordedStepParameters[index];
      if (actualValue != expectedValue)
        throw(new Error("Expected " + parameterOffset + " parameter to be \"" + expectedValue + "\", got \"" + actualValue + "\"."));
      callback();
    };
    _addStepDefinition(THEN_KEYWORD, name, content);
    callback();
  });

  // Creates a Then step definition that checks the number of calls to the watched step.
  //
  // Matching groups:
  //   1. /.*/ Step definition name
  //
  // Created step definition matching groups:
  //   1. /.*/ The expected number of calls to the step.
  //
  // The created step definition body should:
  //   1. Compare the actual number of calls to the step against the expected count;
  //   2. Fail if the count don't match, pass otherwise.
  Given(/^a step definition matching \/(.*)\/ checking the number of step calls$/, function(name, callback) {
    var content = function(expectedNumberOfCalls, callback) {
      if (expectedNumberOfCalls != _stepCallCount)
        throw(new Error("Expected watched step to have been called " + expectedNumberOfCalls + " time(s); it was called " + _stepCallCount + " time(s)."));
      callback();
    };
    _addStepDefinition(THEN_KEYWORD, name, content);
    callback();
  });

  // Runs the passed feature against the step definitions created previously.
  // Fails when an error occur.
  //
  // Matching groups: none.
  // Multiline parameter: the feature to execute.
  When(/^I run the following feature:$/, function(featureSource, callback) {
    _buildListener(Cucumber.Debug.SimpleAstListener);
    _runFeature(featureSource, callback);
  });

  // Checks that the feature previously run succeeded.
  // Fails when Cucumber did not finish its process completly.
  // Fails when the output of the run feature does not match the feature.
  //
  // Matching groups: none.
  Then(/^the feature should have run successfully$/, function(callback) {
    if (!_finishedCuking)
      throw(new Error("Expected Cucumber to run the feature successfully."));
    var actualOutput   = _normalizeString(_listener.getLogs());
    var expectedOutput = _normalizeString(_featureSource);
    if (actualOutput.indexOf(expectedOutput) == -1)
      throw(UnexpectedOutputError(expectedOutput, actualOutput));
    callback();
  });

  // =======================================================
  // ======= Cucumber.js-specific step definitions =========
  // =======================================================

  Given(/^a step definition matching \/(.*)\/ calling back asynchronously after (\d+) milliseconds$/, function(name, delay, callback) {
    var content = function(callback) {
      setTimeout(callback, parseInt(delay));
    };
    _addStepDefinition(WHEN_KEYWORD, name, content);
    callback();
  });

  When(/^I run the following feature with the "progress" formatter:$/, function(featureSource, callback) {
    _buildListener(Cucumber.Listener.ProgressFormatter);
    _runFeature(featureSource, callback);
  });

  Then(/^the listener should output the following:$/, function(expectedOutput, callback) {
    var actualOutput   = _listener.getLogs();
    var expectedOutput = expectedOutput;
    if (actualOutput.indexOf(expectedOutput) == -1){
      throw(UnexpectedOutputError(expectedOutput, actualOutput));
    }
    callback();
  });

  // =======================================================
  // =====================  Helpers ========================
  // =======================================================

  function _runFeature(featureSource, callback) {
    var cucumber = Cucumber(featureSource, _getSupportCode);
    cucumber.attachListener(_listener);
    try {
      cucumber.start(function() {
        _finishedCuking = true;
        _featureSource = featureSource;
        callback();
      });
    } catch(error) {
      printInsideFeatureError(error);
      setTimeout(function() {
        throw(new Error("Step failed: Could not run the 'inside' feature successfully."));
      }, 10);
    };
  };

  function _buildListener(listenerConstructor) {
    _listener = listenerConstructor({logToConsole: false});
  };

  function _addStepDefinition(keyword, name, content) {
    var _stepName = RegExp(name);
    var stepDefinition;
    if (keyword == THEN_KEYWORD) {
      stepDefinition = function() { this.Then(_stepName, content); };
    } else if (keyword == WHEN_KEYWORD) {
      stepDefinition = function() { this.When(_stepName, content); };
    } else {
      stepDefinition = function() { this.Given(_stepName, content); };
    }
    _stepDefs.push(stepDefinition);
  };

  function _getSupportCode() {
    var supportCodeHelper = this;
    _stepDefs.forEach(function(defineStep) {
      defineStep.call(supportCodeHelper);
    });
  };

  function _normalizeString(string) {
    return string.replace(/\s+$/, '').replace(/\n\n/g, "\n");
  };

  function printInsideFeatureError(error) {
    var util = require('util');
    console.log("\n=================================================");
    console.log("=== Error caught while running inside feature ===");
    console.log("=================================================");
    console.log(error.toString());
    console.log("\n============== INSIDE FEATURE LOGS ==============");
    console.log(_listener.getLogs());
    console.log("\n===================== TRACE =====================");
    console.log(error.stack);
    console.log("==================================================\n");
  };

  function translateParameterOffsetToIndex(offset) {
    return parseInt(offset) - 1;
  };

  function UnexpectedOutputError(expected, actual) {
    return(new Error("Expected listener output is not met.\n\n<<<<<<< EXPECTED:\n" +
                     showSpacesOnString(expected) + "\n======= GOT:\n" + showSpacesOnString(actual) + "\n>>>>>>>"));
  };

  function showSpacesOnString(string) {
    return string.replace(/ /g, '·').replace(/\n/g, "¶\n");
  };
};

module.exports = stepDefinitions;
