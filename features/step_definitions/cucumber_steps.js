var cucumberSteps = function() {
  var shouldPrepare = true;
  var featureSource;
  var stepDefinitions;
  var touchedSteps;
  var lastRunSucceeded;
  var lastRunOutput;

  Given(/^a scenario "([^"]*)" with:$/, function(scenarioName, steps, callback) {
    prepare();
    featureSource += "Feature: A feature\n";
    featureSource += "  Scenario: " + scenarioName + "\n";
    featureSource += steps.replace(/^/gm, '    ');
    callback();
  });

  Given(/^the step "([^"]*)" has a passing mapping$/, function(stepName, callback) {
    prepare();
    stepDefinitions += "Given(/^" + stepName + "$/, function(callback) {\
  touchStep(\"" + stepName + "\");\
  callback();\
});\n";
    callback();
  });

  Given(/^the step "([^"]*)" has a failing mapping$/, function(stepName, callback) {
    prepare();
    stepDefinitions += "Given(/^" + stepName + "$/, function(callback) {\
  touchStep(\"" + stepName + "\");\
  throw('I was supposed to fail.');\
});\n";
    callback();
  });

  Given(/^the step "([^"]*)" has a pending mapping$/, function(stepName, callback) {
    prepare();
    stepDefinitions += "Given(/^" + stepName + "$/, function(callback) {\
  touchStep(\"" + stepName + "\");\
  callback.pending('I am pending.');\
});\n";
    callback();
  });

  Given(/^the following feature:$/, function(feature, callback) {
    prepare();
    featureSource = feature;
    callback();
  });

  When(/^Cucumber executes the scenario "([^"]*)"$/, function(scenarioName, callback) {
    runFeature(callback);
  });

  When(/^Cucumber runs the feature$/, function(callback) {
    runFeature(callback);
  });

  When(/^Cucumber runs the scenario with steps for a calculator$/, function(callback) {
    RpnCalculator = require('../support/rpn_calculator');
    supportCode = function() { require('./calculator_steps')(RpnCalculator) };
    runFeatureWithSupportCodeSource(supportCode, callback);
  });

  Then(/^the scenario passes$/, function(callback) {
    if (!lastRunSucceeded)
      throw("Expected the scenario to pass but it failed");
    callback();
  });

  Then(/^the scenario fails$/, function(callback) {
    assertFailedScenario();
    callback();
  });

  Then(/^the scenario is pending$/, function(callback) {
    assertPendingScenario();
    callback();
  });

  Then(/^the scenario is undefined$/, function(callback) {
    assertUndefinedScenario();
    callback();
  });

  Then(/^the step "([^"]*)" is skipped$/, function(stepName, callback) {
    assertSkippedStep(stepName);
    callback();
  });

  Then(/^the feature passes$/, function(callback) {
    assertPassingFeature();
    callback();
  });

  function prepare() {
    if (shouldPrepare) {
      shouldPrepare = false;
      touchedSteps    = [];
      featureSource   = "";
      stepDefinitions = "";
    }
  }

  function runFeature(callback) {
    var supportCode;
    var supportCodeSource = "supportCode = function() {\n" + stepDefinitions + "};\n";
    eval(supportCodeSource);
    runFeatureWithSupportCodeSource(supportCode, callback);
  }

  function runFeatureWithSupportCodeSource(supportCode, callback) {
    var Cucumber          = require('../../lib/cucumber');
    var cucumber          = Cucumber(featureSource, supportCode);
    var formatter         = Cucumber.Listener.ProgressFormatter({logToConsole: false});
    cucumber.attachListener(formatter);
    cucumber.start(function(succeeded) {
      lastRunSucceeded = succeeded;
      lastRunOutput    = formatter.getLogs();
      Cucumber.Debug.notice(lastRunOutput, 'cucumber output', 5);
      shouldPrepare = true;
      callback();
    });
  }

  function touchStep(string) {
    touchedSteps.push(string);
  }

  function isStepTouched(pattern) {
    return (touchedSteps.indexOf(pattern) >= 0);
  }

  function assertPassingFeature() {
    assertNoPartialOutput("failed", lastRunOutput);
    assertSuccess();
  }

  function assertFailedScenario() {
    assertPartialOutput("1 scenario (1 failed)", lastRunOutput);
    assertFailure();
  }

  function assertPendingScenario() {
    assertPartialOutput("1 scenario (1 pending)", lastRunOutput);
    assertSuccess();
  }

  function assertUndefinedScenario() {
    assertPartialOutput("1 scenario (1 undefined)", lastRunOutput);
    assertSuccess();
  }

  function assertSkippedStep(stepName) {
    if (isStepTouched(stepName))
      throw("Expected step \"" + stepName + "\" to have been skipped.");
  }

  function assertSuccess() {
    if (!lastRunSucceeded)
      throw("Expected Cucumber to succeed but it failed.");
  }

  function assertFailure() {
    if (lastRunSucceeded)
      throw("Expected Cucumber to fail but it succeeded.");
  }

  function assertPartialOutput(expected, actual) {
    if (actual.indexOf(expected) < 0)
      throw("Expected:\n\"" + actual + "\"\nto match:\n\"" + expected + "\"");
  }

  function assertNoPartialOutput(expected, actual) {
    if (actual.indexOf(expected) >= 0)
      throw("Expected:\n\"" + actual + "\"\nnot to match:\n\"" + expected + "\"");
  }
};
module.exports = cucumberSteps;
