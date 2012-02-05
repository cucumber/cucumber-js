var cucumberSteps = function() {
  var Given  = When = Then = this.defineStep;
  var World  = require('./cucumber_world').World;
  this.World = World;

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

  Given(/^a passing (before|after) hook$/, function(hookType, callback) {
    var defineHook = (hookType == 'before' ? 'Before' : 'After');
    this.stepDefinitions += defineHook + "(function(callback) {\
  world.logCycleEvent('" + hookType + "');\
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

  Given(/^the step "([^"]*)" has an asynchronous pending mapping$/, function(stepName, callback) {
    this.stepDefinitions += "Given(/^" + stepName + "$/, function(callback) {\
world.touchStep(\"" + stepName + "\");\
setTimeout(callback.pending, 10);\
});\n";
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

  Given(/^the following data table in a step:$/, function(dataTable, callback) {
    this.featureSource += "Feature:\n";
    this.featureSource += "  Scenario:\n";
    this.featureSource += "    When a step with data table:\n";
    this.featureSource += dataTable.replace(/^/gm, '      ');
    callback();
  });

  Given(/^a custom World constructor calling back without an instance$/, function(callback) {
    this.stepDefinitions += "this.World = function CustomWorld(callback) { callback(); };\n";
    callback();
  });

  this.Given(/^a scenario without any tags$/, function(callback) {
    this.addPassingScenarioWithoutTags();
    callback();
  });

  Given(/^a scenario tagged with "([^"]*)"$/, function(tag, callback) {
    this.addPassingScenarioWithTags([tag]);
    callback();
  });

  Given(/^a scenario tagged with "([^"]*)" and "([^"]*)"$/, function(tag1, tag2, callback) {
    this.addPassingScenarioWithTags([tag1, tag2]);
    callback();
  });

  Given(/^a scenario tagged with "([^"]*)", "([^"]*)" and "([^"]*)"$/, function(tag1, tag2, tag3, callback) {
    this.addPassingScenarioWithTags([tag1, tag2, tag3]);
    callback();
  });

  Given(/^a feature tagged with "([^"]*)"$/, function(tag, callback) {
    this.createEmptyFeature({tags: [tag]});
    callback();
  });

  When(/^Cucumber executes the scenario$/, function(callback) {
    this.runFeature({}, callback);
  });

  When(/^Cucumber executes a scenario$/, function(callback) {
    this.runAScenario(callback);
  });

  When(/^Cucumber runs the feature$/, function(callback) {
    this.runFeature({}, callback);
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

  When(/^Cucumber executes scenarios tagged with "([^"]*)"$/, function(tag, callback) {
    this.runFeature({tags: [[tag]]}, callback);
  });

  When(/^Cucumber executes scenarios not tagged with "([^"]*)"$/, function(tag, callback) {
    this.runFeature({tags: [['~'+tag]]}, callback);
  });

  When(/^Cucumber executes scenarios tagged with "([^"]*)" or "([^"]*)"$/, function(tag1, tag2, callback) {
    this.runFeature({tags: [[tag1, tag2]]}, callback);
  });

  When(/^Cucumber executes scenarios tagged with both "([^"]*)" and "([^"]*)"$/, function(tag1, tag2, callback) {
    this.runFeature({tags: [[tag1], [tag2]]}, callback);
  });

  When(/^Cucumber executes scenarios not tagged with "([^"]*)" nor "([^"]*)"$/, function(tag1, tag2, callback) {
    this.runFeature({tags: [['~'+tag1], ['~'+tag2]]}, callback);
  });

  When(/^Cucumber executes scenarios not tagged with both "([^"]*)" and "([^"]*)"$/, function(tag1, tag2, callback) {
    this.runFeature({tags: [['~'+tag1, '~'+tag2]]}, callback);
  });

  When(/^Cucumber executes scenarios tagged with "([^"]*)" or without "([^"]*)"$/, function(tag1, tag2, callback) {
    this.runFeature({tags: [[tag1, '~'+tag2]]}, callback);
  });

  When(/^Cucumber executes scenarios tagged with "([^"]*)" but not with both "([^"]*)" and "([^"]*)"$/, function(tag1, tag2, tag3, callback) {
    this.runFeature({tags: [[tag1], ['~'+tag2], ['~'+tag3]]}, callback);
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

  Then(/^the (before|after) hook is fired (?:before|after) the scenario$/, function(hookType, callback) {
    if (hookType == 'before')
      this.assertCycleSequence(hookType, 'step');
    else
      this.assertCycleSequence('step', hookType);
    callback();
  });

  Then(/^an error about the missing World instance is raised$/, function(callback) {
    this.assertFailureMessage("World constructor called back without World instance");
    callback();
  });

  Then(/^(?:only the first|the) scenario is executed$/, function(callback) {
    this.assertExecutedNumberedScenarios(1);
    callback();
  });

  Then(/^only the first two scenarios are executed$/, function(callback) {
    this.assertExecutedNumberedScenarios(1, 2);
    callback();
  });

  Then(/^only the third scenario is executed$/, function(callback) {
    this.assertExecutedNumberedScenarios(3);
    callback();
  });

  Then(/^only the second, third and fourth scenarios are executed$/, function(callback) {
    this.assertExecutedNumberedScenarios(2, 3, 4);
    callback();
  });
};
module.exports = cucumberSteps;
