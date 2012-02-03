var Parser = function(featureSources, astFilter) {
  var Gherkin  = require('gherkin');
  var Cucumber = require('../cucumber');

  var features     = Cucumber.Ast.Features();
  var astAssembler = Cucumber.Ast.Assembler(features, astFilter);

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
        row:        self.handleDataTableRow,
        scenario:   self.handleScenario,
        step:       self.handleStep,
        tag:        self.handleTag
      };
    },

    handleTag: function handleTag(tag, line) {
      var tag = Cucumber.Ast.Tag(tag, line);
      astAssembler.insertTag(tag);
    },

    handleBackground: function handleBackground(keyword, name, description, line) {
      var background = Cucumber.Ast.Background(keyword, name, description, line);
      astAssembler.insertBackground(background);
    },

    handleComment: function handleComment() {},

    handleDocString: function handleDocString(contentType, string, line) {
      var docString = Cucumber.Ast.DocString(contentType, string, line);
      astAssembler.insertDocString(docString);
    },

    handleEof: function handleEof() {},

    handleFeature: function handleFeature(keyword, name, description, line) {
      var feature = Cucumber.Ast.Feature(keyword, name, description, line);
      astAssembler.insertFeature(feature);
    },

    handleDataTableRow: function handleDataTableRow(cells, line) {
      var dataTableRow = Cucumber.Ast.DataTable.Row(cells, line);
      astAssembler.insertDataTableRow(dataTableRow);
    },

    handleScenario: function handleScenario(keyword, name, description, line) {
      var scenario = Cucumber.Ast.Scenario(keyword, name, description, line);
      astAssembler.insertScenario(scenario);
    },

    handleStep: function handleStep(keyword, name, line) {
      var step = Cucumber.Ast.Step(keyword, name, line);
      astAssembler.insertStep(step);
    }
  };
  return self;
};
Parser.FEATURE_NAME_SOURCE_PAIR_SOURCE_INDEX = 1;
module.exports = Parser;
