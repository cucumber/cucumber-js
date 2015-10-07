function AroundHook(code, options) {
  var Cucumber = require('../../cucumber');
  var self = Cucumber.SupportCode.Hook(code, options);
  var afterStep;

  self.setAfterStep = function setAfterStep(newAfterStep) {
    afterStep = newAfterStep;
  };

  self.buildCodeCallback = function buildCodeCallback(callback) {
    function codeCallback(error, postScenarioCallback) {
      if (postScenarioCallback) {
        var afterHook = Cucumber.SupportCode.Hook(postScenarioCallback, {noScenario: true});
        afterStep.setHook(afterHook);
      }

      callback(error);
    }

    return codeCallback;
  };

  return self;
}

module.exports = AroundHook;
