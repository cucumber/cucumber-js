define(['../../type/collection', '../hook'], function(Collection, Hook) {
var Hooker = function() {

  var aroundHooks = Collection();
  var beforeHooks = Collection();
  var afterHooks  = Collection();

  var self = {
    addAroundHookCode: function addAroundHookCode(code, options) {
      var aroundHook = Hook(code, options);
      aroundHooks.add(aroundHook);
    },

    addBeforeHookCode: function addBeforeHookCode(code, options) {
      var beforeHook = Hook(code, options);
      beforeHooks.add(beforeHook);
    },

    addAfterHookCode: function addAfterHookCode(code, options) {
      var afterHook = Hook(code, options);
      afterHooks.unshift(afterHook);
    },

    hookUpFunction: function hookUpFunction(userFunction, scenario, world) {
      var hookedUpFunction = function(callback) {
        var postScenarioAroundHookCallbacks = Collection();
        aroundHooks.forEach(callPreScenarioAroundHook, callBeforeHooks);

        function callPreScenarioAroundHook(aroundHook, preScenarioAroundHookCallback) {
          aroundHook.invokeBesideScenario(scenario, world, function(postScenarioAroundHookCallback) {
            postScenarioAroundHookCallbacks.unshift(postScenarioAroundHookCallback);
            preScenarioAroundHookCallback();
          });
        }

        function callBeforeHooks() {
          self.triggerBeforeHooks(scenario, world, callUserFunction);
        }

        function callUserFunction() {
          userFunction(callAfterHooks);
        }

        function callAfterHooks() {
          self.triggerAfterHooks(scenario, world, callPostScenarioAroundHooks);
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

    triggerBeforeHooks: function triggerBeforeHooks(scenario, world, callback) {
      beforeHooks.forEach(function(beforeHook, callback) {
        beforeHook.invokeBesideScenario(scenario, world, callback);
      }, callback);
    },

    triggerAfterHooks: function triggerAfterHooks(scenario, world, callback) {
      afterHooks.forEach(function(afterHook, callback) {
        afterHook.invokeBesideScenario(scenario, world, callback);
      }, callback);
    }
  };
  return self;
};
return Hooker;
});