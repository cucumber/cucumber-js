if (typeof define !== 'function') { var define = require('amdefine')(module); }
var gherkin_lexer_path = "gherkin/lexer/" + (typeof(GHERKIN_LANG) !== "undefined" ? GHERKIN_LANG : "en");
if (typeof exports !== "undefined") {
    gherkin_lexer_path = "gherkin";
}
define([
    gherkin_lexer_path,
    './ast'
], function(Gherkin, Ast) {
var Parser = function(featureSources, astFilter) {

  var features     = Ast.Features();
  var astAssembler = Ast.Assembler(features, astFilter);

  var self = {
    parse: function parse() {
      var Lexer = Gherkin.Lexer || Gherkin;
      if (gherkin_lexer_path == "gherkin") {
        Lexer = Lexer(typeof(GHERKIN_LANG) !== "undefined" ? GHERKIN_LANG : "en");
      }
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
      tag = Ast.Tag(tag, line);
      astAssembler.insertTag(tag);
    },

    handleBackground: function handleBackground(keyword, name, description, line) {
      var background = Ast.Background(keyword, name, description, line);
      astAssembler.insertBackground(background);
    },

    handleComment: function handleComment() {},

    handleDocString: function handleDocString(contentType, string, line) {
      var docString = Ast.DocString(contentType, string, line);
      astAssembler.insertDocString(docString);
    },

    handleEof: function handleEof() {},

    handleFeature: function handleFeature(keyword, name, description, line) {
      var feature = Ast.Feature(keyword, name, description, line);
      astAssembler.insertFeature(feature);
    },

    handleDataTableRow: function handleDataTableRow(cells, line) {
      var dataTableRow = Ast.DataTable.Row(cells, line);
      astAssembler.insertDataTableRow(dataTableRow);
    },

    handleScenario: function handleScenario(keyword, name, description, line) {
      var scenario = Ast.Scenario(keyword, name, description, line);
      astAssembler.insertScenario(scenario);
    },

    handleStep: function handleStep(keyword, name, line) {
      var step = Ast.Step(keyword, name, line);
      astAssembler.insertStep(step);
    }
  };
  return self;
};
Parser.FEATURE_NAME_SOURCE_PAIR_SOURCE_INDEX = 1;
return Parser;
});
