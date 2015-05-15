function ArgumentParser(argv) {
  var Cucumber = require('../../cucumber');

  var nopt = require('nopt');
  var path = require('path');
  var options;

  var self = {
    parse: function parse() {
      var knownOptionDefinitions     = self.getKnownOptionDefinitions();
      var shortenedOptionDefinitions = self.getShortenedOptionDefinitions();
      var options = nopt(knownOptionDefinitions,
                         shortenedOptionDefinitions,
                         argv,
                         ArgumentParser.NUMBER_OF_LEADING_ARGS_TO_SLICE);
      self.storeOptions(options);
    },

    getFeatureFilePaths: function getFeatureFilePaths() {
      var unexpandedFeaturePaths = self.getUnexpandedFeaturePaths();
      var expandedFeaturePaths   = ArgumentParser.FeaturePathExpander.expandPaths(unexpandedFeaturePaths);
      return expandedFeaturePaths;
    },

    getFeatureDirectoryPaths: function getFeatureDirectoryPaths() {
      var featureDirectoryPaths = [];
      var featureFilePaths      = self.getFeatureFilePaths();
      featureFilePaths.forEach(function (featureFilePath) {
        var featureDirectoryPath = featureFilePath.replace(ArgumentParser.FEATURE_FILENAME_REGEXP, '');
        featureDirectoryPaths.push(featureDirectoryPath);
      });
      return featureDirectoryPaths;
    },

    getUnexpandedFeaturePaths: function unexpandedFeaturePaths() {
      var options   = self.getOptions();
      var remaining = options.argv.remain;
      var paths     = (remaining.length > 0 ? remaining : [ArgumentParser.DEFAULT_FEATURES_DIRECTORY]);
      return paths;
    },

    getSupportCodeFilePaths: function getSupportCodeFilePaths() {
      var unexpandedSupportCodeFilePaths = self.getUnexpandedSupportCodeFilePaths();
      var expandedSupportCodePaths       = ArgumentParser.SupportCodePathExpander.expandPaths(unexpandedSupportCodeFilePaths);
      return expandedSupportCodePaths;
    },

    getUnexpandedSupportCodeFilePaths: function getUnexpandedSupportCodeFilePaths() {
      var unexpandedFeatureDirectoryPaths = self.getFeatureDirectoryPaths();
      var unexpandedSupportCodeFilePaths  = self.getOptionOrDefault(ArgumentParser.REQUIRE_OPTION_NAME, unexpandedFeatureDirectoryPaths);
      return unexpandedSupportCodeFilePaths;
    },

    getTagGroups: function getTagGroups() {
      var tagOptionValues = self.getOptionOrDefault(ArgumentParser.TAGS_OPTION_NAME, []);
      var tagGroups       = Cucumber.TagGroupParser.getTagGroupsFromStrings(tagOptionValues);
      return tagGroups;
    },

    getFormat: function getFormat() {
      var format = self.getOptionOrDefault(ArgumentParser.FORMAT_OPTION_NAME, ArgumentParser.DEFAULT_FORMAT_VALUE);
      return format;
    },

    getKnownOptionDefinitions: function getKnownOptionDefinitions() {
      var definitions = {};
      definitions[ArgumentParser.REQUIRE_OPTION_NAME]              = [path, Array];
      definitions[ArgumentParser.TAGS_OPTION_NAME]                 = [String, Array];
      definitions[ArgumentParser.FORMAT_OPTION_NAME]               = String;
      definitions[ArgumentParser.HELP_FLAG_NAME]                   = Boolean;
      definitions[ArgumentParser.VERSION_FLAG_NAME]                = Boolean;
      definitions[ArgumentParser.COFFEE_SCRIPT_SNIPPETS_FLAG_NAME] = Boolean;
      definitions[ArgumentParser.SNIPPETS_FLAG_NAME]               = Boolean;
      definitions[ArgumentParser.STRICT_FLAG_NAME]                 = Boolean;
      definitions[ArgumentParser.BACKTRACE_FLAG_NAME]              = Boolean;
      return definitions;
    },

    getShortenedOptionDefinitions: function getShortenedOptionDefinitions() {
      var definitions = {};
      definitions[ArgumentParser.REQUIRE_OPTION_SHORT_NAME] = [ArgumentParser.LONG_OPTION_PREFIX + ArgumentParser.REQUIRE_OPTION_NAME];
      definitions[ArgumentParser.FORMAT_OPTION_SHORT_NAME]  = [ArgumentParser.LONG_OPTION_PREFIX + ArgumentParser.FORMAT_OPTION_NAME];
      definitions[ArgumentParser.HELP_FLAG_SHORT_NAME]      = [ArgumentParser.LONG_OPTION_PREFIX + ArgumentParser.HELP_FLAG_NAME];
      definitions[ArgumentParser.SNIPPETS_FLAG_SHORT_NAME]  = [ArgumentParser.LONG_OPTION_PREFIX + 'no-' + ArgumentParser.SNIPPETS_FLAG_NAME];
      definitions[ArgumentParser.STRICT_FLAG_SHORT_NAME]    = [ArgumentParser.LONG_OPTION_PREFIX + ArgumentParser.STRICT_FLAG_NAME];
      definitions[ArgumentParser.BACKTRACE_FLAG_SHORT_NAME] = [ArgumentParser.LONG_OPTION_PREFIX + ArgumentParser.BACKTRACE_FLAG_NAME];
      return definitions;
    },

    isStrictRequested: function isStrictRequested() {
      return self.getOptionOrDefault(ArgumentParser.STRICT_FLAG_NAME, ArgumentParser.DEFAULT_STRICT_FLAG_VALUE);
    },

    isHelpRequested: function isHelpRequested() {
      return self.getOptionOrDefault(ArgumentParser.HELP_FLAG_NAME, ArgumentParser.DEFAULT_HELP_FLAG_VALUE);
    },

    isVersionRequested: function isVersionRequested() {
      return self.getOptionOrDefault(ArgumentParser.VERSION_FLAG_NAME, ArgumentParser.DEFAULT_VERSION_FLAG_VALUE);
    },

    shouldSnippetsBeInCoffeeScript: function shouldSnippetsBeInCoffeeScript() {
      return self.getOptionOrDefault(ArgumentParser.COFFEE_SCRIPT_SNIPPETS_FLAG_NAME, ArgumentParser.DEFAULT_COFFEE_SCRIPT_SNIPPETS_FLAG_VALUE);
    },

    shouldSnippetsBeShown: function shouldSnippetsBeInCoffeeScript() {
      return self.getOptionOrDefault(ArgumentParser.SNIPPETS_FLAG_NAME, ArgumentParser.DEFAULT_SNIPPETS_FLAG_VALUE);
    },

    shouldFilterStackTraces: function shouldFilterStackTraces() {
      return !self.getOptionOrDefault(ArgumentParser.BACKTRACE_FLAG_NAME, ArgumentParser.DEFAULT_BACKTRACE_FLAG_VALUE);
    },

    storeOptions: function storeOptions(newOptions) {
      options = newOptions;
    },

    getOptions: function getOptions() {
      return options;
    },

    getOptionOrDefault: function getOptionOrDefault(optionName, defaultValue) {
      var options     = self.getOptions();
      var optionValue = options[optionName];
      return (typeof(optionValue) !== 'undefined' ? optionValue : defaultValue);
    }
  };
  return self;
}

ArgumentParser.NUMBER_OF_LEADING_ARGS_TO_SLICE           = 2;
ArgumentParser.DEFAULT_FEATURES_DIRECTORY                = 'features';
ArgumentParser.FEATURE_FILENAME_REGEXP                   = /[\/\\][^\/\\]+\.feature(:\d+)*$/i;
ArgumentParser.FEATURE_FILENAME_AND_LINENUM_REGEXP       = /(.*)\:(\d*)$|.*/; //fullmatch, filewithoutlinenum, linenum
ArgumentParser.LONG_OPTION_PREFIX                        = '--';
ArgumentParser.REQUIRE_OPTION_NAME                       = 'require';
ArgumentParser.REQUIRE_OPTION_SHORT_NAME                 = 'r';
ArgumentParser.FORMAT_OPTION_NAME                        = 'format';
ArgumentParser.FORMAT_OPTION_SHORT_NAME                  = 'f';
ArgumentParser.DEFAULT_FORMAT_VALUE                      = 'pretty';
ArgumentParser.TAGS_OPTION_NAME                          = 'tags';
ArgumentParser.TAGS_OPTION_SHORT_NAME                    = 't';
ArgumentParser.HELP_FLAG_NAME                            = 'help';
ArgumentParser.HELP_FLAG_SHORT_NAME                      = 'h';
ArgumentParser.STRICT_FLAG_NAME                          = 'strict';
ArgumentParser.STRICT_FLAG_SHORT_NAME                    = 'S';
ArgumentParser.DEFAULT_HELP_FLAG_VALUE                   = false;
ArgumentParser.DEFAULT_STRICT_FLAG_VALUE                 = false;
ArgumentParser.VERSION_FLAG_NAME                         = 'version';
ArgumentParser.DEFAULT_VERSION_FLAG_VALUE                = false;
ArgumentParser.COFFEE_SCRIPT_SNIPPETS_FLAG_NAME          = 'coffee';
ArgumentParser.DEFAULT_COFFEE_SCRIPT_SNIPPETS_FLAG_VALUE = false;
ArgumentParser.SNIPPETS_FLAG_NAME                        = 'snippets';
ArgumentParser.SNIPPETS_FLAG_SHORT_NAME                  = 'i';
ArgumentParser.DEFAULT_SNIPPETS_FLAG_VALUE               = true;
ArgumentParser.BACKTRACE_FLAG_NAME                       = 'backtrace';
ArgumentParser.BACKTRACE_FLAG_SHORT_NAME                 = 'b';
ArgumentParser.DEFAULT_BACKTRACE_FLAG_VALUE              = false;
ArgumentParser.FeaturePathExpander                       = require('./argument_parser/feature_path_expander');
ArgumentParser.PathExpander                              = require('./argument_parser/path_expander');
ArgumentParser.SupportCodePathExpander                   = require('./argument_parser/support_code_path_expander');

module.exports = ArgumentParser;
