var Library = function(supportCodeDefinition) {
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

    defineBefore: function defineBefore(code) {
      var beforeHook = Cucumber.SupportCode.Hook('before', code);
      beforeHooks.add(beforeHook);
    },

    getBeforeHooks: function() {
      return beforeHooks;
    },

    defineAfter: function defineAfter(code) {
      var afterHook = Cucumber.SupportCode.Hook('after', code);
      afterHooks.add(afterHook);
    },

    getAfterHooks: function() {
      return afterHooks;
    },

    defineStep: function defineStep(name, code) {
      var stepDefinition = Cucumber.SupportCode.StepDefinition(name, code);
      stepDefinitions.add(stepDefinition);
    },

    instantiateNewWorld: function instantiateNewWorld() {
      return new worldConstructor();
    }
  };

  var supportCodeHelper = {
    Before     : self.defineBefore,
    After      : self.defineAfter,
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
