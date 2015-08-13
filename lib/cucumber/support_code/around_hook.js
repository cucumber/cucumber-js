function AroundHook(code, options) {
  var Cucumber = require('../../cucumber');
  var self = Cucumber.SupportCode.Hook(code, options);
  var afterStep;

  self.setAfterStep = function setAfterStep(newAfterStep) {
    afterStep = newAfterStep;
  };

  self.buildCodeCallback = function buildCodeCallback(callback) {
    function codeCallback(error, postScenarioAroundHookCallback) {
      if (arguments.length === 1) {
        postScenarioAroundHookCallback = error;
        error = undefined;
      }

      var afterHook = Cucumber.SupportCode.Hook(postScenarioAroundHookCallback, {});
      afterStep.setHook(afterHook);

      callback(error);
    }

    return codeCallback;
  };

  return self;
}

module.exports = AroundHook;
