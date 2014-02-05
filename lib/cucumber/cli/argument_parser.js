var ArgumentParser = function(argv) {
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
      featureFilePaths.forEach(function(featureFilePath) {
        var featureDirectoryPath = featureFilePath.replace(ArgumentParser.FEATURE_FILENAME_REGEXP, '');
        featureDirectoryPaths.push(featureDirectoryPath);
      });
      return featureDirectoryPaths;
    },

    getUnexpandedFeaturePaths: function unexpandedFeaturePaths() {
      var options   = self.getOptions();
      var remaining = options['argv']['remain'];
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
      return definitions;
    },

    getShortenedOptionDefinitions: function getShortenedOptionDefinitions() {
      var definitions = {};
      definitions[ArgumentParser.REQUIRE_OPTION_SHORT_NAME] = [ArgumentParser.LONG_OPTION_PREFIX + ArgumentParser.REQUIRE_OPTION_NAME];
      definitions[ArgumentParser.FORMAT_OPTION_SHORT_NAME] = [ArgumentParser.LONG_OPTION_PREFIX + ArgumentParser.FORMAT_OPTION_NAME];
      definitions[ArgumentParser.HELP_FLAG_SHORT_NAME]      = [ArgumentParser.LONG_OPTION_PREFIX + ArgumentParser.HELP_FLAG_NAME];
      return definitions;
    },

    isHelpRequested: function isHelpRequested() {
      var isHelpRequested = self.getOptionOrDefault(ArgumentParser.HELP_FLAG_NAME, ArgumentParser.DEFAULT_HELP_FLAG_VALUE);
      return isHelpRequested;
    },

    isVersionRequested: function isVersionRequested() {
      var isVersionRequested = self.getOptionOrDefault(ArgumentParser.VERSION_FLAG_NAME, ArgumentParser.DEFAULT_VERSION_FLAG_VALUE);
      return isVersionRequested;
    },

    shouldSnippetsBeInCoffeeScript: function shouldSnippetsBeInCoffeeScript() {
      var areSnippetsInCoffeeScript = self.getOptionOrDefault(ArgumentParser.COFFEE_SCRIPT_SNIPPETS_FLAG_NAME, ArgumentParser.DEFAULT_COFFEE_SCRIPT_SNIPPETS_FLAG_VALUE);
      return areSnippetsInCoffeeScript;
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
      return (typeof(optionValue) != 'undefined' ? optionValue : defaultValue);
    }
  };
  return self;
};
ArgumentParser.NUMBER_OF_LEADING_ARGS_TO_SLICE           = 2;
ArgumentParser.DEFAULT_FEATURES_DIRECTORY                = "features";
ArgumentParser.FEATURE_FILENAME_REGEXP                   = /[\/\\][^\/\\]+\.feature$/i;
ArgumentParser.LONG_OPTION_PREFIX                        = "--";
ArgumentParser.REQUIRE_OPTION_NAME                       = "require";
ArgumentParser.REQUIRE_OPTION_SHORT_NAME                 = "r";
ArgumentParser.FORMAT_OPTION_NAME                        = "format";
ArgumentParser.FORMAT_OPTION_SHORT_NAME                  = "f";
ArgumentParser.DEFAULT_FORMAT_VALUE                      = "progress";
ArgumentParser.TAGS_OPTION_NAME                          = "tags";
ArgumentParser.TAGS_OPTION_SHORT_NAME                    = "t";
ArgumentParser.HELP_FLAG_NAME                            = "help";
ArgumentParser.HELP_FLAG_SHORT_NAME                      = "h";
ArgumentParser.DEFAULT_HELP_FLAG_VALUE                   = false;
ArgumentParser.VERSION_FLAG_NAME                         = "version";
ArgumentParser.DEFAULT_VERSION_FLAG_VALUE                = false;
ArgumentParser.COFFEE_SCRIPT_SNIPPETS_FLAG_NAME          = "coffee";
ArgumentParser.DEFAULT_COFFEE_SCRIPT_SNIPPETS_FLAG_VALUE = false;
ArgumentParser.FeaturePathExpander     = require('./argument_parser/feature_path_expander');
ArgumentParser.PathExpander            = require('./argument_parser/path_expander');
ArgumentParser.SupportCodePathExpander = require('./argument_parser/support_code_path_expander');
module.exports = ArgumentParser;
