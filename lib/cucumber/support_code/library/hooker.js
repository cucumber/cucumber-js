if (typeof define !== 'function') { var define = require('amdefine')(module); }
define(['../../type', '../hook'], function(Type, Hook) {
var Hooker = function() {

  var aroundHooks = Type.Collection();
  var beforeHooks = Type.Collection();
  var afterHooks  = Type.Collection();

  var self = {
    addAroundHookCode: function addAroundHookCode(code, options) {
      var aroundHook = require('../../support_code').Hook(code, options);
      aroundHooks.add(aroundHook);
    },

    addBeforeHookCode: function addBeforeHookCode(code, options) {
      var beforeHook = require('../../support_code').Hook(code, options);
      beforeHooks.add(beforeHook);
    },

    addAfterHookCode: function addAfterHookCode(code, options) {
      var afterHook = require('../../support_code').Hook(code, options);
      afterHooks.unshift(afterHook);
    },

    hookUpFunction: function hookUpFunction(userFunction, scenario, world) {
      var hookedUpFunction = function(callback) {
        var postScenarioAroundHookCallbacks = Type.Collection();
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