var Library = function(supportCodeDefinition) {
  var MISSING_WORLD_INSTANCE_ERROR = "World constructor called back without World instance.";
  var Cucumber = require('../../cucumber');

  var stepDefinitions  = Cucumber.Type.Collection();
  var hooker           = Cucumber.SupportCode.Library.Hooker();
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

    hookUpFunctionWithWorld: function hookUpFunctionWithWorld(userFunction, world) {
      var hookedUpFunction = hooker.hookUpFunctionWithWorld(userFunction, world);
      return hookedUpFunction;
    },

    defineAroundHook: function defineAroundHook(code) {
      hooker.addAroundHookCode(code);
    },

    defineBeforeHook: function defineBeforeHook(code) {
      hooker.addBeforeHookCode(code);
    },

    defineAfterHook: function defineAfterHook(code) {
      hooker.addAfterHookCode(code);
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
    Around     : self.defineAroundHook,
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
Library.Hooker = require('./library/hooker');
module.exports = Library;
