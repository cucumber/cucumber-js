var Library = function(supportCodeDefinition) {
  var Cucumber = require('../../cucumber');

  var stepDefinitions = Cucumber.Type.Collection();

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

    defineGivenStep: function defineGivenStep(name, code) {
      defineStep(name, code);
    },

    defineWhenStep: function defineWhenStep(name, code) {
      defineStep(name, code);
    },

    defineThenStep: function defineThenStep(name, code) {
      defineStep(name, code);
    }
  };

  withStepDefinitionHelpersDo(function() {
    supportCodeDefinition();
  });

  function withStepDefinitionHelpersDo(callback) {
    var originals = {
      Given: (typeof(Given) != 'undefined' ? Given : undefined),
      When:  (typeof(When)  != 'undefined' ? When  : undefined),
      Then:  (typeof(Then)  != 'undefined' ? Then  : undefined)
    };
    Given = self.defineGivenStep;
    When  = self.defineWhenStep;
    Then  = self.defineThenStep;
    callback();
    Given = originals['Given'];
    When  = originals['When'];
    Then  = originals['Then'];
  };

  function defineStep(name, code) {
    var stepDefinition = Cucumber.SupportCode.StepDefinition(name, code);
    stepDefinitions.add(stepDefinition);
  };

  return self;
};
module.exports = Library;
