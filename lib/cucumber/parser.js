var Parser = function(featureSources) {
  var Gherkin  = require('gherkin');
  var Cucumber = require('../cucumber');

  var features = Cucumber.Ast.Features();

  var self = {
    parse: function parse() {
      var Lexer = Gherkin.Lexer('en');
      var lexer = new Lexer(self.getEventHandlers());
      for (i in featureSources) {
        var featureSource = featureSources[i][Parser.FEATURE_NAME_SOURCE_PAIR_SOURCE_INDEX];
        lexer.scan(featureSource);
      }
      return features;
    },

    getEventHandlers: function getEventHandlers() {
      return {
        background: self.handleBackground,
        comment:    self.handleComment,
        doc_string: self.handleDocString,
        eof:        self.handleEof,
        feature:    self.handleFeature,
        row:        self.handleRow,
        scenario:   self.handleScenario,
        step:       self.handleStep
      };
    },

    getCurrentFeature: function getCurrentFeature() {
      return features.getLastFeature();
    },

    getCurrentScenarioOrBackground: function getCurrentScenarioOrBackground() {
      var currentFeature       = self.getCurrentFeature();
      var scenarioOrBackground = currentFeature.getLastScenario();
      if (!scenarioOrBackground)
        scenarioOrBackground = currentFeature.getBackground();
      return scenarioOrBackground;
    },

    getCurrentStep: function getCurrentStep() {
      var currentScenarioOrBackground = self.getCurrentScenarioOrBackground();
      return currentScenarioOrBackground.getLastStep();
    },

    handleBackground: function handleBackground(keyword, name, description, line) {
      var background     = Cucumber.Ast.Background(keyword, name, description, line);
      var currentFeature = self.getCurrentFeature();
      currentFeature.addBackground(background);
    },

    handleComment: function handleComment() {},

    handleDocString: function handleDocString(contentType, string, line) {
      var docString   = Cucumber.Ast.DocString(contentType, string, line);
      var currentStep = self.getCurrentStep();
      currentStep.attachDocString(docString);
    },

    handleEof: function handleEof() {},

    handleFeature: function handleFeature(keyword, name, description, line) {
      var feature = Cucumber.Ast.Feature(keyword, name, description, line);
      features.addFeature(feature);
    },

    handleRow: function handleRow(cells, line) {
      var currentStep = self.getCurrentStep();
      var row         = Cucumber.Ast.DataTable.Row(cells, line);
      currentStep.attachDataTableRow(row);
    },

    handleScenario: function handleScenario(keyword, name, description, line) {
      var currentFeature = self.getCurrentFeature();
      var background     = currentFeature.getBackground();
      var scenario       = Cucumber.Ast.Scenario(keyword, name, description, line, background);
      currentFeature.addScenario(scenario);
    },

    handleStep: function handleStep(keyword, name, line) {
      var step                        = Cucumber.Ast.Step(keyword, name, line);
      var currentScenarioOrBackground = self.getCurrentScenarioOrBackground();
      currentScenarioOrBackground.addStep(step);
    }
  };
  return self;
};
Parser.FEATURE_NAME_SOURCE_PAIR_SOURCE_INDEX = 1;
module.exports = Parser;
