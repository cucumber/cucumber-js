if (typeof define !== 'function') { var define = require('amdefine')(module); }
define(['../type/collection'], function(Collection) {
var Background = function(keyword, name, description, line) {
  var steps = Collection();

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
       }
  };
  return self;
};

return Background;
});
