var Feature = function(keyword, name, description, uri, line) {
  var Cucumber = require('../../cucumber');

  var background;
  var scenarios = Cucumber.Type.Collection();
  var tags      = [];

  var self = {
    getKeyword: function getKeyword() {
      return keyword;
    },

    getName: function getName() {
      return name;
    },

    getDescription: function getDescription() {
      return description;
    },

    getUri: function getUri() {
      return uri;
    },

    getLine: function getLine() {
      return line;
    },

    addBackground: function addBackground(newBackground) {
      background = newBackground;
    },

    getBackground: function getBackground() {
      return background;
    },

    hasBackground: function hasBackground() {
      return (typeof(background) != 'undefined');
    },

    addScenario: function addScenario(scenario) {
      var background = self.getBackground();
      scenario.setBackground(background);
      scenarios.add(scenario);
    },

    getLastScenario: function getLastScenario() {
      return scenarios.getLast();
    },

    hasScenarios: function hasScenarios() {
      return scenarios.length() > 0;
    },

    addTags: function setTags(newTags) {
      tags = tags.concat(newTags);
    },

    getTags: function getTags() {
      return tags;
    },

    acceptVisitor: function acceptVisitor(visitor, callback) {
      self.instructVisitorToVisitBackground(visitor, function() {
        self.instructVisitorToVisitScenarios(visitor, callback);
      });
    },

    instructVisitorToVisitBackground: function instructVisitorToVisitBackground(visitor, callback) {
      if (self.hasBackground()) {
        var background = self.getBackground();
        visitor.visitBackground(background, callback);
      } else {
        callback();
      }
    },

    instructVisitorToVisitScenarios: function instructVisitorToVisitScenarios(visitor, callback) {
      scenarios.forEach(function(scenario, iterate) {
        visitor.visitScenario(scenario, iterate);
      }, callback);
    }
  };
  return self;
};
module.exports = Feature;
