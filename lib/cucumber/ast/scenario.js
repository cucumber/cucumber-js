function Scenario(data) {
  var Cucumber = require('../../cucumber');
  var feature, steps, tags = [];

  var self = {
    getName: function getName() {
      return data.name;
    },

    getKeyword: function getKeyword() {
      return self.getFeature().getScenarioKeyword();
    },

    getDescription: function getDescription() {
      return data.description;
    },

    getFeature: function getFeature() {
      return feature;
    },

    setFeature: function setFeature(value) {
      feature = value;
    },

    getUri: function getUri() {
      return self.getUris()[0];
    },

    getUris: function getUri() {
      return data.locations.map(function (location) {
        return location.path;
      });
    },

    getLine: function getLine() {
      return self.getLines()[0];
    },

    getLines: function getLines() {
      return data.locations.map(function (location) {
        return location.line;
      });
    },

    getTags: function getTags() {
      return tags;
    },

    getSteps: function getSteps() {
      return steps;
    },

    acceptVisitor: function acceptVisitor(visitor, callback) {
      Cucumber.Util.asyncForEach(steps, visitor.visitStep, callback);
    }
  };

  var previousStep;
  steps = data.steps.map(function (stepData) {
    stepData.uri = data.path;
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
