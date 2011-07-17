var Parser = function(featuresSource) {
  // We currently only support the English lexer because we don't know yet
  // how to load different modules based on a string in browserify (i.e.
  // Gherkin does not load properly under browserify).
  var GherkinEnglishLexer = require('gherkin/lib/gherkin/lexer/en');
  var Cucumber            = require('../cucumber');

  var features = Cucumber.Ast.Features();

  var self = {
    parse: function parse() {
      var eventHandlers = self.getEventHandlers();
      var lexer = new GherkinEnglishLexer.Lexer(eventHandlers);
      lexer.scan(featuresSource);
      return features;
    },

    getEventHandlers: function getEventHandlers() {
      return {
        feature:    self.handleFeature,
        scenario:   self.handleScenario,
        step:       self.handleStep,
        doc_string: self.handleDocString,
        eof:        self.handleEof
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

    handleEof: function handleEof() {}
  };
  return self;
};
module.exports = Parser;