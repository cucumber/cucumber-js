var Configuration = function(argv) {
  var Cucumber = require('../../cucumber');

  var argumentParser = Cucumber.Cli.ArgumentParser(argv);
  argumentParser.parse();

  var self = {
    getFormatter: function getFormatter() {
      var formatter;
      var format  = argumentParser.getFormat();
      var options = {coffeeScriptSnippets: self.shouldSnippetsBeInCoffeeScript()};
      switch(format) {
        case Configuration.JSON_FORMAT_NAME:
          formatter = Cucumber.Listener.JsonFormatter(options);
          break;
        case Configuration.PROGRESS_FORMAT_NAME:
          formatter = Cucumber.Listener.ProgressFormatter(options);
          break;
        case Configuration.PRETTY_FORMAT_NAME:
          formatter = Cucumber.Listener.PrettyFormatter(options);
          break;
        case Configuration.SUMMARY_FORMAT_NAME:
          formatter = Cucumber.Listener.SummaryFormatter(options);
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
    },

    shouldSnippetsBeInCoffeeScript: function shouldSnippetsBeInCoffeeScript() {
      var coffeeDisplay = argumentParser.shouldSnippetsBeInCoffeeScript();
      return coffeeDisplay;
    }

  };
  return self;
};
Configuration.JSON_FORMAT_NAME     = "json";
Configuration.PRETTY_FORMAT_NAME   = "pretty";
Configuration.PROGRESS_FORMAT_NAME = "progress";
Configuration.SUMMARY_FORMAT_NAME  = "summary";
module.exports = Configuration;
