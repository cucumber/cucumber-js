var Scenario = function(keyword, name, description, line) {
  var Cucumber = require('../../cucumber');

  var steps = Cucumber.Type.Collection();

  var self = {
    getKeyword: function getKeyword() {
      return keyword;
    },

    getName: function getName() {
      return name;
    },

    getLine: function getLine() {
      return line;
    },

    addStep: function addStep(step) {
      steps.add(step);
    },

    getLastStep: function getLastStep() {
      return steps.getLast();
    },

    acceptVisitor: function acceptVisitor(visitor, callback) {
      steps.forEach(function(step, iterate) {
        visitor.visitStep(step, iterate);
      }, callback);
    }
  };
  return self;
};
module.exports = Scenario;
