function Configuration(argv) {
  var Cucumber = require('../../cucumber');

  var argumentParser = Cucumber.Cli.ArgumentParser(argv);
  argumentParser.parse();

  var self = {
    getFormatter: function getFormatter() {
      var formatter;
      var format  = argumentParser.getFormat();
      var options = {
        coffeeScriptSnippets: self.shouldSnippetsBeInCoffeeScript(),
        snippets: self.shouldSnippetsBeShown(),
        showSource: self.shouldShowSource()
      };
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
          throw new Error('Unknown formatter name "' + format + '".');
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
      var rules = self.getTagAstFilterRules();
      rules.push(self.getSingleScenarioAstFilterRule());
      var astFilter = Cucumber.Ast.Filter(rules);
      return astFilter;
    },

    getSupportCodeLibrary: function getSupportCodeLibrary() {
      var supportCodeFilePaths = argumentParser.getSupportCodeFilePaths();
      var compilerModules      = argumentParser.getCompilerModules();
      var supportCodeLoader    = Cucumber.Cli.SupportCodeLoader(supportCodeFilePaths, compilerModules);
      var supportCodeLibrary   = supportCodeLoader.getSupportCodeLibrary();
      return supportCodeLibrary;
    },

    getTagAstFilterRules: function getTagAstFilterRules() {
      var tagGroups = argumentParser.getTagGroups();
      var rules = [];
      tagGroups.forEach(function (tags) {
         var rule = Cucumber.Ast.Filter.AnyOfTagsRule(tags);
         rules.push(rule);
      });
      return rules;
    },

    getSingleScenarioAstFilterRule: function getSingleScenarioAstFilterRule() {
      var suppliedPaths = argumentParser.getSuppliedPaths();
      var rule = Cucumber.Ast.Filter.ScenarioAtLineRule(suppliedPaths);
      return rule;
    },

    isHelpRequested: function isHelpRequested() {
      return argumentParser.isHelpRequested();
    },

    isDryRunRequested: function isDryRunRequested() {
      return argumentParser.isDryRunRequested();
    },

    isStrictRequested: function isStrictRequested() {
      return argumentParser.isStrictRequested();
    },

    isVersionRequested: function isVersionRequested() {
      return argumentParser.isVersionRequested();
    },

    shouldSnippetsBeInCoffeeScript: function shouldSnippetsBeInCoffeeScript() {
      return argumentParser.shouldSnippetsBeInCoffeeScript();
    },

    shouldSnippetsBeShown: function shouldSnippetsBeShown() {
      return argumentParser.shouldSnippetsBeShown();
    },

    shouldFilterStackTraces: function shouldFilterStackTraces() {
      return argumentParser.shouldFilterStackTraces();
    },

    shouldShowSource: function shouldShowSource() {
      return argumentParser.shouldShowSource();
    }
  };
  return self;
}

Configuration.JSON_FORMAT_NAME     = 'json';
Configuration.PRETTY_FORMAT_NAME   = 'pretty';
Configuration.PROGRESS_FORMAT_NAME = 'progress';
Configuration.SUMMARY_FORMAT_NAME  = 'summary';

module.exports = Configuration;
