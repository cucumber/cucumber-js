function Feature(data, uri, scenarios) {
  var Cucumber = require('../../cucumber');
  var Gherkin = require('gherkin');
  var _ = require('lodash');

  var tags = [];
  if (data.tags) {
    tags = data.tags.map(function (tagData) {
      return Cucumber.Ast.Tag(tagData);
    });
  }

  var self = {
    getStepKeywordByLines: function getStepKeywordByLines(lines) {
      var steps = _.flatten(_.map(data.children, 'steps'));
      var step = _.find(steps, function(node) {
        return _.includes(lines, node.location.line);
      });
      if (step) {
        return step.keyword;
      }
    },

    getScenarioDescriptionByLines: function getScenarioDescriptionByLines(lines) {
      var element = _.find(data.children, function(node) {
        return _.includes(lines, node.location.line);
      });
      if (element) {
        return element.description;
      }
    },

    getScenarioKeyword: function() {
      return Gherkin.DIALECTS[self.getLanguage()].scenario;
    },

    getKeyword: function getKeyword() {
      return data.keyword;
    },

    getLanguage: function getKeyword() {
      return data.language;
    },

    getName: function getName() {
      return data.name;
    },

    getDescription: function getDescription() {
      return data.description;
    },

    getUri: function getUri() {
      return uri;
    },

    getLine: function getLine() {
      return data.location.line;
    },

    getTags: function getTags() {
      return tags;
    },

    getScenarios: function getScenarios() {
      return scenarios;
    }
  };

  scenarios.forEach(function(scenario) {
    scenario.setFeature(self);
  });

  return self;
}

module.exports = Feature;
