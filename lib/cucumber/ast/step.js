function Step(data) {
  var Cucumber = require('../../cucumber');
  var Gherkin = require('gherkin');
  var _ = require('lodash');
  var previousStep, scenario;

  var stepArguments = [];

  if (data.arguments) {
    stepArguments = data.arguments.map(function (arg) {
      if (arg.hasOwnProperty('content')) {
        return Cucumber.Ast.DocString(arg);
      } else if (arg.hasOwnProperty('rows')) {
        return Cucumber.Ast.DataTable(arg);
      } else {
        throw new Error('Unknown step argument type: ' + JSON.stringify(arg));
      }
    });
  }

  var self = {
    getScenario: function getScenario() {
      return scenario;
    },

    setScenario: function setScenario(newScenario) {
      scenario = newScenario;
    },

    setPreviousStep: function setPreviousStep(newPreviousStep) {
      previousStep = newPreviousStep;
    },

    isHidden: function isHidden() {
      return false;
    },

    getName: function getName() {
      return data.text;
    },

    getKeyword: function getKeyword() {
      return self.getScenario().getFeature().getStepKeywordByLines(self.getLines());
    },

    hasUri: function hasUri() {
      return true;
    },

    getLine: function getLine() {
      return _.last(self.getLines());
    },

    getLines: function getLines() {
      return _.map(data.locations, 'line');
    },

    getUri: function getUri() {
      return self.getScenario().getUri();
    },

    getPreviousStep: function getPreviousStep() {
      return previousStep;
    },

    hasPreviousStep: function hasPreviousStep() {
      return !!previousStep;
    },

    getArguments: function getArguments() {
      return stepArguments;
    },

    isOutcomeStep: function isOutcomeStep() {
      return self.hasOutcomeStepKeyword() || self.isRepeatingOutcomeStep();
    },

    isEventStep: function isEventStep() {
      return self.hasEventStepKeyword() || self.isRepeatingEventStep();
    },

    hasOutcomeStepKeyword: function hasOutcomeStepKeyword() {
      var language = self.getScenario().getFeature().getLanguage();
      return _.chain(Gherkin.DIALECTS[language].then)
        .includes(self.getKeyword())
        .value();
    },

    hasEventStepKeyword: function hasEventStepKeyword() {
      var language = self.getScenario().getFeature().getLanguage();
      return _.chain(Gherkin.DIALECTS[language].when)
        .includes(self.getKeyword())
        .value();
    },

    isRepeatingOutcomeStep: function isRepeatingOutcomeStep() {
      return self.hasRepeatStepKeyword() && self.isPrecededByOutcomeStep();
    },

    isRepeatingEventStep: function isRepeatingEventStep() {
      return self.hasRepeatStepKeyword() && self.isPrecededByEventStep();
    },

    hasRepeatStepKeyword: function hasRepeatStepKeyword() {
      var language = self.getScenario().getFeature().getLanguage();
      return _.chain(Gherkin.DIALECTS[language].and)
        .concat(Gherkin.DIALECTS[language].but)
        .includes(self.getKeyword())
        .value();
    },

    isPrecededByOutcomeStep: function isPrecededByOutcomeStep() {
      var result = false;

      if (self.hasPreviousStep()) {
        var previousStep = self.getPreviousStep();
        result = previousStep.isOutcomeStep();
      }
      return result;
    },

    isPrecededByEventStep: function isPrecededByEventStep() {
      var result = false;

      if (self.hasPreviousStep()) {
        var previousStep = self.getPreviousStep();
        result = previousStep.isEventStep();
      }
      return result;
    }
  };
  return self;
}

Step.EVENT_STEP_KEYWORD   = 'When ';
Step.OUTCOME_STEP_KEYWORD = 'Then ';
Step.AND_STEP_KEYWORD     = 'And ';
Step.BUT_STEP_KEYWORD     = 'But ';
Step.STAR_STEP_KEYWORD    = '* ';

module.exports = Step;
