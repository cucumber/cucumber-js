if (typeof define !== 'function') { var define = require('amdefine')(module); }
define([
    '../type',
    './library/hooker',
    './world_constructor',
    './step_definition',
    '../util/arguments'
], function(Type, Hooker, WorldConstructor, StepDefinition, UtilArguments) {
var Library = function(supportCodeDefinition) {

  var stepDefinitions  = require('../../cucumber').Type.Collection();
  var hooker           = require('../../cucumber').SupportCode.Library.Hooker();
  var worldConstructor = require('../../cucumber').SupportCode.WorldConstructor();

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
      var tagGroupStrings = require('../../cucumber').Util.Arguments(arguments);
      var code            = tagGroupStrings.pop();
      hooker.addAroundHookCode(code, {tags: tagGroupStrings});
    },

    defineBeforeHook: function defineBeforeHook() {
      var tagGroupStrings = require('../../cucumber').Util.Arguments(arguments);
      var code            = tagGroupStrings.pop();
      hooker.addBeforeHookCode(code, {tags: tagGroupStrings});
    },

    defineAfterHook: function defineAfterHook() {
      var tagGroupStrings = require('../../cucumber').Util.Arguments(arguments);
      var code            = tagGroupStrings.pop();
      hooker.addAfterHookCode(code, {tags: tagGroupStrings});
    },

    defineStep: function defineStep(name, code) {
      var stepDefinition = require('../../cucumber').SupportCode.StepDefinition(name, code);
      stepDefinitions.add(stepDefinition);
    },

    instantiateNewWorld: function instantiateNewWorld(callback) {
      var world = new worldConstructor(function(explicitWorld) {
        // release the constructor
        var callCallback = function() { callback(explicitWorld || world); };
        if (typeof process !== "undefined") {
          process.nextTick(callCallback);
        } else {
          setTimeout(callCallback, 0);
        }
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
