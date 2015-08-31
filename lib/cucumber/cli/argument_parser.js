function ArgumentParser(argv) {
  var Cucumber = require('../../cucumber');

  var nopt = require('nopt');
  var path = require('path');
  var _ = require('underscore');
  var options;

  var self = {
    parse: function parse() {
      var args = argv.slice(ArgumentParser.NUMBER_OF_LEADING_ARGS_TO_SLICE);
      var expandedArgs = self.getExpandedArgs(args);
      var options = self.argsToOptions(expandedArgs);
      self.storeOptions(options);
    },

    argsToOptions: function argsToOptions(args) {
      var knownOptionDefinitions     = self.getKnownOptionDefinitions();
      var shortenedOptionDefinitions = self.getShortenedOptionDefinitions();
      var options = nopt(knownOptionDefinitions,
                         shortenedOptionDefinitions,
                         args,
                         0);
      return options;
    },

    getExpandedArgs: function getExpandedArgv(args) {
      var options = self.argsToOptions(args);
      var profiles = options[ArgumentParser.PROFILE_OPTION_NAME];
      var profileDefinitions = ArgumentParser.ProfileDefinitionLoader.getDefinitions();
      if (typeof(profiles) === 'undefined') {
        if (profileDefinitions['default']) {
          profiles = ['default'];
        } else {
          return args;
        }
      }
      var profilesArgs = profiles.map(function (profile){
        if (!profileDefinitions[profile]){
          throw new Error('Undefined profile: ' + profile);
        }
        return profileDefinitions[profile].split(/\s/);
      });
      return _.flatten(profilesArgs).concat(args);
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
      var suppliedPaths = this.getSuppliedPaths();
      var paths         = (suppliedPaths.length > 0 ? suppliedPaths : [ArgumentParser.DEFAULT_FEATURES_DIRECTORY]);
      return paths;
    },

    getSuppliedPaths: function getSuppliedPaths() {
      var options = self.getOptions();
      return options.argv.remain;
    },

    getSupportCodeFilePaths: function getSupportCodeFilePaths() {
      var unexpandedSupportCodeFilePaths = self.getUnexpandedSupportCodeFilePaths();
      var extensions                     = ['js'].concat(self.getCompilerExtensions());
      var expandedSupportCodePaths       = ArgumentParser.SupportCodePathExpander.expandPaths(unexpandedSupportCodeFilePaths, extensions);
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

    getCompilerExtensions: function getCompilerExtensions() {
      var compilers = self.getOptionOrDefault(ArgumentParser.COMPILER_OPTION_NAME, []);
      var extensions = compilers.map(function(compiler) {
        return compiler.split(':')[0];
      });
      return extensions;
    },

    getCompilerModules: function getCompilerModules() {
      var compilers = self.getOptionOrDefault(ArgumentParser.COMPILER_OPTION_NAME, []);
      var modules = compilers.map(function(compiler) {
        return compiler.split(':')[1];
      });
      return modules;
    },

    getFormat: function getFormat() {
      var format = self.getOptionOrDefault(ArgumentParser.FORMAT_OPTION_NAME, ArgumentParser.DEFAULT_FORMAT_VALUE);
      return format;
    },

    getKnownOptionDefinitions: function getKnownOptionDefinitions() {
      var definitions = {};
      definitions[ArgumentParser.REQUIRE_OPTION_NAME]              = [path, Array];
      definitions[ArgumentParser.TAGS_OPTION_NAME]                 = [String, Array];
      definitions[ArgumentParser.COMPILER_OPTION_NAME]             = [String, Array];
      definitions[ArgumentParser.PROFILE_OPTION_NAME]              = [String, Array];
      definitions[ArgumentParser.FORMAT_OPTION_NAME]               = String;
      definitions[ArgumentParser.HELP_FLAG_NAME]                   = Boolean;
      definitions[ArgumentParser.VERSION_FLAG_NAME]                = Boolean;
      definitions[ArgumentParser.COFFEE_SCRIPT_SNIPPETS_FLAG_NAME] = Boolean;
      definitions[ArgumentParser.SNIPPETS_FLAG_NAME]               = Boolean;
      definitions[ArgumentParser.STRICT_FLAG_NAME]                 = Boolean;
      definitions[ArgumentParser.DRY_RUN_FLAG_NAME]                = Boolean;
      definitions[ArgumentParser.BACKTRACE_FLAG_NAME]              = Boolean;
      definitions[ArgumentParser.SOURCE_FLAG_NAME]                 = Boolean;
      return definitions;
    },

    getShortenedOptionDefinitions: function getShortenedOptionDefinitions() {
      var definitions = {};
      definitions[ArgumentParser.REQUIRE_OPTION_SHORT_NAME] = [ArgumentParser.LONG_OPTION_PREFIX + ArgumentParser.REQUIRE_OPTION_NAME];
      definitions[ArgumentParser.FORMAT_OPTION_SHORT_NAME]  = [ArgumentParser.LONG_OPTION_PREFIX + ArgumentParser.FORMAT_OPTION_NAME];
      definitions[ArgumentParser.PROFILE_OPTION_SHORT_NAME] = [ArgumentParser.LONG_OPTION_PREFIX + ArgumentParser.PROFILE_OPTION_NAME];
      definitions[ArgumentParser.HELP_FLAG_SHORT_NAME]      = [ArgumentParser.LONG_OPTION_PREFIX + ArgumentParser.HELP_FLAG_NAME];
      definitions[ArgumentParser.SNIPPETS_FLAG_SHORT_NAME]  = [ArgumentParser.LONG_OPTION_PREFIX + 'no-' + ArgumentParser.SNIPPETS_FLAG_NAME];
      definitions[ArgumentParser.STRICT_FLAG_SHORT_NAME]    = [ArgumentParser.LONG_OPTION_PREFIX + ArgumentParser.STRICT_FLAG_NAME];
      definitions[ArgumentParser.DRY_RUN_FLAG_SHORT_NAME]   = [ArgumentParser.LONG_OPTION_PREFIX + ArgumentParser.DRY_RUN_FLAG_NAME];
      definitions[ArgumentParser.BACKTRACE_FLAG_SHORT_NAME] = [ArgumentParser.LONG_OPTION_PREFIX + ArgumentParser.BACKTRACE_FLAG_NAME];
      return definitions;
    },

    isStrictRequested: function isStrictRequested() {
      return self.getOptionOrDefault(ArgumentParser.STRICT_FLAG_NAME, ArgumentParser.DEFAULT_STRICT_FLAG_VALUE);
    },

    isHelpRequested: function isHelpRequested() {
      return self.getOptionOrDefault(ArgumentParser.HELP_FLAG_NAME, ArgumentParser.DEFAULT_HELP_FLAG_VALUE);
    },

    isDryRunRequested: function isDryRunRequested() {
      return self.getOptionOrDefault(ArgumentParser.DRY_RUN_FLAG_NAME, ArgumentParser.DEFAULT_DRY_RUN_FLAG_VALUE);
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

    shouldShowSource: function shouldShowSource () {
      var isSourceRequested = self.getOptionOrDefault(ArgumentParser.SOURCE_FLAG_NAME, ArgumentParser.DEFAULT_SOURCE_FLAG_VALUE);
      return isSourceRequested;
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
ArgumentParser.COMPILER_OPTION_NAME                      = 'compiler';
ArgumentParser.REQUIRE_OPTION_NAME                       = 'require';
ArgumentParser.REQUIRE_OPTION_SHORT_NAME                 = 'r';
ArgumentParser.FORMAT_OPTION_NAME                        = 'format';
ArgumentParser.FORMAT_OPTION_SHORT_NAME                  = 'f';
ArgumentParser.DEFAULT_FORMAT_VALUE                      = 'pretty';
ArgumentParser.PROFILE_OPTION_NAME                       = 'profile';
ArgumentParser.PROFILE_OPTION_FLAG_SHORT_NAME            = 'p';
ArgumentParser.TAGS_OPTION_NAME                          = 'tags';
ArgumentParser.TAGS_OPTION_SHORT_NAME                    = 't';
ArgumentParser.HELP_FLAG_NAME                            = 'help';
ArgumentParser.HELP_FLAG_SHORT_NAME                      = 'h';
ArgumentParser.DRY_RUN_FLAG_NAME                         = 'dry-run';
ArgumentParser.DRY_RUN_FLAG_SHORT_NAME                   = 'd';
ArgumentParser.STRICT_FLAG_NAME                          = 'strict';
ArgumentParser.STRICT_FLAG_SHORT_NAME                    = 'S';
ArgumentParser.DEFAULT_HELP_FLAG_VALUE                   = false;
ArgumentParser.DEFAULT_DRY_RUN_FLAG_VALUE                = false;
ArgumentParser.DEFAULT_STRICT_FLAG_VALUE                 = false;
ArgumentParser.VERSION_FLAG_NAME                         = 'version';
ArgumentParser.DEFAULT_VERSION_FLAG_VALUE                = false;
ArgumentParser.COFFEE_SCRIPT_SNIPPETS_FLAG_NAME          = 'coffee';
ArgumentParser.DEFAULT_COFFEE_SCRIPT_SNIPPETS_FLAG_VALUE = false;
ArgumentParser.SOURCE_FLAG_NAME                          = 'source';
ArgumentParser.DEFAULT_SOURCE_FLAG_VALUE                 = true;
ArgumentParser.SNIPPETS_FLAG_NAME                        = 'snippets';
ArgumentParser.SNIPPETS_FLAG_SHORT_NAME                  = 'i';
ArgumentParser.DEFAULT_SNIPPETS_FLAG_VALUE               = true;
ArgumentParser.BACKTRACE_FLAG_NAME                       = 'backtrace';
ArgumentParser.BACKTRACE_FLAG_SHORT_NAME                 = 'b';
ArgumentParser.DEFAULT_BACKTRACE_FLAG_VALUE              = false;
ArgumentParser.FeaturePathExpander                       = require('./argument_parser/feature_path_expander');
ArgumentParser.PathExpander                              = require('./argument_parser/path_expander');
ArgumentParser.ProfileDefinitionLoader                   = require('./argument_parser/profile_definition_loader');
ArgumentParser.SupportCodePathExpander                   = require('./argument_parser/support_code_path_expander');

module.exports = ArgumentParser;
