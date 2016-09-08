var jsonOutputSteps = function jsonOutputSteps() {
  var assert = require('assert');
  var jsonDiff = require('json-diff');

  var helpers = require('../support/helpers');
  var getAdditionalErrorText = helpers.getAdditionalErrorText;
  var normalizeText = helpers.normalizeText;

  function findScenario(features, predicate){
    var found = null;
    features.forEach(function(feature) {
      feature.elements.forEach(function(element, index){
        if (element.type === 'scenario' && predicate(element, index)){
          found = element;
        }
      });
    });
    if (found === null){
      throw new Error('Could not find scenario matching predicate');
    }
    return found;
  }

  function findStep(features, scenarioPredicate, stepPredicate){
    var scenario = findScenario(features, scenarioPredicate);
    var found = null;
    scenario.steps.forEach(function(step){
      if (stepPredicate(step)){
        found = step;
      }
    });
    if (found === null){
      throw new Error('Could not find step matching predicate');
    }
    return found;
  }

  function neutraliseVariableValuesInJson(report) {
    report.forEach(function (item) {
      (item.elements || []).forEach(function (element) {
        (element.steps || []).forEach(function (step) {
          if ('result' in step) {
            if ('error_message' in step.result) {
              step.result.error_message = '<error-message>';
            }

            if ('duration' in step.result) {
              step.result.duration = '<duration>';
            }
          }
        });
      });
    });
  }

  this.Then(/^it outputs this json:$/, function(expectedOutput) {
    var actualOutput = this.lastRun.stdout;
    expectedOutput = expectedOutput.replace(/<current-directory>/g, this.tmpDir.replace(/\\/g,'/'));

    var actualJson;
    var expectedJson;
    var errorSuffix = '\n' + getAdditionalErrorText(this.lastRun);

    try { actualJson = JSON.parse(actualOutput.replace(/\\\\/g,'/')); }
    catch(err) { throw new Error('Error parsing actual JSON:\n' + actualOutput + '\n' + err + errorSuffix); }

    try { expectedJson = JSON.parse(expectedOutput); }
    catch(err) { throw new Error('Error parsing expected JSON:\n' + expectedOutput + '\n' + err + errorSuffix); }

    neutraliseVariableValuesInJson(actualJson);
    neutraliseVariableValuesInJson(expectedJson);

    var diff = jsonDiff.diffString(expectedJson, actualJson);

    assert.deepEqual(actualJson, expectedJson, diff + errorSuffix);
  });

  this.Then(/^it runs (\d+) scenarios$/, function (count) {
    if (this.lastRun.error) {
      throw new Error('Expected last run to pass but it failed\n' +
                      'Output:\n' + normalizeText(this.lastRun.stdout) + '\n' +
                      'Error:\n' + normalizeText(this.lastRun.stderr));
    }

    var features = JSON.parse(this.lastRun.stdout);
    assert.equal(parseInt(count), features[0].elements.length);
  });

  this.Then(/^it runs the scenario "([^"]*)"$/, function (scenarioName) {
    var features = JSON.parse(this.lastRun.stdout);
    assert.equal(1, features.length);
    assert.equal(1, features[0].elements.length);
    assert.equal(features[0].elements[0].name, scenarioName);
  });

  this.Then(/^it runs the scenarios "([^"]*)" and "([^"]*)"$/, function (scenarioName1, scenarioName2) {
    var features = JSON.parse(this.lastRun.stdout);
    assert.equal(1, features.length);
    assert.equal(2, features[0].elements.length);
    assert.equal(features[0].elements[0].name, scenarioName1);
    assert.equal(features[0].elements[1].name, scenarioName2);
  });

  this.Then(/^the scenario "([^"]*)" has the steps$/, function (name, table) {
    var features = JSON.parse(this.lastRun.stdout);
    var scenario = findScenario(features, function(element) {
      return element.name === name;
    });
    var stepNames = scenario.steps.map(function(step){
      return [step.name];
    });
    assert.deepEqual(stepNames, table.rows());
  });

  this.Then(/^the step "([^"]*)" has status (failed|passed|pending)(?: with "([^"]*)")?$/, function (name, status, errorMessage) {
    var features;
    try {
      features = JSON.parse(this.lastRun.stdout);
    } catch (error) {
      error.message += '\n\n' + this.lastRun.stdout + '\n\n' + getAdditionalErrorText(this.lastRun);
      throw error;
    }
    var step = findStep(features, function() {
      return true;
    }, function(step) {
      return step.name === name;
    });
    try {
      assert.equal(step.result.status, status);
    } catch (error) {
      if (step.result.status === 'failed' && status !== 'failed') {
        error.message += '\n\n Step Error Message: ' + step.result.error_message + '\n\n';
      }
      throw error;
    }
    if (errorMessage && step.result.error_message.indexOf(errorMessage) === -1) {
      throw new Error('Expected "' + name + '" to have an error_message containing "' +
                      errorMessage + '"\n' + 'Got:\n' + step.result.error_message);
    }
  });

  this.Then(/^the (first|second) scenario has the steps$/, function (cardinal, table) {
    var scenarioIndex = cardinal === 'first' ? 0 : 1;
    var features = JSON.parse(this.lastRun.stdout);
    var scenario = findScenario(features, function(element, index) {
      return index === scenarioIndex;
    });
    var stepNames = scenario.steps.map(function(step){
      return [step.name];
    });
    assert.deepEqual(stepNames, table.rows());
  });

  this.Then(/^the (first|second) scenario has the step "([^"]*)" with the doc string$/, function (cardinal, name, docString) {
    var features = JSON.parse(this.lastRun.stdout);
    var scenarioIndex = cardinal === 'first' ? 0 : 1;
    var step = findStep(features, function(element, index){
      return index === scenarioIndex;
    }, function(step) {
      return step.name === name;
    });
    assert.equal(step.arguments[0].content, docString);
  });

  this.Then(/^the (first|second) scenario has the step "([^"]*)" with the table$/, function (cardinal, name, table) {
    var features = JSON.parse(this.lastRun.stdout);
    var scenarioIndex = cardinal === 'first' ? 0 : 1;
    var step = findStep(features, function(element, index){
      return index === scenarioIndex;
    }, function(step) {
      return step.name === name;
    });
    var expected = table.raw().map(function (row) {
      return {cells: row};
    });
    assert.deepEqual(step.arguments[0].rows, expected);
  });

  this.Then(/^the (first|second) scenario has the name "([^"]*)"$/, function (cardinal, name) {
    var scenarioIndex = cardinal === 'first' ? 0 : 1;
    var features = JSON.parse(this.lastRun.stdout);
    var scenario = findScenario(features, function(element, index) {
      return index === scenarioIndex;
    });
    assert.equal(scenario.name, name);
  });

};

module.exports = jsonOutputSteps;
