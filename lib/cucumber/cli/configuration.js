var Configuration = function(argv) {
  var Cucumber = require('../../cucumber');

  var argumentParser = Cucumber.Cli.ArgumentParser();
  argumentParser.parse(argv);

  var self = {
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

    getFormatter: function getFormatter() {
        var formatter,
            formatterOption = argumentParser.getOptionOrDefault(
                Cucumber.Cli.ArgumentParser.FORMATTER_OPTION_NAME, "progress");
        switch(formatterOption) {
            case "pretty":
                formatter = new Cucumber.Listener.PrettyFormatter();
                break;
            case "progress":
            default:
                formatter = new Cucumber.Listener.ProgressFormatter();
        }
        return formatter;
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
module.exports = Configuration;
