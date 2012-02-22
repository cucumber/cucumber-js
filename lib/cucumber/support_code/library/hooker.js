var Hooker = function() {
  var Cucumber = require('../../../cucumber');

  var aroundHooks = Cucumber.Type.Collection();
  var beforeHooks = Cucumber.Type.Collection();
  var afterHooks  = Cucumber.Type.Collection();

  var self = {
    addAroundHookCode: function addAroundHookCode(code) {
      var aroundHook = Cucumber.SupportCode.Hook(code);
      aroundHooks.add(aroundHook);
    },

    addBeforeHookCode: function addBeforeHookCode(code) {
      var beforeHook = Cucumber.SupportCode.Hook(code);
      beforeHooks.add(beforeHook);
    },

    addAfterHookCode: function addAfterHookCode(code) {
      var afterHook = Cucumber.SupportCode.Hook(code);
      afterHooks.unshift(afterHook);
    },

    hookUpFunctionWithWorld: function hookUpFunctionWithWorld(userFunction, world) {
      var hookedUpFunction = function(callback) {
        var postScenarioAroundHookCallbacks = Cucumber.Type.Collection();
        aroundHooks.forEach(callPreScenarioAroundHook, callBeforeHooks);

        function callPreScenarioAroundHook(aroundHook, preScenarioAroundHookCallback) {
          aroundHook.invoke(world, function(postScenarioAroundHookCallback) {
            postScenarioAroundHookCallbacks.unshift(postScenarioAroundHookCallback);
            preScenarioAroundHookCallback();
          });
        }

        function callBeforeHooks() {
          self.triggerBeforeHooks(world, callUserFunction);
        }

        function callUserFunction() {
          userFunction(callAfterHooks);
        }

        function callAfterHooks() {
          self.triggerAfterHooks(world, callPostScenarioAroundHooks);
        }

        function callPostScenarioAroundHooks() {
          postScenarioAroundHookCallbacks.forEach(
            callPostScenarioAroundHook,
            callback
          );
        }

        function callPostScenarioAroundHook(postScenarioAroundHookCallback, callback) {
          postScenarioAroundHookCallback.call(world, callback);
        }
      };
      return hookedUpFunction;
    },

    triggerBeforeHooks: function triggerBeforeHooks(world, callback) {
      beforeHooks.forEach(function(beforeHook, callback) {
        beforeHook.invoke(world, callback);
      }, callback);
    },

    triggerAfterHooks: function triggerAfterHooks(world, callback) {
      afterHooks.forEach(function(afterHook, callback) {
        afterHook.invoke(world, callback);
      }, callback);
    }
  };
  return self;
};
module.exports = Hooker;
