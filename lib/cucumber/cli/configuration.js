function Configuration(options, args) {
  var Cucumber = require('../../cucumber');
  var path = require('path');
  var fs = require('fs');
  var _ = require('underscore');

  function getCompilerExtensions() {
    return options.compiler.map(function(compiler) {
      return compiler.split(':')[0];
    });
  }

  function getCompilerModules() {
    return options.compiler.map(function(compiler) {
      return compiler.split(':')[1];
    });
  }

  function getFeaturePaths() {
    var suppliedPaths = args.length > 0 ? args : ['features'];
    return Cucumber.Cli.FeaturePathExpander.expandPaths(suppliedPaths);
  }

  function getFeatureDirectoryPaths() {
    var featurePaths = getFeaturePaths();
    return featurePaths.map(function (featurePath) {
      return path.dirname(featurePath);
    });
  }

  function getFormatsGroupedByOutput() {
    var outputMapping = {};
    options.format.forEach(function (format) {
      var parts = format.split(':');
      var type = parts[0];
      var outputTo = parts[1] || '';
      outputMapping[outputTo] = type;
    });
    return _.map(outputMapping, function (type, outputTo) {
      var stream = process.stdout;
      if (outputTo) {
        var fd = fs.openSync(outputTo, 'w');
        stream = fs.createWriteStream(null, {fd: fd});
      }
      return {stream: stream, type: type};
    });
  }

  function getSupportCodePaths() {
    var unexpandedSupportCodePaths = options.require.length > 0 ? options.require : getFeatureDirectoryPaths();
    var extensions = ['js'].concat(getCompilerExtensions());
    return Cucumber.Cli.SupportCodePathExpander.expandPaths(unexpandedSupportCodePaths, extensions);
  }

  var self = {

    getFormatters: function getFormatters() {
      var formatters = getFormatsGroupedByOutput().map(function (format) {
        var formatterOptions = {
          coffeeScriptSnippets: options.coffee,
          snippets: options.snippets,
          showSource: options.source,
          stream: format.stream
        };

        switch(format.type) {
          case 'json':
            return Cucumber.Listener.JsonFormatter(formatterOptions);
          case 'progress':
            return Cucumber.Listener.ProgressFormatter(formatterOptions);
          case 'pretty':
            return Cucumber.Listener.PrettyFormatter(formatterOptions);
          case 'summary':
            return Cucumber.Listener.SummaryFormatter(formatterOptions);
          default:
            throw new Error('Unknown formatter name "' + format + '".');
        }
      });
      return formatters;
    },

    getFeatureSources: function getFeatureSources() {
      var featurePaths = getFeaturePaths();
      var featureSourceLoader = Cucumber.Cli.FeatureSourceLoader(featurePaths);
      return featureSourceLoader.getSources();
    },

    getAstFilter: function getAstFilter() {
      var rules = self.getTagAstFilterRules();
      rules.push(self.getSingleScenarioAstFilterRule());
      var astFilter = Cucumber.Ast.Filter(rules);
      return astFilter;
    },

    getSupportCodeLibrary: function getSupportCodeLibrary() {
      var supportCodePaths = getSupportCodePaths();
      var compilerModules = getCompilerModules();
      var supportCodeLoader = Cucumber.Cli.SupportCodeLoader(supportCodePaths, compilerModules);
      return supportCodeLoader.getSupportCodeLibrary();
    },

    getTagAstFilterRules: function getTagAstFilterRules() {
      var tagGroups = Cucumber.TagGroupParser.getTagGroupsFromStrings(options.tags);
      var rules = tagGroups.map(function (tags) {
         return Cucumber.Ast.Filter.AnyOfTagsRule(tags);
      });
      return rules;
    },

    getSingleScenarioAstFilterRule: function getSingleScenarioAstFilterRule() {
      var rule = Cucumber.Ast.Filter.ScenarioAtLineRule(args);
      return rule;
    },

    isFailFastRequested: function isFailFastRequested() {
      return options.failFast;
    },

    isDryRunRequested: function isDryRunRequested() {
      return options.dryRun;
    },

    isStrictRequested: function isStrictRequested() {
      return options.strict;
    },

    shouldFilterStackTraces: function shouldFilterStackTraces() {
      return !options.backtrace;
    },

    shouldShowSource: function shouldShowSource() {
      return options.source;
    }
  };
  return self;
}

Configuration.FEATURE_FILENAME_AND_LINENUM_REGEXP = /(.*)\:(\d*)$|.*/;

module.exports = Configuration;
