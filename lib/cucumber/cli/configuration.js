var Configuration = function(argv) {
  var Cucumber = require('../../cucumber');

  var argumentParser = Cucumber.Cli.ArgumentParser();
  argumentParser.parse(argv);

  var self = {
    getFormatter: function getFormatter() {
      var formatter;
      var format = argumentParser.getFormat();
      switch(format) {
      case Configuration.PROGRESS_FORMAT_NAME:
        formatter = Cucumber.Listener.ProgressFormatter();
        break;
      case Configuration.PRETTY_FORMAT_NAME:
        formatter = Cucumber.Listener.PrettyFormatter();
        break;
      default:
        throw new Error("Unknown formatter name \"" + format + "\".");
      }
      return formatter;
    },

    getFeatureSources: function getFeatureSources() {
      var featureFilePaths    = argumentParser.getFeatureFilePaths();
      var featureSourceLoader = Cucumber.Cli.FeatureSourceLoader(featureFilePaths);
      var featureSources      = featureSourceLoader.getSources();
      return featureSources;
    },

    getAstFilter: function getAstFilter() {
      var tagRules = self.getTagAstFilterRules();
      var astFilter = Cucumber.Ast.Filter(tagRules);
      return astFilter;
    },

    getSupportCodeLibrary: function getSupportCodeLibrary() {
      var supportCodeFilePaths = argumentParser.getSupportCodeFilePaths();
      var supportCodeLoader    = Cucumber.Cli.SupportCodeLoader(supportCodeFilePaths);
      var supportCodeLibrary   = supportCodeLoader.getSupportCodeLibrary();
      return supportCodeLibrary;
    },

    getTagAstFilterRules: function getTagAstFilterRules() {
      var tagGroups = argumentParser.getTagGroups();
      var rules = [];
      tagGroups.forEach(function(tags) {
         var rule = Cucumber.Ast.Filter.AnyOfTagsRule(tags);
         rules.push(rule);
      });
      return rules;
    },

    isHelpRequested: function isHelpRequested() {
      var isHelpRequested = argumentParser.isHelpRequested();
      return isHelpRequested;
    },

    isVersionRequested: function isVersionRequested() {
      var isVersionRequested = argumentParser.isVersionRequested();
      return isVersionRequested;
    }
  };
  return self;
};
Configuration.PRETTY_FORMAT_NAME   = "pretty";
Configuration.PROGRESS_FORMAT_NAME = "progress";
module.exports = Configuration;
