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

    defineStep: function defineStep(name, code) {
      var stepDefinition = Cucumber.SupportCode.StepDefinition(name, code);
      stepDefinitions.add(stepDefinition);
    }
  };

  var supportCodeHelper = {
    Given      : self.defineStep,
    When       : self.defineStep,
    Then       : self.defineStep,
    defineStep : self.defineStep
  };
  supportCodeDefinition.call(supportCodeHelper);

  return self;
};
module.exports = Library;
