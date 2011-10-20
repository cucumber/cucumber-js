var Library = function(supportCodeDefinition) {
  var Cucumber = require('../../cucumber');

  var beforeCallbacks = Cucumber.Type.Collection();
  var afterCallbacks = Cucumber.Type.Collection();
  var stepDefinitions = Cucumber.Type.Collection();
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
      var beforeCallback = Cucumber.SupportCode.Callback(code);
      beforeCallbacks.add(beforeCallback);
    },

    getBeforeCallbacks: function() {
      return beforeCallbacks;
    },

    defineAfter: function defineAfter(code) {
      var afterCallback = Cucumber.SupportCode.Callback(code);
      afterCallbacks.add(afterCallback);
    },

    getAfterCallbacks: function() {
      return afterCallbacks;
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
