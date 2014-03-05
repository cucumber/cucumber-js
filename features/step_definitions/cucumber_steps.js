var cucumberSteps = function() {
  var Given  = When = Then = this.defineStep;
  var World  = require('./cucumber_world').World;
  this.World = World;

  Given(/^a scenario with:$/, function(steps, callback) {
    this.addScenario("A scenario", steps);
    callback();
  });

  Given(/^the step "([^"]*)" has a passing mapping$/, function(stepName, callback) {
    this.addPassingStepDefinitionWithName(stepName, callback);
  });

  Given(/^a passing (before|after|around) hook$/, function(hookType, callback) {
    if (hookType == "before")
      this.addBeforeHook(callback);
    else if (hookType == "after")
      this.addAfterHook(callback);
    else
      this.addAroundHook(callback);
  });

  Given(/^the step "([^"]*)" has a failing mapping$/, function(stepName, callback) {
    this.addFailingMapping(stepName, {}, callback);
  });

  Given(/^the step "([^"]*)" has a mapping failing with the message "([^"]*)"$/, function(stepName, message, callback) {
    this.addFailingMapping(stepName, { message: message }, callback);
  });

  Given(/^the step "([^"]*)" has a mapping asynchronously failing with the message "([^"]*)"$/, function(stepName, message, callback) {
    this.stepDefinitions += "Given(/^" + stepName + "$/, function(callback) {\
  world.touchStep(\"" + stepName + "\");\
  setTimeout(function() {callback.fail(new Error('" + message + "'));}, 10);\
});\n";
    callback();
  });

  Given(/^the step "([^"]*)" has a mapping failing via a Node-like error construct$/, function(stepName, callback) {
    this.stepDefinitions += "Given(/^" + stepName + "$/, function(callback) {\
  world.touchStep(\"" + stepName + "\");\
  callback(new Error('#fail'));\
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

  Given(/^the step "([^"]*)" has an asynchronous pending mapping$/, function(stepName, callback) {
    this.stepDefinitions += "Given(/^" + stepName + "$/, function(callback) {\
world.touchStep(\"" + stepName + "\");\
setTimeout(callback.pending, 10);\
});\n";
    callback();
  });

  Given(/^a mapping with a string-based pattern$/, function(callback) {
    this.addStringBasedPatternMapping();
    callback();
  });

  Given(/^a mapping with a string-based pattern and parameters$/, function(callback) {
    this.addStringBasedPatternMappingWithParameters();
    callback();
  });

  Given(/^the following feature:$/, function(feature, callback) {
    this.featureSource = feature;
    callback();
  });

  Given(/^the step "([^"]*)" has a passing mapping that receives a data table$/, function(stepName, callback) {
    this.stepDefinitions += "Given(/^" + stepName + "$/, function(dataTable, callback) {\
  world.dataTableLog = dataTable.raw();\
  callback();\
});";
    callback();
  });

  Given(/^the step "([^"]*)" has a passing mapping that receives a doc string$/, function(stepName, callback) {
    this.stepDefinitions += "Given(/^" + stepName + "$/, function(docString, callback) {\
  world.docString = docString;\
  callback();\
});";
    callback();
  });

  Given(/^the following data table in a step:$/, function(dataTable, callback) {
    this.featureSource += "Feature:\n";
    this.featureSource += "  Scenario:\n";
    this.featureSource += "    When a step with data table:\n";
    this.featureSource += dataTable.replace(/^/gm, '      ');
    callback();
  });

  Given(/a custom World constructor calling back with an explicit object$/, function(callback) {
    this.stepDefinitions += "this.World = function CustomWorldConstructor(callback) {\n\
  callback({someFunction: function () {world.explicitWorldFunctionCalled = true; }});\n\
};\n";
    callback();
  });

  Given(/^several features$/, function(callback) {
    this.features = [
      ["feature1", "Feature: One\n\n  Scenario:\n"],
      ["feature2", "Feature: Two\n\n  Scenario:\n"],
      ["feature3", "Feature: Three\n\n  Scenario:\n"],
    ];
    callback();
  });

  When(/^Cucumber executes the scenario$/, function(callback) {
    this.runFeature({}, callback);
  });

  this.When(/^Cucumber executes a scenario using that mapping$/, function(callback) {
    this.runAScenarioCallingMapping(callback);
  });

  this.When(/^Cucumber executes a scenario that passes arguments to that mapping$/, function(callback) {
    this.runAScenarioCallingMappingWithParameters(callback);
  });

  When(/^Cucumber executes a scenario that calls a function on the explicit World object$/, function(callback) {
    this.runAScenarioCallingWorldFunction(callback);
  });

  When(/^Cucumber runs the feature$/, function(callback) {
    this.runFeature({}, callback);
  });

  When(/^Cucumber runs the features$/, function(callback) {
    this.runFeatures({}, callback);
  });

  When(/^Cucumber runs the scenario with steps for a calculator$/, function(callback) {
    RpnCalculator = require('../support/rpn_calculator');
    var supportCode = function() { require('./calculator_steps').initialize.call(this, RpnCalculator) };
    this.runFeatureWithSupportCodeSource(supportCode, {}, callback);
  });

  When(/^the data table is passed to a step mapping that converts it to key\/value pairs$/, function(callback) {
    this.stepDefinitions += "When(/^a step with data table:$/, function(dataTable, callback) {\
world.dataTableLog = dataTable.hashes();\
callback();\
});\n";
    this.runFeature({}, callback);
  });

  When(/^the data table is passed to a step mapping that gets the row arrays without the header$/, function(callback) {
    this.stepDefinitions += "When(/^a step with data table:$/, function(dataTable, callback) {\
world.dataTableLog = dataTable.rows();\
callback();\
});\n";
    this.runFeature({}, callback);
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

  Then(/^the mapping is run$/, function(callback) {
    this.assertPassedMapping();
    callback();
  });

  Then(/^the mapping receives the arguments$/, function(callback) {
    this.assertPassedMappingWithArguments();
    callback();
  });

  Then(/^the feature passes$/, function(callback) {
    this.assertPassedFeature();
    callback();
  });

  Then(/^all features are run$/, function(callback) {
    this.assertPassedFeatures();
    callback();
  });

  Then(/^the failure message "([^"]*)" is output$/, function(message, callback) {
    this.assertFailureMessage(message);
    callback();
  });

  Then(/^the received data table array equals the following:$/, function(expectedDataTableJSON, callback) {
    var expectedDataTable = JSON.parse(expectedDataTableJSON);
    this.assertEqual(expectedDataTable, World.mostRecentInstance.dataTableLog);
    callback();
  });

  Then(/^the data table is converted to the following:$/, function(expectedDataTableJSON, callback) {
    var expectedDataTable = JSON.parse(expectedDataTableJSON);
    this.assertEqual(expectedDataTable, World.mostRecentInstance.dataTableLog);
    callback();
  });

  Then(/^the received doc string equals the following:$/, function(docString, callback) {
    this.assertEqual(docString, World.mostRecentInstance.docString);
    callback();
  });

  this.Then(/^the explicit World object function should have been called$/, function(callback) {
    this.assertTrue(this.explicitWorldFunctionCalled);
    callback();
  });

  Then(/^the (before|after) hook is fired (?:before|after) the scenario$/, function(hookType, callback) {
    if (hookType == 'before')
      this.assertCycleSequence(hookType, 'step 1');
    else
      this.assertCycleSequence('step 1', hookType);
    callback();
  });

  Then(/^the around hook fires around the scenario$/, function(callback) {
    this.assertCycleSequence('around-pre', 'step 1', 'around-post');
    callback();
  });

  Then(/^the around hook is fired around the other hooks$/, function(callback) {
    this.assertCycleSequence('around-pre', 'before', 'step 1', 'after', 'around-post');
    callback();
  });

  Then(/^the hook is fired$/, function(callback) {
    this.assertCycleSequence('hook');
    callback();
  });

  Then(/^the hook is not fired$/, function(callback) {
    this.assertCycleSequenceExcluding('hook');
    callback();
  });
};

module.exports = cucumberSteps;
