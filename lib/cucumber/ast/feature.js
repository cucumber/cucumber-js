function Feature(keyword, name, description, uri, line) {
  var Cucumber = require('../../cucumber');

  var background;
  var featureElements = Cucumber.Type.Collection();
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

    setBackground: function setBackground(newBackground) {
      background = newBackground;
    },

    getBackground: function getBackground() {
      return background;
    },

    hasBackground: function hasBackground() {
      return (typeof(background) !== 'undefined');
    },

    addFeatureElement: function addFeatureElement(featureElement) {
      var background = self.getBackground();
      featureElement.setBackground(background);
      featureElements.add(featureElement);
    },

    insertFeatureElement: function insertFeatureElement(index, featureElement) {
      var background = self.getBackground();
      featureElement.setBackground(background);
      featureElements.insert(index, featureElement);
    },

    convertScenarioOutlinesToScenarios: function convertScenarioOutlinesToScenarios() {
      featureElements.forEach(function (featureElement) {
        if (featureElement.isScenarioOutline()) {
          self.convertScenarioOutlineToScenarios(featureElement);
        }
      });
    },

    convertScenarioOutlineToScenarios: function convertScenarioOutlineToScenarios(scenarioOutline) {
      var scenarios = scenarioOutline.buildScenarios();
      var scenarioOutlineIndex = featureElements.indexOf(scenarioOutline);
      featureElements.removeAtIndex(scenarioOutlineIndex);
      scenarios.forEach(function (scenario, index) {
        self.insertFeatureElement(scenarioOutlineIndex + index, scenario);
      });
    },

    getFeatureElements: function getFeatureElements() {
      return featureElements;
    },

    getLastFeatureElement: function getLastFeatureElement() {
      return featureElements.getLast();
    },

    hasFeatureElements: function hasFeatureElements() {
      return featureElements.length() > 0;
    },

    addTags: function setTags(newTags) {
      tags = tags.concat(newTags);
    },

    getTags: function getTags() {
      return tags;
    },

    acceptVisitor: function acceptVisitor(visitor, callback) {
      self.instructVisitorToVisitBackground(visitor, function () {
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
      featureElements.asyncForEach(function (scenario, iterate) {
        visitor.visitScenario(scenario, iterate);
      }, callback);
    },

    filterScenarios: function filterScenarios(predicate) {
      featureElements = featureElements.filter(predicate);
    }
  };
  return self;
}

module.exports = Feature;
