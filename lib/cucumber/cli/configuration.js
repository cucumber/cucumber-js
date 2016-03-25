function Configuration(options, args) {
  var Cucumber = require('../../cucumber');
  var path = require('path');
  var fs = require('fs');
  var _ = require('lodash');

  var unexpandedFeaturePaths = ['features'];
  if (args.length > 0) {
    unexpandedFeaturePaths = [];
    args.forEach(function(arg) {
      var filename = path.basename(arg);
      if (filename[0] === '@') {
        var content = fs.readFileSync(arg, 'utf8');
        unexpandedFeaturePaths = unexpandedFeaturePaths.concat(content.split('\n'));
      } else {
        unexpandedFeaturePaths.push(arg);
      }
    });
  }

  var expandedFeaturePaths = Cucumber.Cli.FeaturePathExpander.expandPaths(unexpandedFeaturePaths);


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


  function getFeatureDirectoryPaths() {
    return expandedFeaturePaths.map(function (featurePath) {
      return path.dirname(featurePath);
    });
  }

  function getFormats() {
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

  function getSnippetSyntax () {
    if (options.snippetSyntax) {
      var snippetSyntaxPath = path.resolve(process.cwd(), options.snippetSyntax);
      return require(snippetSyntaxPath)();
    } else {
      return Cucumber.SupportCode.StepDefinitionSnippetBuilder.JavaScriptSyntax();
    }
  }

  function getSupportCodePaths() {
    var unexpandedSupportCodePaths = options.require.length > 0 ? options.require : getFeatureDirectoryPaths();
    var extensions = ['js'].concat(getCompilerExtensions());
    return Cucumber.Cli.SupportCodePathExpander.expandPaths(unexpandedSupportCodePaths, extensions);
  }

  var self = {

    getFormatters: function getFormatters() {
      var formats = getFormats();
      var snippetSyntax = getSnippetSyntax();
      var formatters = formats.map(function (format) {
        var formatterOptions = {
          snippetSyntax: snippetSyntax,
          stream: format.stream,
          useColors: options.colors
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
          case 'rerun':
            return Cucumber.Listener.RerunFormatter(formatterOptions);
          default:
            throw new Error('Unknown formatter name "' + format.type + '".');
        }
      });
      return formatters;
    },

    getFeatureSources: function getFeatureSources() {
      var featureSourceLoader = Cucumber.Cli.FeatureSourceLoader(expandedFeaturePaths);
      return featureSourceLoader.getSources();
    },

    getAstFilter: function getAstFilter() {
      var tagGroups = Cucumber.TagGroupParser.getTagGroupsFromStrings(options.tags);
      var tagRules = tagGroups.map(function (tags) {
         return Cucumber.Ast.Filter.AnyOfTagsRule(tags);
      });
      var lineRule = Cucumber.Ast.Filter.ScenarioAtLineRule(unexpandedFeaturePaths);
      var nameRule = Cucumber.Ast.Filter.AnyOfNamesRule(options.name);
      var rules = tagRules.concat([lineRule, nameRule]);
      return Cucumber.Ast.Filter(rules);
    },

    getSupportCodeLibrary: function getSupportCodeLibrary() {
      var supportCodePaths = getSupportCodePaths();
      var compilerModules = getCompilerModules();
      var supportCodeLoader = Cucumber.Cli.SupportCodeLoader(supportCodePaths, compilerModules);
      return supportCodeLoader.getSupportCodeLibrary();
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
    }
  };
  return self;
}

Configuration.FEATURE_FILENAME_AND_LINENUM_REGEXP = /([^\:]*)((?::[\d]+)+)?/;

module.exports = Configuration;
