var Cucumber = require('../../lib/cucumber');

var stepDefinitions = function() {
  var _featureSource, _supportCode, _listener;
  var _finishedCuking = false;
  var _stepDefinition, _stepDefinitionName;

  Given(/the following support code:/, function(_code, _callback) {
    eval("_supportCode = function () {\n" + _code + "\n};");
    _callback();
  });

  When(/I run the following cucumber feature with a listener:/, function(featureSource, callback) {
    var cucumber = Cucumber(featureSource, _supportCode);
    _listener = Cucumber.Debug.SimpleAstListener();
    cucumber.attachListener(_listener);
    cucumber.start(function() {
      _finishedCuking = true;
      callback();
    });
  });

  Then(/the listener should have printed the following:/, function(output, callback) {
    var actualOutput = _listener.getLogs().replace(/\s+$/,'');
    if (actualOutput != output) {
      throw "Expected the listener to output:\n'" + output + "'\nGot:\n'" + actualOutput + "'";
    }
    callback();
  });

  // High-level step definitions

  Given(/an asynchronous step definition/, function(callback) {
    _stepDefinitionName = "When an asynchronous step is run";
    _stepDefinition     = function() {
      When(/an asynchronous step is run/, function(callback) {
        setTimeout(callback, 0);
      });
    };
    callback();
  });
  
  When(/I run a feature using the step definition/, function(callback) {
    var _featureSource = buildFeatureSource();
    _supportCode = function() {
      _stepDefinition();
      Then(/a last step should run/, function(callback) {
        callback();
      });
    };
    var cucumber = Cucumber(_featureSource, _supportCode);
    _listener = Cucumber.Debug.SimpleAstListener();
    cucumber.attachListener(_listener);
    cucumber.start(function() {
      _finishedCuking = true;
      callback();
    });    
  });

  Then(/the feature should have run successfully/, function(callback) {
    var output       = buildFeatureSource();
    var actualOutput = _listener.getLogs().replace(/\s+$/,'');
    if (actualOutput != output) {
      throw "Expected the listener to output:\n'" + output + "'\nGot:\n'" + actualOutput + "'";
    }
    callback();
  });

  function buildFeatureSource() {
    return "Feature: tested feature\n\n  Scenario: tested scenario\n    " + _stepDefinitionName + "\n    Then a last step should run";
  };
};

module.exports = stepDefinitions;
