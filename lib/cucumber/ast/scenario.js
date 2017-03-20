function Scenario(data, uri) {
  var Cucumber = require('../../cucumber');
  var _ = require('lodash');
  var feature, steps, tags = [];

  var self = {
    getName: function getName() {
      return data.name;
    },

    getKeyword: function getKeyword() {
      return self.getFeature().getScenarioKeyword();
    },

    getDescription: function getDescription() {
      return self.getFeature().getScenarioDescriptionByLines(self.getLines());
    },

    getFeature: function getFeature() {
      return feature;
    },

    setFeature: function setFeature(value) {
      feature = value;
    },

    getUri: function getUri() {
      return uri;
    },

    getLine: function getLine() {
      return _.first(self.getLines());
    },

    getLines: function getLines() {
      return _.map(data.locations, 'line');
    },

    getTags: function getTags() {
      return tags;
    },

    getSteps: function getSteps() {
      return steps;
    }
  };

  var previousStep;
  steps = data.steps.map(function (stepData) {
    var step = Cucumber.Ast.Step(stepData);
    step.setScenario(self);
    step.setPreviousStep(previousStep);
    previousStep = step;
    return step;
  });

  if (data.tags) {
    tags = data.tags.map(function (tagData) {
      return Cucumber.Ast.Tag(tagData);
    });
  }

  return self;
}

module.exports = Scenario;
