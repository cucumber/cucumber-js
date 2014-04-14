var Scenario = function(keyword, name, description, uri, line) {
  var Cucumber = require('../../cucumber');

  var background;
  var steps = Cucumber.Type.Collection();
  var inheritedTags = [];
  var tags  = [];

  var self = {
    payloadType: 'scenario',

    setBackground: function setBackground(newBackground) {
      background = newBackground;
    },

    buildScenarios: function buildScenarios() {
      return Cucumber.Type.Collection();
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

    getBackground: function getBackground() {
      return background;
    },

    addStep: function addStep(step) {
      var lastStep = self.getLastStep();
      step.setPreviousStep(lastStep);
      steps.add(step);
    },

    getLastStep: function getLastStep() {
      return steps.getLast();
    },

    getMaxStepLength: function () {
      var max = 0;
      steps.syncForEach(function(step) {
        var output = step.getKeyword() + step.getName();
        if (output.length > max) max = output.length;
      });
      return max;
    },

    setSteps: function setSteps(newSteps){
        steps = newSteps;
    },

    getSteps: function getSteps(){
      return steps;
    },

    addTags: function addTags(newTags) {
      tags = tags.concat(newTags);
    },

    addInheritedtags: function addInheritedtags(newTags) {
      inheritedTags = tags.concat(newTags);
    },

    getTags: function getTags() {
      return tags.concat(inheritedTags);
    },

    getOwnTags: function getOwnTags() {
      return tags;
    },

    acceptVisitor: function acceptVisitor(visitor, callback) {
      self.instructVisitorToVisitBackgroundSteps(visitor, function() {
        self.instructVisitorToVisitScenarioSteps(visitor, callback);
      });
    },

    instructVisitorToVisitBackgroundSteps: function instructVisitorToVisitBackgroundSteps(visitor, callback) {
      var background = self.getBackground();
      if (typeof(background) != 'undefined') {
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
      steps.forEach(function(step, iterate) {
        visitor.visitStep(step, iterate);
      }, callback);
    }
  };
  return self;
};
module.exports = Scenario;
