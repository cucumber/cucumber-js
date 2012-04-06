if (typeof define !== 'function') { var define = require('amdefine')(module); }
define([
    '../type/collection',
    './library/hooker',
    './world_constructor',
    './step_definition',
    '../util/arguments'
], function(Collection, Hooker, WorldConstructor, StepDefinition, UtilArguments) {
var Library = function(supportCodeDefinition) {

  var stepDefinitions  = Collection();
  var hooker           = Hooker();
  var worldConstructor = WorldConstructor();

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

    hookUpFunction: function hookUpFunction(userFunction, scenario, world) {
      var hookedUpFunction = hooker.hookUpFunction(userFunction, scenario, world);
      return hookedUpFunction;
    },

    defineAroundHook: function defineAroundHook() {
      var tagGroupStrings = UtilArguments(arguments);
      var code            = tagGroupStrings.pop();
      hooker.addAroundHookCode(code, {tags: tagGroupStrings});
    },

    defineBeforeHook: function defineBeforeHook() {
      var tagGroupStrings = UtilArguments(arguments);
      var code            = tagGroupStrings.pop();
      hooker.addBeforeHookCode(code, {tags: tagGroupStrings});
    },

    defineAfterHook: function defineAfterHook() {
      var tagGroupStrings = UtilArguments(arguments);
      var code            = tagGroupStrings.pop();
      hooker.addAfterHookCode(code, {tags: tagGroupStrings});
    },

    defineStep: function defineStep(name, code) {
      var stepDefinition = StepDefinition(name, code);
      stepDefinitions.add(stepDefinition);
    },

    instantiateNewWorld: function instantiateNewWorld(callback) {
      var world = new worldConstructor(function(explicitWorld) {
        setTimeout(function() { // release the constructor
          callback(explicitWorld || world);
        }, 0);
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
Library.Hooker = Hooker;
return Library;
});
