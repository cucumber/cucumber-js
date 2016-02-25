function Scenario(keyword, name, description, uri, line, scenarioOutlineLine) {
  var Cucumber = require('../../cucumber');

  var background;
  var steps = Cucumber.Type.Collection();
  var inheritedTags = [];
  var tags  = [];

  var self = {
    isScenarioOutline: function isScenarioOutline() {
      return false;
    },

    setBackground: function setBackground(newBackground) {
      background = newBackground;
    },

    getKeyword: function getKeyword() {
      return keyword;
    },

    getName: function getName() {
      return name;
    },

    getDescription: function getDescription() {
      return description;
    },

    getUri: function getUri() {
      return uri;
    },

    getLine: function getLine() {
      return line;
    },

    getScenarioOutlineLine: function getLine() {
      return scenarioOutlineLine;
    },

    getBackground: function getBackground() {
      return background;
    },

    addStep: function addStep(step) {
      var lastStep = self.getLastStep();
      step.setScenario(self);
      step.setPreviousStep(lastStep);
      steps.add(step);
    },

    getLastStep: function getLastStep() {
      return steps.getLast();
    },

    getSteps: function getSteps() {
      return steps;
    },

    addTags: function addTags(newTags) {
      tags = tags.concat(newTags);
    },

    addInheritedTags: function addInheritedTags(newTags) {
      inheritedTags = tags.concat(newTags);
    },

    getTags: function getTags() {
      return tags.concat(inheritedTags);
    },

    getOwnTags: function getOwnTags() {
      return tags;
    },

    acceptVisitor: function acceptVisitor(visitor, callback) {
      self.instructVisitorToVisitBackgroundSteps(visitor, function () {
        self.instructVisitorToVisitScenarioSteps(visitor, callback);
      });
    },

    instructVisitorToVisitBackgroundSteps: function instructVisitorToVisitBackgroundSteps(visitor, callback) {
      var background = self.getBackground();
      if (typeof(background) !== 'undefined') {
        var steps = background.getSteps();
        self.instructVisitorToVisitSteps(visitor, steps, callback);
      } else {
        callback();
      }
    },

    instructVisitorToVisitScenarioSteps: function instructVisitorToVisitScenarioSteps(visitor, callback) {
      self.instructVisitorToVisitSteps(visitor, steps, callback);
    },

    instructVisitorToVisitSteps: function instructVisitorToVisitSteps(visitor, steps, callback) {
      steps.asyncForEach(function (step, iterate) {
        visitor.visitStep(step, iterate);
      }, callback);
    }
  };
  return self;
}

module.exports = Scenario;
