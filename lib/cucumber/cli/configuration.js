function Configuration(argv) {
  var Cucumber = require('../../cucumber');

  var argumentParser = Cucumber.Cli.ArgumentParser(argv);
  argumentParser.parse();

  var self = {
    getFormatters: function getFormatters() {
      var formats = argumentParser.getFormats();
      var formatters = formats.map(function (format) {
        var options = {
          snippets: self.shouldSnippetsBeShown(),
          snippetSyntax: argumentParser.getSnippetSyntax(),
          showSource: self.shouldShowSource(),
          stream: format.stream,
          useColors: self.shouldUseColors()
        };

        switch(format.type) {
          case Configuration.JSON_FORMAT_NAME:
            return Cucumber.Listener.JsonFormatter(options);
          case Configuration.PROGRESS_FORMAT_NAME:
            return Cucumber.Listener.ProgressFormatter(options);
          case Configuration.PRETTY_FORMAT_NAME:
            return Cucumber.Listener.PrettyFormatter(options);
          case Configuration.SUMMARY_FORMAT_NAME:
            return Cucumber.Listener.SummaryFormatter(options);
          default:
            throw new Error('Unknown formatter name "' + format + '".');
        }
      });
      return formatters;
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

    isFailFastRequested: function isFailFastRequested() {
      return argumentParser.isFailFastRequested();
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

    shouldSnippetsBeShown: function shouldSnippetsBeShown() {
      return argumentParser.shouldSnippetsBeShown();
    },

    shouldFilterStackTraces: function shouldFilterStackTraces() {
      return argumentParser.shouldFilterStackTraces();
    },

    shouldShowSource: function shouldShowSource() {
      return argumentParser.shouldShowSource();
    },

    shouldUseColors: function shouldUseColors() {
      return argumentParser.shouldUseColors();
    }
  };
  return self;
}

Configuration.JSON_FORMAT_NAME     = 'json';
Configuration.PRETTY_FORMAT_NAME   = 'pretty';
Configuration.PROGRESS_FORMAT_NAME = 'progress';
Configuration.SUMMARY_FORMAT_NAME  = 'summary';

module.exports = Configuration;
