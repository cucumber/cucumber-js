var tagSteps = function() {
  var Given  = When = Then = this.defineStep;
  var World  = require('./cucumber_world').World;
  this.World = World;

  Given(/^an untagged hook$/, function(callback) {
    this.addUntaggedHook(callback);
  });

  Given(/^a hook tagged with "([^"]*)"$/, function(tags, callback) {
    this.addHookWithTags(tags, callback);
  });

  Given(/^an around hook tagged with "([^"]*)"$/, function(tags, callback) {
    this.addAroundHookWithTags(tags, callback);
  });

  Given(/^a scenario without any tags$/, function(callback) {
    this.addPassingScenarioWithoutTags();
    callback();
  });

  Given(/^a scenario tagged with "([^"]*)"$/, function(tag, callback) {
    this.addPassingScenarioWithTags(tag);
    callback();
  });

  Given(/^a scenario tagged with "([^"]*)" and "([^"]*)"$/, function(tag1, tag2, callback) {
    this.addPassingScenarioWithTags(tag1, tag2);
    callback();
  });

  Given(/^a scenario tagged with "([^"]*)", "([^"]*)" and "([^"]*)"$/, function(tag1, tag2, tag3, callback) {
    this.addPassingScenarioWithTags(tag1, tag2, tag3);
    callback();
  });

  Given(/^a feature tagged with "([^"]*)"$/, function(tag, callback) {
    this.createEmptyFeature({tags: [tag]});
    callback();
  });

  When(/^Cucumber executes a scenario(?: with no tags)?$/, function(callback) {
    this.runAScenario(callback);
  });

  When(/^Cucumber executes a scenario tagged with "([^"]*)"$/, function(tag, callback) {
    this.addPassingScenarioWithTags(tag);
    this.runFeature({}, callback);
  });

  When(/^Cucumber executes scenarios tagged with "([^"]*)"$/, function(tag, callback) {
    this.runFeature({tags: [tag]}, callback);
  });

  When(/^Cucumber executes scenarios not tagged with "([^"]*)"$/, function(tag, callback) {
    this.runFeature({tags: ['~'+tag]}, callback);
  });

  When(/^Cucumber executes scenarios tagged with "([^"]*)" or "([^"]*)"$/, function(tag1, tag2, callback) {
    this.runFeature({tags: [tag1 + ', ' + tag2]}, callback);
  });

  When(/^Cucumber executes scenarios tagged with both "([^"]*)" and "([^"]*)"$/, function(tag1, tag2, callback) {
    this.runFeature({tags: [tag1, tag2]}, callback);
  });

  When(/^Cucumber executes scenarios not tagged with "([^"]*)" nor "([^"]*)"$/, function(tag1, tag2, callback) {
    this.runFeature({tags: ['~'+tag1, '~'+tag2]}, callback);
  });

  When(/^Cucumber executes scenarios not tagged with both "([^"]*)" and "([^"]*)"$/, function(tag1, tag2, callback) {
    this.runFeature({tags: ['~' + tag1 + ', ~' + tag2]}, callback);
  });

  When(/^Cucumber executes scenarios tagged with "([^"]*)" or without "([^"]*)"$/, function(tag1, tag2, callback) {
    this.runFeature({tags: [tag1 + ', ~' + tag2]}, callback);
  });

  When(/^Cucumber executes scenarios tagged with "([^"]*)" but not with both "([^"]*)" and "([^"]*)"$/, function(tag1, tag2, tag3, callback) {
    this.runFeature({tags: [tag1, '~' + tag2, '~' + tag3]}, callback);
  });
};

module.exports = tagSteps;
