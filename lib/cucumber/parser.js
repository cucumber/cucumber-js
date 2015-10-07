function Parser(featureSources, astFilter) {
  var GherkinLexer = require('./gherkin_lexer');
  var Cucumber     = require('../cucumber');

  var features     = Cucumber.Ast.Features();
  var astAssembler = Cucumber.Ast.Assembler(features, astFilter);
  var currentSourceUri;

  var self = {
    parse: function parse() {
      var len = featureSources.length;
      for (var i = 0; i < len; i++) {
        var currentSourceUri = featureSources[i][Parser.FEATURE_NAME_SOURCE_PAIR_URI_INDEX];
        var featureSource    = featureSources[i][Parser.FEATURE_NAME_SOURCE_PAIR_SOURCE_INDEX];
        self.setCurrentSourceUri(currentSourceUri);
        var lexer = new GherkinLexer(featureSource.toString(), self.getEventHandlers());
        try {
          lexer.scan();
        } catch(e) {
          e.message += '\npath: ' + currentSourceUri;
          throw e;
        }
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
      /* jshint -W106 */
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
      /* jshint +W106 */
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
      var astTag = Cucumber.Ast.Tag(tag, uri, line);
      astAssembler.insertTag(astTag);
    },

    handleScenarioOutline: function handleScenarioOutline(keyword, name, description, line) {
      var uri     = self.getCurrentSourceUri();
      var outline = Cucumber.Ast.ScenarioOutline(keyword, name, description, uri, line);
      astAssembler.insertScenario(outline);
    },

    handleExamples: function handleExamples(keyword, name, description, line) {
      var examples = Cucumber.Ast.Examples(keyword, name, description, line);
      astAssembler.insertExamples(examples);
    }
  };
  return self;
}

Parser.FEATURE_NAME_SOURCE_PAIR_URI_INDEX = 0;
Parser.FEATURE_NAME_SOURCE_PAIR_SOURCE_INDEX = 1;

module.exports = Parser;
