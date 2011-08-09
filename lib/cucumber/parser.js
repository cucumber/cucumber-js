var Parser = function(featureSources) {
  var Gherkin  = require('gherkin');
  var Cucumber = require('../cucumber');

  var features = Cucumber.Ast.Features();

  var self = {
    parse: function parse() {
      var Lexer = Gherkin.Lexer('en');
      var lexer = new Lexer(self.getEventHandlers());
      for (i in featureSources)
        lexer.scan(featureSources[i]);
      return features;
    },

    getEventHandlers: function getEventHandlers() {
      return {
        feature:    self.handleFeature,
        scenario:   self.handleScenario,
        step:       self.handleStep,
        doc_string: self.handleDocString,
        eof:        self.handleEof,
        comment:    self.handleComment
      };
    },

    getCurrentFeature: function getCurrentFeature() {
      return features.getLastFeature();
    },

    getCurrentScenario: function getCurrentScenario() {
      var currentFeature = self.getCurrentFeature();
      return currentFeature.getLastScenario();
    },

    getCurrentStep: function getCurrentStep() {
      var currentScenario = self.getCurrentScenario();
      return currentScenario.getLastStep();
    },

    handleFeature: function handleFeature(keyword, name, description, line) {
      var feature = Cucumber.Ast.Feature(keyword, name, description, line);
      features.addFeature(feature);
    },

    handleScenario: function handleScenario(keyword, name, description, line) {
      var scenario       = Cucumber.Ast.Scenario(keyword, name, description, line);
      var currentFeature = self.getCurrentFeature();
      currentFeature.addScenario(scenario);
    },

    handleStep: function handleStep(keyword, name, line) {
      var step            = Cucumber.Ast.Step(keyword, name, line);
      var currentScenario = self.getCurrentScenario();
      currentScenario.addStep(step);
    },

    handleDocString: function handleDocString(string, line) {
      var docString   = Cucumber.Ast.DocString(string, line);
      var currentStep = self.getCurrentStep();
      currentStep.attachDocString(docString);
    },

    handleEof: function handleEof() {},
    handleComment: function handleComment() {}
  };
  return self;
};
module.exports = Parser;
