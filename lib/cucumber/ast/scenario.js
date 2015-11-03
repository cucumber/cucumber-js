function Scenario(data) {
  var Cucumber = require('../../cucumber');

  var previousStep;
  var steps = data.steps.map(function (stepData) {
    stepData.uri = data.path;
    var step = Cucumber.Ast.Step(stepData);
    step.setPreviousStep(previousStep);
    previousStep = step;
    return step;
  });

  var tags = [];
  if (data.tags) {
    tags = data.tags.map(function (tagData) {
      return Cucumber.Ast.Tag(tagData);
    });
  }

  var self = {
    getKeyword: function getKeyword() {
      return data.keyword;
    },

    getName: function getName() {
      return data.name;
    },

    getDescription: function getDescription() {
      return data.description;
    },

    getUri: function getUri() {
      return data.path;
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
  return self;
}

module.exports = Scenario;
