var World = function(callback) {
  this.touchedSteps    = [];
  this.featureSource   = "";
  this.stepDefinitions = "";
  this.runOutput       = "";
  this.cycleEvents     = "";
  this.stepCount       = 0;
  this.runSucceeded    = false;
  World.mostRecentInstance = this;
  callback();
};

var proto = World.prototype;

proto.runFeature = function runFeature(options, callback) {
  var supportCode;
  var supportCodeSource = "supportCode = function() {\n  var Given = When = Then = this.defineStep;\n" +
    "  var Around = this.Around, Before = this.Before, After = this.After;\n" +
    this.stepDefinitions + "};\n";
  var world = this;
  eval(supportCodeSource);
  this.runFeatureWithSupportCodeSource(supportCode, options, callback);
};

proto.runFeatures = function runFeatures(options, callback) {
  this.runFeaturesWithSupportCodeSource(this.features, function() {}, options, callback);
};

proto.runFeatureWithSupportCodeSource = function runFeatureWithSupportCodeSource(supportCode, options, callback) {
  this.runFeaturesWithSupportCodeSource(this.featureSource, supportCode, options, callback);
};

proto.runFeaturesWithSupportCodeSource = function runFeaturesWithSupportCodeSource(features, supportCode, options, callback) {
  var world     = this;
  var Cucumber  = require('../../lib/cucumber');
  options = options || {};
  var tags = options['tags'] || [];

  var cucumber  = Cucumber(features, supportCode, {tags: tags});
  var formatter = Cucumber.Listener.ProgressFormatter({logToConsole: false});

  cucumber.attachListener(formatter);
  try {
    cucumber.start(function(succeeded) {
      world.runSucceeded = succeeded;
      world.runOutput    = formatter.getLogs();
      Cucumber.Debug.notice(world.runOutput, 'cucumber output', 5);
      callback();
    });
  } catch(e) {
    world.runOutput += e.toString();
    Cucumber.Debug.notice(world.runOutput, 'cucumber output', 5);
    callback();
  }
};

proto.runAScenario = function runAScenario(callback) {
  this.addScenario("", "Given a step");
  this.stepDefinitions += "Given(/^a step$/, function(callback) {\
  world.logCycleEvent('step 1');\
  callback();\
});";
  this.runFeature({}, callback);
};

proto.runAScenarioCallingMapping = function runAScenarioCallingMapping(callback) {
  this.addScenario("", "Given " + this.mappingName);
  this.runFeature({}, callback);
};

proto.runAScenarioCallingMappingWithParameters = function runAScenarioCallingMappingWithParameters(callback) {
  this.expectedMappingArguments = [5, "fresh cucumbers"];
  this.addScenario("", 'Given a mapping with ' + this.expectedMappingArguments[0] + ' "' + this.expectedMappingArguments[1] + '"');
  this.runFeature({}, callback);
};

proto.runAScenarioCallingMappingWithMultipleParameters = function runAScenarioCallingMappingWithMultipleParameters(callback) {
  this.expectedMappingArguments = [5, "fresh cucumbers", 2, 'pickled gherkins'];
  this.addScenario("", 'Given a mapping with ' + this.expectedMappingArguments[0] + ' ' + this.expectedMappingArguments[2] + ' "' + this.expectedMappingArguments[1] + '" "' + this.expectedMappingArguments[3] + '"');
  this.runFeature({}, callback);
};

proto.runAScenarioCallingWorldFunction = function runAScenarioCallingWorldFunction(callback) {
  this.addScenario("", "Given a step");
  this.stepDefinitions += "Given(/^a step$/, function(callback) {\
  world.logCycleEvent('step 1');\
  this.someFunction();\
  callback();\
});";
  this.runFeature({}, callback);
};

proto.logCycleEvent = function logCycleEvent(event) {
  this.cycleEvents += " -> " + event;
};

proto.touchStep = function touchStep(string) {
  this.touchedSteps.push(string);
};

proto.isStepTouched = function isStepTouched(pattern) {
  return (this.touchedSteps.indexOf(pattern) >= 0);
};

proto.addStringBasedPatternMapping = function addStringBasedPatternMapping() {
  this.mappingName = "/a string-based mapping with fancy characters |\\ ^*-{(})+[a].?";
  this.stepDefinitions += "Given('/a string-based mapping with fancy characters |\\\\ ^*-{(})+[a].?', function(callback) {\
  world.logCycleEvent('/a string-based mapping with fancy characters |\\\\ ^*-{(})+[a].?');\
  callback();\
});";
};

proto.addStringBasedPatternMappingWithParameters = function addStringBasedPatternMappingWithParameters() {
  this.mappingName = "a string-based mapping";
  this.stepDefinitions += "Given('a mapping with $word_param \"$multi_word_param\"', function(p1, p2, callback) {\
  world.logCycleEvent('a string-based mapping');\
  world.actualMappingArguments = [p1, p2];\
  callback();\
});";
};

proto.addStringBasedPatternMappingWithMultipleParameters = function addStringBasedPatternMappingWithMultipleParameters() {
  this.mappingName = "a string-based mapping with multiple parameters";
  this.stepDefinitions += "Given('a mapping with $word_param_a $word_param_b \"$multi_word_param_a\" \"$multi_word_param_b\"', function(p1, p2, p3, p4, callback) {\
  world.logCycleEvent('a string-based mapping with multiple parameters');\
  world.actualMappingArguments = [p1, p2, p3, p4];\
  callback();\
});";
};

proto.addScenario = function addScenario(name, contents, options) {
  options          = options || {};
  var tags         = options['tags'] || [];
  var tagString    = (tags.length > 0 ? tags.join(" ") + "\n" : "");
  var scenarioName = tagString + "Scenario: " + name;
  this.createEmptyFeature();
  this.featureSource += this.indentCode(scenarioName, 1);
  this.featureSource += this.indentCode(contents, 2);
};

proto.addPassingScenarioWithTags = function addPassingScenarioWithTags(tags) {
  tags = Array.prototype.slice.call(arguments, 0);

  var stepName = this.makeNumberedStepName();
  var scenarioName = "A scenario tagged with " + tags.join(', ');
  var step = "Given " + stepName + "\n";
  this.addScenario(scenarioName, step, {tags: tags});
  this.stepDefinitions += "Given(/^" + stepName + "$/, function(callback) {\
  world.logCycleEvent('" + stepName + "');\
  callback();\
});\n";
};

proto.addPassingScenarioWithoutTags = function addPassingScenarioWithoutTags() {
  this.addPassingScenarioWithTags();
};

proto.addBeforeHook = function (callback) {
  this._addHook({ type: "before" }, callback);
};

proto.addAfterHook = function (callback) {
  this._addHook({ type: "after" }, callback);
};

proto.addAroundHook = function (callback) {
  this._addAroundHook(callback);
};

proto.addAroundHookWithTags = function (tags, callback) {
  this._addAroundHook({ tags: tags, logEvent: "hook" }, callback);
};

proto.addUntaggedHook = function (callback) {
  this._addHook({ type: "before", logEvent: "hook" }, callback);
};

proto.addHookWithTags = function (tags, callback) {
  this._addHook({ type: "before", logEvent: "hook", tags: tags }, callback);
};

proto._addHook = function (options, callback) {
  if (!callback) {
    callback = options;
    options = {};
  }
  var type = "before";
  var tags = "";
  if (options.type) type = options.type;
  if (!options.logEvent) options.logEvent = type;
  if (options.tags) tags = '"' + options.tags + '", ';
  var defineHook = (type == 'before' ? 'Before' : 'After');
  this.stepDefinitions += defineHook + "(" + tags + "function(scenario, callback) {\
  world.logCycleEvent('" + options.logEvent + "');\
  callback();\
});\n";
  callback();
};

proto._addAroundHook = function (options, callback) {
  if (!callback) {
    callback = options;
    options = {};
  }
  var tags = "";
  var logEvent = "around";
  if (options.tags) tags = '"' + options.tags + '", ';
  if (options.logEvent) logEvent = options.logEvent;
  this.stepDefinitions += "Around(" + tags + "function(scenario, runScenario) {\
  world.logCycleEvent('" + logEvent + "-pre');\
  runScenario(function(scenario, callback) {\
  world.logCycleEvent('" + logEvent + "-post');\
    callback();\
  });\
});\n";
  callback();
};

proto.addFailingMapping = function (stepName, options, callback) {
  this.stepDefinitions += this._generateFailingMapping(stepName, options);
  callback();
};

proto._generateMapping = function (stepName, body) {
  return "\
Given(/^" + stepName + "$/, function(callback) {\
  world.touchStep(\"" + stepName + "\");\n" + body + "\
});\
";
};

proto._generateFailingMapping = function (stepName, options) {
  var message = "I was supposed to fail.";
  if (options.message) message = options.message;
  var body = "throw(new Error('" + message + "'));";
  return this._generateMapping(stepName, body);
};

proto.createEmptyFeature = function createEmptyFeature(options) {
  options = options || {};
  tags    = options['tags'] || [];

  if (!this.emptyFeatureReady) {
    if (tags.length > 0)
      this.featureSource += tags.join(' ') + "\n";
    this.featureSource += "Feature: A feature\n\n";
    this.emptyFeatureReady = true;
  }
};

proto.addPassingStepDefinitionWithName = function (name, callback) {
  this.stepDefinitions += "Given(/^" + name + "$/, function(callback) {\
  world.touchStep(\"" + name + "\");\
  callback();\
});\n";
  callback();
};

proto.makeNumberedStepName = function makeNumberedStepName(index) {
  var index = index || (++this.stepCount);
  var stepName = "step " + index;
  return stepName;
};

proto.assertPassedFeature = function assertPassedFeature() {
  this.assertNoPartialOutput("failed", this.runOutput);
  this.assertSuccess();
};

proto.assertPassedFeatures = function assertPassedFeatures() {
  this.assertNoPartialOutput("failed", this.runOutput);
  this.assertPartialOutput("3 scenarios ("+this.color.format("passed","3 passed")+")", this.runOutput);
  this.assertSuccess();
};

proto.assertPassedScenario = function assertPassedScenario() {
  this.assertPartialOutput("1 scenario ("+this.color.format("passed","1 passed")+")", this.runOutput);
  this.assertSuccess();
};

proto.assertFailedScenario = function assertFailedScenario() {
  this.assertPartialOutput("1 scenario ("+this.color.format("failed","1 failed")+")", this.runOutput);
  this.assertFailure();
};

proto.assertPendingScenario = function assertPendingScenario() {
  this.assertPartialOutput("1 scenario ("+this.color.format("pending","1 pending")+")", this.runOutput);
  this.assertSuccess();
};

proto.assertUndefinedScenario = function assertUndefinedScenario() {
  this.assertPartialOutput("1 scenario ("+this.color.format("undefined", "1 undefined")+")", this.runOutput);
  this.assertSuccess();
};

proto.assertScenarioReportedAsFailing = function assertScenarioReportedAsFailing(scenarioName) {
  this.assertPartialOutput("# Scenario: " + scenarioName, this.runOutput);
  this.assertFailure();
};

proto.assertScenarioNotReportedAsFailing = function assertScenarioNotReportedAsFailing(scenarioName) {
  this.assertNoPartialOutput("# Scenario: " + scenarioName, this.runOutput);
};

proto.assertPassedStep = function assertPassedStep(stepName) {
  if (!this.isStepTouched(stepName))
    throw(new Error("Expected step \"" + stepName + "\" to have passed."));
};

proto.assertSkippedStep = function assertSkippedStep(stepName) {
  if (this.isStepTouched(stepName))
    throw(new Error("Expected step \"" + stepName + "\" to have been skipped."));
};

proto.assertPassedMapping = function assertPassedMapping() {
  this.assertCycleSequence(this.mappingName);
};

proto.assertPassedMappingWithArguments = function assertPassedMappingWithArguments() {
  this.assertPassedMapping();
  if (this.actualMappingArguments.length != this.expectedMappingArguments.length ||
      this.actualMappingArguments[0] != this.expectedMappingArguments[0] ||
      this.actualMappingArguments[1] != this.expectedMappingArguments[1])
    throw(new Error("Expected arguments to be passed to mapping."));
};

proto.assertPassedMappingWithMultipleArguments = function assertPassedMappingWithMultipleArguments() {
  this.assertPassedMapping();
  if (this.actualMappingArguments.length != this.expectedMappingArguments.length ||
      this.actualMappingArguments[0] != this.expectedMappingArguments[0] ||
      this.actualMappingArguments[1] != this.expectedMappingArguments[1] ||
      this.actualMappingArguments[2] != this.expectedMappingArguments[2] ||
      this.actualMappingArguments[3] != this.expectedMappingArguments[3])
    throw(new Error("Expected arguments to be passed to mapping."));
};

proto.assertSuccess = function assertSuccess() {
  if (!this.runSucceeded)
    throw(new Error("Expected Cucumber to succeed but it failed."));
};

proto.assertFailure = function assertFailure() {
  if (this.runSucceeded)
    throw(new Error("Expected Cucumber to fail but it succeeded."));
};

proto.assertFailureMessage = function assertFailureMessage(message) {
  this.assertPartialOutput(message, this.runOutput);
  this.assertFailure();
};

proto.assertPartialOutput = function assertPartialOutput(expected, actual) {
  if (actual.indexOf(expected) < 0)
    throw(new Error("Expected:\n\"" + actual + "\"\nto match:\n\"" + expected + "\""));
};

proto.assertNoPartialOutput = function assertNoPartialOutput(expected, actual) {
  if (actual.indexOf(expected) >= 0)
    throw(new Error("Expected:\n\"" + actual + "\"\nnot to match:\n\"" + expected + "\""));
};

proto.assertEqual = function assertRawDataTable(expected, actual) {
  var expectedJSON = JSON.stringify(expected);
  var actualJSON   = JSON.stringify(actual);
  if (actualJSON != expectedJSON)
    throw(new Error("Expected:\n\"" + actualJSON + "\"\nto match:\n\"" + expectedJSON + "\""));
};

proto.assertTrue = function assertTrue(value) {
  if (!value)
    throw(new Error("Expected:\n\"" + value + "\"\n to be true"));
};

proto.assertExecutedNumberedScenarios = function assertExecutedNumberedScenarios() {
  var self = this;
  var scenarioIndexes = Array.prototype.slice.apply(arguments);
  var stepNames       = [];
  scenarioIndexes.forEach(function(scenarioIndex) {
    var stepName = self.makeNumberedStepName(scenarioIndex);
    stepNames.push(stepName);
  });
  this.assertCompleteCycleSequence.apply(this, stepNames);
};

proto.assertCycleSequence = function assertCycleSequence() {
  var events          = Array.prototype.slice.apply(arguments);
  var partialSequence = ' -> ' + events.join(' -> ');
  if (this.cycleEvents.indexOf(partialSequence) < 0)
    throw(new Error("Expected cycle sequence \"" + this.cycleEvents + "\" to contain \"" + partialSequence + "\""));
};

proto.assertCompleteCycleSequence = function assertCompleteCycleSequence() {
  var events   = Array.prototype.slice.apply(arguments);
  var sequence = ' -> ' + events.join(' -> ');

  if (this.cycleEvents != sequence)
    throw(new Error("Expected cycle sequence \"" + this.cycleEvents + "\" to be \"" + sequence + "\""));

};

proto.assertCycleSequenceExcluding = function assertCycleSequenceExcluding() {
  var self   = this;
  var events = Array.prototype.slice.apply(arguments);
  events.forEach(function(event) {
    if (self.cycleEvents.indexOf(event) >= 0)
      throw(new Error("Expected cycle sequence \"" + self.cycleEvents + "\" not to contain \"" + event + "\""));
  });
};

proto.indentCode = function indentCode(code, levels) {
  var indented = '';
  var lines    = code.split("\n");
  levels = levels || 1;

  lines.forEach(function(line) {
    var indent = (line == "" ? "" : Array(levels + 1).join("  "));
    indented += indent + line + "\n";
  });
  return indented;
};

proto.color = require('../../lib/cucumber/util/colors');

exports.World = World;
