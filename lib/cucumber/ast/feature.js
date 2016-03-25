function Feature(data, scenarios) {
  var Cucumber = require('../../cucumber');
  var Gherkin = require('gherkin');
  var _ = require('lodash')

  var tags = [];
  if (data.tags) {
    tags = data.tags.map(function (tagData) {
      return Cucumber.Ast.Tag(tagData);
    });
  }

  var self = {
    findStepByLine: function findStepByLine(line) {
      var steps = _.flatten(_.map(data.children, function(node) { return node.steps }));
      return _.find(steps, function(node) {
        return node.location.line === line;
      })
    },

    getScenarioKeyword: function() {
      return Gherkin.DIALECTS[data.language].scenario;
    },

    getKeyword: function getKeyword() {
      return data.keyword;
    },

    getName: function getName() {
      return data.name;
    },

    getDescription: function getDescription() {
      return data.description;
    },

    getUri: function getUri() {
      return data.uri;
    },

    getLine: function getLine() {
      return data.location.line;
    },

    getTags: function getTags() {
      return tags;
    },

    acceptVisitor: function acceptVisitor(visitor, callback) {
      Cucumber.Util.asyncForEach(scenarios, visitor.visitScenario, callback);
    }
  };
  return self;
}

module.exports = Feature;
