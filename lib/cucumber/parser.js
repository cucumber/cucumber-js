var Parser = function(featureSources, astFilter) {
  var Gherkin      = require('gherkin');
  var GherkinLexer = require('gherkin/lib/gherkin/lexer/en');
  var Cucumber     = require('../cucumber');

  var features     = Cucumber.Ast.Features();
  var astAssembler = Cucumber.Ast.Assembler(features, astFilter);
  var currentSourceUri;

  var self = {
    parse: function parse() {
      var eventHandler = self.getEventHandlers();
      var lexer = new GherkinLexer(self.getEventHandlers());
      for (i in featureSources) {
        var currentSourceUri = featureSources[i][Parser.FEATURE_NAME_SOURCE_PAIR_URI_INDEX];
        var featureSource    = featureSources[i][Parser.FEATURE_NAME_SOURCE_PAIR_SOURCE_INDEX];
        self.setCurrentSourceUri(currentSourceUri);
        lexer.scan(featureSource);
      }
      return features;
    },

    setCurrentSourceUri: function setCurrentSourceUri(uri) {
      currentSourceUri = uri;
    },

    getCurrentSourceUri: function getCurrentSourceUri() {
      return currentSourceUri;
    },

    getEventHandlers: function getEventHandlers() {
      return {
        background:       self.handleBackground,
        comment:          self.handleComment,
        doc_string:       self.handleDocString,
        eof:              self.handleEof,
        feature:          self.handleFeature,
        row:              self.handleDataTableRow,
        scenario:         self.handleScenario,
        step:             self.handleStep,
        tag:              self.handleTag,
        scenario_outline: self.handleScenarioOutline,
        examples:         self.handleExamples
      };
    },

    handleBackground: function handleBackground(keyword, name, description, line) {
      var uri        = self.getCurrentSourceUri();
      var background = Cucumber.Ast.Background(keyword, name, description, uri, line);
      astAssembler.insertBackground(background);
    },

    handleComment: function handleComment() {},

    handleDocString: function handleDocString(contentType, string, line) {
      var uri       = self.getCurrentSourceUri();
      var docString = Cucumber.Ast.DocString(contentType, string, uri, line);
      astAssembler.insertDocString(docString);
    },

    handleEof: function handleEof() {
      astAssembler.finish();
    },

    handleFeature: function handleFeature(keyword, name, description, line) {
      var uri     = self.getCurrentSourceUri();
      var feature = Cucumber.Ast.Feature(keyword, name, description, uri, line);
      astAssembler.insertFeature(feature);
    },

    handleDataTableRow: function handleDataTableRow(cells, line) {
      var uri          = self.getCurrentSourceUri();
      var dataTableRow = Cucumber.Ast.DataTable.Row(cells, uri, line);
      astAssembler.insertDataTableRow(dataTableRow);
    },

    handleScenario: function handleScenario(keyword, name, description, line) {
      var uri      = self.getCurrentSourceUri();
      var scenario = Cucumber.Ast.Scenario(keyword, name, description, uri, line);
      astAssembler.insertScenario(scenario);
    },

    handleStep: function handleStep(keyword, name, line) {
      var uri  = self.getCurrentSourceUri();
      var step = Cucumber.Ast.Step(keyword, name, uri, line);
      astAssembler.insertStep(step);
    },

    handleTag: function handleTag(tag, line) {
      var uri = self.getCurrentSourceUri();
      var tag = Cucumber.Ast.Tag(tag, uri, line);
      astAssembler.insertTag(tag);
    },

    handleScenarioOutline: function handleScenarioOutline(keyword, name, description, line) {
      throw new Error("Scenario outlines are not supported yet. See https://github.com/cucumber/cucumber-js/issues/10");
    },

    handleExamples: function handleExamples(keyword, name, description, line) {
      throw new Error("Examples are not supported yet. See https://github.com/cucumber/cucumber-js/issues/10");
    }
  };
  return self;
};
Parser.FEATURE_NAME_SOURCE_PAIR_URI_INDEX = 0;
Parser.FEATURE_NAME_SOURCE_PAIR_SOURCE_INDEX = 1;
module.exports = Parser;
