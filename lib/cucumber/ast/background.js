var Background = function(keyword, name, description, uri, line) {
  var Cucumber = require('../../cucumber');

  var steps = Cucumber.Type.Collection();

  var self = {
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

    addStep: function addStep(step) {
      var lastStep = self.getLastStep();
      step.setPreviousStep(lastStep);
      steps.add(step);
 	  },

    getLastStep: function getLastStep() {
      return steps.getLast();
    },

 	  getSteps: function getSteps() {
      return steps;
 	  },

    getMaxStepLength: function () {
      var max = 0;
      steps.syncForEach(function(step) {
        var output = step.getKeyword() + step.getName();
        if (output.length > max) max = output.length;
      });
      return max;
    }
  };
  return self;
};
module.exports = Background;
