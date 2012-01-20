var Library = function(supportCodeDefinition) {
  var MISSING_WORLD_INSTANCE_ERROR = "World constructor called back without World instance.";
  var Cucumber = require('../../cucumber');

  var beforeHooks      = Cucumber.Type.Collection();
  var afterHooks       = Cucumber.Type.Collection();
  var stepDefinitions  = Cucumber.Type.Collection();
  var worldConstructor = Cucumber.SupportCode.WorldConstructor();

  var self = {
    lookupStepDefinitionByName: function lookupStepDefinitionByName(name) {
      var matchingStepDefinition;

      stepDefinitions.syncForEach(function(stepDefinition) {
        if (stepDefinition.matchesStepName(name)) {
          matchingStepDefinition = stepDefinition;
        }
      });
      return matchingStepDefinition;
    },

    isStepDefinitionNameDefined: function isStepDefinitionNameDefined(name) {
      var stepDefinition = self.lookupStepDefinitionByName(name);
      return (stepDefinition != undefined);
    },

    defineBeforeHook: function defineBeforeHook(code) {
      var beforeHook = Cucumber.SupportCode.Hook(code);
      beforeHooks.add(beforeHook);
    },

    triggerBeforeHooks: function(world, callback) {
      beforeHooks.forEach(function(beforeHook, callback) {
        beforeHook.invoke(world, callback);
      }, callback);
    },

    defineAfterHook: function defineAfterHook(code) {
      var afterHook = Cucumber.SupportCode.Hook(code);
      afterHooks.unshift(afterHook);
    },

    triggerAfterHooks: function(world, callback) {
      afterHooks.forEach(function(afterHook, callback) {
        afterHook.invoke(world, callback);
      }, callback);
    },

    defineStep: function defineStep(name, code) {
      var stepDefinition = Cucumber.SupportCode.StepDefinition(name, code);
      stepDefinitions.add(stepDefinition);
    },

    instantiateNewWorld: function instantiateNewWorld(callback) {
      new worldConstructor(function(world) {
        if (!world) {
          throw new Error(MISSING_WORLD_INSTANCE_ERROR);
        }
        process.nextTick(function() { // release the constructor
          callback(world);
        });
      });
    }
  };

  var supportCodeHelper = {
    Before     : self.defineBeforeHook,
    After      : self.defineAfterHook,
    Given      : self.defineStep,
    When       : self.defineStep,
    Then       : self.defineStep,
    defineStep : self.defineStep,
    World      : worldConstructor
  };
  supportCodeDefinition.call(supportCodeHelper);
  worldConstructor = supportCodeHelper.World;

  return self;
};
module.exports = Library;
