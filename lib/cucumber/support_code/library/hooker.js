var Hooker = function() {
  var Cucumber = require('../../../cucumber');

  var aroundHooks = Cucumber.Type.Collection();
  var beforeHooks = Cucumber.Type.Collection();
  var afterHooks  = Cucumber.Type.Collection();

  var self = {
    addAroundHookCode: function addAroundHookCode(code, options) {
      var aroundHook = Cucumber.SupportCode.Hook(code, options);
      aroundHooks.add(aroundHook);
    },

    addBeforeHookCode: function addBeforeHookCode(code, options) {
      var beforeHook = Cucumber.SupportCode.Hook(code, options);
      beforeHooks.add(beforeHook);
    },

    addAfterHookCode: function addAfterHookCode(code, options) {
      var afterHook = Cucumber.SupportCode.Hook(code, options);
      afterHooks.unshift(afterHook);
    },

    hookUpFunction: function hookUpFunction(scenarioFunction, world) {
      var hookedUpFunction = function(scenario, callback) {
        var postScenarioAroundHookCallbacks = Cucumber.Type.Collection();
        aroundHooks.forEach(callPreScenarioAroundHook, callBeforeHooks);

        function callPreScenarioAroundHook(aroundHook, preScenarioAroundHookCallback) {
          aroundHook.invokeBesideScenario(scenario, world, function(postScenarioAroundHookCallback) {
            postScenarioAroundHookCallbacks.unshift(postScenarioAroundHookCallback);
            preScenarioAroundHookCallback();
          });
        }

        function callBeforeHooks() {
          beforeHooks.forEach(function(beforeHook, callback) {
            beforeHook.invokeBesideScenario(scenario, world, callback);
          }, callUserFunction);
        }

        function callUserFunction() {
          scenarioFunction(function(updatedScenario) {
            scenario = updatedScenario;
            callAfterHooks();
          });
        }

        function callAfterHooks() {
          afterHooks.forEach(function(afterHook, callback) {
            afterHook.invokeBesideScenario(scenario, world, callback);
          }, callPostScenarioAroundHooks);
        }

        function callPostScenarioAroundHooks() {
          postScenarioAroundHookCallbacks.forEach(
            callPostScenarioAroundHook,
            callback
          );
        }

        function callPostScenarioAroundHook(postScenarioAroundHookCallback, callback) {
          if (postScenarioAroundHookCallback.length === 1)
            postScenarioAroundHookCallback.call(world, callback);
          else
            postScenarioAroundHookCallback.call(world, scenario, callback);
        }
      };
      return hookedUpFunction;
    }
  };
  return self;
};
module.exports = Hooker;
