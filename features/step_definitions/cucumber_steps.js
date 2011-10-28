var cucumberSteps = function() {
  var Given = When = Then = this.defineStep;

  this.World = require('./cucumber_world');

  Given(/^a scenario with:$/, function(steps, callback) {
    this.featureSource += "Feature: A feature\n";
    this.featureSource += "  Scenario: A scenario\n";
    this.featureSource += steps.replace(/^/gm, '    ');
    callback();
  });

  Given(/^the step "([^"]*)" has a passing mapping$/, function(stepName, callback) {
    this.stepDefinitions += "Given(/^" + stepName + "$/, function(callback) {\
  world.touchStep(\"" + stepName + "\");\
  callback();\
});\n";
    callback();
  });

  Given(/^the step "([^"]*)" has a failing mapping$/, function(stepName, callback) {
    this.stepDefinitions += "Given(/^" + stepName + "$/, function(callback) {\
  world.touchStep(\"" + stepName + "\");\
  throw(new Error('I was supposed to fail.'));\
});\n";
    callback();
  });

  Given(/^the step "([^"]*)" has a mapping failing with the message "([^"]*)"$/, function(stepName, message, callback) {
    this.stepDefinitions += "Given(/^" + stepName + "$/, function(callback) {\
  world.touchStep(\"" + stepName + "\");\
  throw(new Error('" + message + "'));\
});\n";
    callback();
  });

  Given(/^the step "([^"]*)" has a pending mapping$/, function(stepName, callback) {
    this.stepDefinitions += "Given(/^" + stepName + "$/, function(callback) {\
  world.touchStep(\"" + stepName + "\");\
  callback.pending('I am pending.');\
});\n";
    callback();
  });

  Given(/^the following feature:$/, function(feature, callback) {
    this.featureSource = feature;
    callback();
  });

  When(/^Cucumber executes the scenario$/, function(callback) {
    this.runFeature(callback);
  });

  When(/^Cucumber runs the feature$/, function(callback) {
    this.runFeature(callback);
  });

  When(/^Cucumber runs the scenario with steps for a calculator$/, function(callback) {
    RpnCalculator = require('../support/rpn_calculator');
    var supportCode = function() { require('./calculator_steps').initialize.call(this, RpnCalculator) };
    this.runFeatureWithSupportCodeSource(supportCode, callback);
  });

  Then(/^the scenario passes$/, function(callback) {
    this.assertPassedScenario();
    callback();
  });

  Then(/^the scenario fails$/, function(callback) {
    this.assertFailedScenario();
    callback();
  });

  Then(/^the scenario is pending$/, function(callback) {
    this.assertPendingScenario();
    callback();
  });

  Then(/^the scenario is undefined$/, function(callback) {
    this.assertUndefinedScenario();
    callback();
  });

  Then(/^the scenario called "([^"]*)" is reported as failing$/, function(scenarioName, callback) {
    this.assertScenarioReportedAsFailing(scenarioName);
    callback();
  });

  Then(/^the scenario called "([^"]*)" is not reported as failing$/, function(scenarioName, callback) {
    this.assertScenarioNotReportedAsFailing(scenarioName);
    callback();
  });

  Then(/^the step "([^"]*)" passes$/, function(stepName, callback) {
    this.assertPassedStep(stepName);
    callback();
  });


  Then(/^the step "([^"]*)" is skipped$/, function(stepName, callback) {
    this.assertSkippedStep(stepName);
    callback();
  });

  Then(/^the feature passes$/, function(callback) {
    this.assertPassedFeature();
    callback();
  });

  Then(/^the failure message "([^"]*)" is output$/, function(message, callback) {
    this.assertFailureMessage(message);
    callback();
  });
};
module.exports = cucumberSteps;
