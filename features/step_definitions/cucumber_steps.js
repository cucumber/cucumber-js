var Cucumber = require('../../lib/cucumber');

var stepDefinitions = function() {
  var __supportCode, __listener;
  var __finishedCuking = false;

  Given(/the following support code:/, function(__code, __callback) {
    eval("__supportCode = function () {\n" + __code + "\n};");
    __callback();
  });

  When(/I run the following cucumber feature:/, function(featureSource, callback) {
    var cucumber = Cucumber(featureSource, __supportCode);
    cucumber.start(function() {
      __finishedCuking = true;
      callback();
    });    
  });

  When(/I run the following cucumber feature with a listener:/, function(featureSource, callback) {
    var cucumber = Cucumber(featureSource, __supportCode);
    __listener = Cucumber.Debug.SimpleAstListener();
    cucumber.attachListener(__listener);
    cucumber.start(function() {
      __finishedCuking = true;
      callback();
    });    
  });

  Then(/it should execute properly/, function(callback) {
    // End of feature reached without any glitch
    // everything went smooth!
    if (!__finishedCuking)
      throw "Cucumber encountered an error while running.";
    callback();
  });

  Then(/the listener should have printed the following:/, function(output, callback) {
    var actualOutput = __listener.getLogs().replace(/\s+$/,'');
    if (actualOutput != output) {
      throw "Expected the listener to output:\n'" + output + "'\nGot:\n'" + actualOutput + "'";
    }
    callback();
  });
};

module.exports = stepDefinitions;
