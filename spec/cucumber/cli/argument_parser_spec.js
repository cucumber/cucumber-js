require('../../support/spec_helper');

describe("Cucumber.Cli.ArgumentParser", function () {
  var Cucumber = requireLib('cucumber');
  var path     = require('path');
  var nopt;

  var argumentParser, argv;

  beforeEach(function () {
    nopt           = spyOnModule('nopt'); // stubbed BEFORE ArgumentParser() is called.
    argv           = createSpy("arguments (argv)");
    argumentParser = Cucumber.Cli.ArgumentParser(argv);
  });

  describe("parse()", function () {
    var knownOptionDefinitions, shortenedOptionDefinitions;
    var options;

    beforeEach(function () {
      knownOptionDefinitions     = createSpy("known option definitions");
      shortenedOptionDefinitions = createSpy("shortened option definitions");
      options                    = createSpy("parsed options");
      nopt.andReturn(options);
      spyOn(argumentParser, 'getKnownOptionDefinitions').andReturn(knownOptionDefinitions);
      spyOn(argumentParser, 'getShortenedOptionDefinitions').andReturn(shortenedOptionDefinitions);
      spyOn(argumentParser, 'storeOptions');
    });

    it("gets the known option definitions", function () {
      argumentParser.parse();
      expect(argumentParser.getKnownOptionDefinitions).toHaveBeenCalled();
    });

    it("gets the shortened option definitions", function () {
      argumentParser.parse();
      expect(argumentParser.getShortenedOptionDefinitions).toHaveBeenCalled();
    });

    it("gets the options from nopt based on the definitions and argv", function () {
      argumentParser.parse();
      expect(nopt).toHaveBeenCalledWith(knownOptionDefinitions, shortenedOptionDefinitions, argv, Cucumber.Cli.ArgumentParser.NUMBER_OF_LEADING_ARGS_TO_SLICE);
    });

    it("stores the options", function () {
      argumentParser.parse();
      expect(argumentParser.storeOptions).toHaveBeenCalledWith(options);
    });
  });

  describe("getKnownOptionDefinitions()", function () {
    it("returns a hash", function () {
      var knownOptionDefinitions = argumentParser.getKnownOptionDefinitions();
      expect(typeof(knownOptionDefinitions)).toBe('object');
    });

    it("defines a --require option to accept paths", function () {
      var knownOptionDefinitions = argumentParser.getKnownOptionDefinitions();
      expect(knownOptionDefinitions[Cucumber.Cli.ArgumentParser.REQUIRE_OPTION_NAME]).toEqual([path, Array]);
    });

    it("defines a --tags option to include and exclude tags", function () {
      var knownOptionDefinitions = argumentParser.getKnownOptionDefinitions();
      expect(knownOptionDefinitions[Cucumber.Cli.ArgumentParser.TAGS_OPTION_NAME]).toEqual([String, Array]);
    });

    it("defines a --format option to specify the format", function () {
      var knownOptionDefinitions = argumentParser.getKnownOptionDefinitions();
      expect(knownOptionDefinitions[Cucumber.Cli.ArgumentParser.FORMAT_OPTION_NAME]).toEqual(String);
    });

    it("defines a --strict flag", function () {
      var knownOptionDefinitions = argumentParser.getKnownOptionDefinitions();
      expect(knownOptionDefinitions[Cucumber.Cli.ArgumentParser.STRICT_FLAG_NAME]).toEqual(Boolean);
    });

    it("defines a --help flag", function () {
      var knownOptionDefinitions = argumentParser.getKnownOptionDefinitions();
      expect(knownOptionDefinitions[Cucumber.Cli.ArgumentParser.HELP_FLAG_NAME]).toEqual(Boolean);
    });

    it("defines a --version flag", function () {
      var knownOptionDefinitions = argumentParser.getKnownOptionDefinitions();
      expect(knownOptionDefinitions[Cucumber.Cli.ArgumentParser.VERSION_FLAG_NAME]).toEqual(Boolean);
    });

    it("defines a --no-snippets flag", function () {
      var knownOptionDefinitions = argumentParser.getKnownOptionDefinitions();
      expect(knownOptionDefinitions[Cucumber.Cli.ArgumentParser.SNIPPETS_FLAG_NAME]).toEqual(Boolean);
    });

    it("defines a --backtrace flag", function () {
      var knownOptionDefinitions = argumentParser.getKnownOptionDefinitions();
      expect(knownOptionDefinitions[Cucumber.Cli.ArgumentParser.BACKTRACE_FLAG_NAME]).toEqual(Boolean);
    });
  });

  describe("getShortenedOptionDefinitions()", function () {
    it("returns a hash", function () {
      var shortenedOptionDefinitions = argumentParser.getShortenedOptionDefinitions();
      expect(typeof(shortenedOptionDefinitions)).toBe('object');
    });

    it("defines an alias to --require as -r", function () {
      var optionName = Cucumber.Cli.ArgumentParser.LONG_OPTION_PREFIX + Cucumber.Cli.ArgumentParser.REQUIRE_OPTION_NAME;
      var aliasName  = Cucumber.Cli.ArgumentParser.REQUIRE_OPTION_SHORT_NAME;
      var aliasValue = [optionName];
      var shortenedOptionDefinitions = argumentParser.getShortenedOptionDefinitions();
      expect(shortenedOptionDefinitions[aliasName]).toEqual(aliasValue);
    });

    it("defines an alias to --format as -f", function () {
      var optionName = Cucumber.Cli.ArgumentParser.LONG_OPTION_PREFIX + Cucumber.Cli.ArgumentParser.FORMAT_OPTION_NAME;
      var aliasName  = Cucumber.Cli.ArgumentParser.FORMAT_OPTION_SHORT_NAME;
      var aliasValue = [optionName];
      var shortenedOptionDefinitions = argumentParser.getShortenedOptionDefinitions();
      expect(shortenedOptionDefinitions[aliasName]).toEqual(aliasValue);
    });

    it("defines an alias to --strict as -s", function () {
      var optionName = Cucumber.Cli.ArgumentParser.LONG_OPTION_PREFIX + Cucumber.Cli.ArgumentParser.STRICT_FLAG_NAME;
      var aliasName  = Cucumber.Cli.ArgumentParser.STRICT_FLAG_SHORT_NAME;
      var aliasValue = [optionName];
      var shortenedOptionDefinitions = argumentParser.getShortenedOptionDefinitions();
      expect(shortenedOptionDefinitions[aliasName]).toEqual(aliasValue);
    });

    it("defines an alias to --help as -h", function () {
      var optionName = Cucumber.Cli.ArgumentParser.LONG_OPTION_PREFIX + Cucumber.Cli.ArgumentParser.HELP_FLAG_NAME;
      var aliasName  = Cucumber.Cli.ArgumentParser.HELP_FLAG_SHORT_NAME;
      var aliasValue = [optionName];
      var shortenedOptionDefinitions = argumentParser.getShortenedOptionDefinitions();
      expect(shortenedOptionDefinitions[aliasName]).toEqual(aliasValue);
    });

    it("defines an alias to --no-snippets as -i", function () {
      var optionName = Cucumber.Cli.ArgumentParser.LONG_OPTION_PREFIX + "no-" + Cucumber.Cli.ArgumentParser.SNIPPETS_FLAG_NAME;
      var aliasName  = Cucumber.Cli.ArgumentParser.SNIPPETS_FLAG_SHORT_NAME;
      var aliasValue = [optionName];
      var shortenedOptionDefinitions = argumentParser.getShortenedOptionDefinitions();
      expect(shortenedOptionDefinitions[aliasName]).toEqual(aliasValue);
    });

    it("defines an alias to --backtrace as -b", function () {
      var optionName = Cucumber.Cli.ArgumentParser.LONG_OPTION_PREFIX + Cucumber.Cli.ArgumentParser.BACKTRACE_FLAG_NAME;
      var aliasName  = Cucumber.Cli.ArgumentParser.BACKTRACE_FLAG_SHORT_NAME;
      var aliasValue = [optionName];
      var shortenedOptionDefinitions = argumentParser.getShortenedOptionDefinitions();
      expect(shortenedOptionDefinitions[aliasName]).toEqual(aliasValue);
    });
  });

  describe("getFeatureFilePaths()", function () {
    var Cucumber = requireLib('cucumber');

    var unexpandedFeaturePaths;
    var expandedFeaturePaths;

    beforeEach(function () {
      unexpandedFeaturePaths = createSpy("unexpanded feature paths");
      expandedFeaturePaths   = createSpy("expanded feature paths");
      spyOn(argumentParser, 'getUnexpandedFeaturePaths').andReturn(unexpandedFeaturePaths);
      spyOn(Cucumber.Cli.ArgumentParser.FeaturePathExpander, 'expandPaths').andReturn(expandedFeaturePaths);
    });

    it("gets the unexpanded feature file paths", function () {
      argumentParser.getFeatureFilePaths();
      expect(argumentParser.getUnexpandedFeaturePaths).toHaveBeenCalled();
    });

    it("asks the feature path expander to expand the paths", function () {
      argumentParser.getFeatureFilePaths();
      expect(Cucumber.Cli.ArgumentParser.FeaturePathExpander.expandPaths).toHaveBeenCalledWith(unexpandedFeaturePaths);
    });

    it("returns the expanded feature file paths", function () {
      expect(argumentParser.getFeatureFilePaths()).toBe(expandedFeaturePaths);
    });
  });

  describe("getFeatureDirectoryPaths()", function () {
    var featureFilePaths, featureDirectoryPaths;

    beforeEach(function () {
      featureDirectoryPaths = [createSpy("first feature directory path"),
                               createSpy("second feature directory path")];
      featureFilePaths      = [createSpyWithStubs("first feature path",
                                                  {replace: featureDirectoryPaths[0]}),
                               createSpyWithStubs("second feature path",
                                                  {replace: featureDirectoryPaths[1]})];
      spyOn(argumentParser, 'getFeatureFilePaths').andReturn(featureFilePaths);
    });

    it("gets the feature file paths", function () {
      argumentParser.getFeatureDirectoryPaths();
      expect(argumentParser.getFeatureFilePaths).toHaveBeenCalled();
    });

    it("strips off the feature file name from each path", function () {
      argumentParser.getFeatureDirectoryPaths();
      featureFilePaths.forEach(function (featureFilePath) {
        expect(featureFilePath.replace).toHaveBeenCalledWith(Cucumber.Cli.ArgumentParser.FEATURE_FILENAME_REGEXP, '');
      });
    });

    it("returns the paths", function () {
      expect(argumentParser.getFeatureDirectoryPaths()).toEqual(featureDirectoryPaths);
    });
  });

  describe("getUnexpandedFeaturePaths()", function () {
    var options, remaining;

    beforeEach(function () {
      options   = { argv: { remain: [] } };
      spyOn(argumentParser, 'getOptions').andReturn(options);
    });

    it("gets the options", function () {
      argumentParser.getUnexpandedFeaturePaths();
      expect(argumentParser.getOptions).toHaveBeenCalled();
    });

    describe("when there are remaining command-line arguments", function () {
      beforeEach(function () {
        remaining = [createSpy("remaining command-line argument")];
        remaining.length = 1;
        options   = { argv: { remain: remaining } };
        argumentParser.getOptions.andReturn(options);
      });

      it("returns the remaining command-line arguments", function () {
        expect(argumentParser.getUnexpandedFeaturePaths()).toBe(remaining);
      });
    });

    describe("when there are no remaining command-line arguments", function () {
      beforeEach(function () {
        options   = { argv: { remain: [] } };
        argumentParser.getOptions.andReturn(options);
      });

      it("returns the default 'features' sub-directory path", function () {
        expect(argumentParser.getUnexpandedFeaturePaths()).toEqual(["features"]);
      });
    });
  });

  describe("getSupportCodeFilePaths", function () {
    var unexpandedSupportCodeFilePaths, expandedSupportCodePaths;

    beforeEach(function () {
      unexpandedSupportCodeFilePaths = createSpy("unexpanded support code file paths");
      expandedSupportCodePaths       = createSpy("expanded support code file paths");
      spyOn(argumentParser, 'getUnexpandedSupportCodeFilePaths').andReturn(unexpandedSupportCodeFilePaths);
      spyOn(Cucumber.Cli.ArgumentParser.SupportCodePathExpander, 'expandPaths').andReturn(expandedSupportCodePaths);
    });

    it("gets the unexpanded support code file paths", function () {
      argumentParser.getSupportCodeFilePaths();
      expect(argumentParser.getUnexpandedSupportCodeFilePaths).toHaveBeenCalled();
    });

    it("asks the support code file expander to expand the paths", function () {
      argumentParser.getSupportCodeFilePaths();
      expect(Cucumber.Cli.ArgumentParser.SupportCodePathExpander.expandPaths).toHaveBeenCalledWith(unexpandedSupportCodeFilePaths);
    });

    it("returns the expanded support code paths", function () {
      expect(argumentParser.getSupportCodeFilePaths()).toBe(expandedSupportCodePaths);
    });
  });

  describe("getUnexpandedSupportCodeFilePaths()", function () {
    var featureDirectoryPaths, unexpandedSupportCodeFilePaths;

    beforeEach(function () {
      featureDirectoryPaths          = createSpy("paths to directories in which features lie");
      unexpandedSupportCodeFilePaths = createSpy("unexpanded support code file paths");
      spyOn(argumentParser, 'getFeatureDirectoryPaths').andReturn(featureDirectoryPaths);
      spyOn(argumentParser, 'getOptionOrDefault').andReturn(unexpandedSupportCodeFilePaths);
    });

    it("gets the directories in which the features lie", function () {
      argumentParser.getUnexpandedSupportCodeFilePaths();
      expect(argumentParser.getFeatureDirectoryPaths).toHaveBeenCalled();
    });

    it("gets the unexpanded support code file paths from the --require option or its default value: the feature directories", function () {
      argumentParser.getUnexpandedSupportCodeFilePaths();
      expect(argumentParser.getOptionOrDefault).toHaveBeenCalledWith(Cucumber.Cli.ArgumentParser.REQUIRE_OPTION_NAME, featureDirectoryPaths);
    });

    it("returns the unexpanded support code file paths", function () {
      expect(argumentParser.getUnexpandedSupportCodeFilePaths()).toBe(unexpandedSupportCodeFilePaths);
    });
  });

  describe("getTagGroups()", function () {
    var tagOptionValues, tagGroups;

    beforeEach(function () {
      tagOptionValues = createSpy("tag option values");
      tagGroups       = createSpy("tag groups");
      spyOn(argumentParser, 'getOptionOrDefault').andReturn(tagOptionValues);
      spyOn(Cucumber.TagGroupParser, 'getTagGroupsFromStrings').andReturn(tagGroups);
    });

    it("gets the tag option values", function () {
      argumentParser.getTagGroups();
      expect(argumentParser.getOptionOrDefault).toHaveBeenCalledWith(Cucumber.Cli.ArgumentParser.TAGS_OPTION_NAME, []);
    });

    it("gets the tag groups based on the tag option values", function () {
      argumentParser.getTagGroups();
      expect(Cucumber.TagGroupParser.getTagGroupsFromStrings).toHaveBeenCalledWith(tagOptionValues);
    });

    it("returns the tag option values", function () {
      expect(argumentParser.getTagGroups()).toBe(tagGroups);
    });
  });

  describe("getFormat()", function () {
    var format;

    beforeEach(function () {
      format = createSpy("format");
      spyOn(argumentParser, 'getOptionOrDefault').andReturn(format);
    });

    it("gets the format option value", function () {
      argumentParser.getFormat();
      expect(argumentParser.getOptionOrDefault).toHaveBeenCalledWith(Cucumber.Cli.ArgumentParser.FORMAT_OPTION_NAME, 'pretty');
    });

    it("returns the format", function () {
      expect(argumentParser.getFormat()).toBe(format);
    });
  });

  describe("isStrictRequested()", function () {
    var isStrictRequested;

    beforeEach(function () {
      isStrictRequested = createSpy("is strict requested?");
      spyOn(argumentParser, 'getOptionOrDefault').andReturn(isStrictRequested);
    });

    it("gets the 'strict' flag with a default value", function () {
      argumentParser.isStrictRequested();
      expect(argumentParser.getOptionOrDefault).toHaveBeenCalledWith(Cucumber.Cli.ArgumentParser.STRICT_FLAG_NAME, Cucumber.Cli.ArgumentParser.DEFAULT_STRICT_FLAG_VALUE);
    });

    it("returns the flag value", function () {
      expect(argumentParser.isStrictRequested()).toBe(isStrictRequested);
    });
  });

  describe("isHelpRequested()", function () {
    var isHelpRequested;

    beforeEach(function () {
      isHelpRequested = createSpy("is help requested?");
      spyOn(argumentParser, 'getOptionOrDefault').andReturn(isHelpRequested);
    });

    it("gets the 'help' flag with a default value", function () {
      argumentParser.isHelpRequested();
      expect(argumentParser.getOptionOrDefault).toHaveBeenCalledWith(Cucumber.Cli.ArgumentParser.HELP_FLAG_NAME, Cucumber.Cli.ArgumentParser.DEFAULT_HELP_FLAG_VALUE);
    });

    it("returns the flag value", function () {
      expect(argumentParser.isHelpRequested()).toBe(isHelpRequested);
    });
  });

  describe("isVersionRequested()", function () {
    var isVersionRequested;

    beforeEach(function () {
      isVersionRequested = createSpy("is version requested?");
      spyOn(argumentParser, 'getOptionOrDefault').andReturn(isVersionRequested);
    });

    it("gets the 'version' flag with a default value", function () {
      argumentParser.isVersionRequested();
      expect(argumentParser.getOptionOrDefault).toHaveBeenCalledWith(Cucumber.Cli.ArgumentParser.VERSION_FLAG_NAME, Cucumber.Cli.ArgumentParser.DEFAULT_VERSION_FLAG_VALUE);
    });

    it("returns the flag value", function () {
      expect(argumentParser.isVersionRequested()).toBe(isVersionRequested);
    });
  });

  describe("shouldSnippetsBeInCoffeeScript()", function () {
    var shouldSnippetsBeInCoffeeScript;

    beforeEach(function () {
      shouldSnippetsBeInCoffeeScript = createSpy("should snippets be in coffee script?");
      spyOn(argumentParser, 'getOptionOrDefault').andReturn(shouldSnippetsBeInCoffeeScript);
    });

    it("gets the 'coffee' flag with a falsy default value", function () {
      argumentParser.shouldSnippetsBeInCoffeeScript();
      expect(argumentParser.getOptionOrDefault).toHaveBeenCalledWith("coffee", false);
    });

    it("returns the flag value", function () {
      expect(argumentParser.shouldSnippetsBeInCoffeeScript()).toBe(shouldSnippetsBeInCoffeeScript);
    });
  });

  describe("shouldSnippetsBeShown()", function () {
    var shouldSnippetsBeShown;

    beforeEach(function () {
      shouldSnippetsBeShown = createSpy("should snippets be shown?");
      spyOn(argumentParser, 'getOptionOrDefault').andReturn(shouldSnippetsBeShown);
    });

    it("gets the 'snippets' flag with a truthy default value", function () {
      argumentParser.shouldSnippetsBeShown();
      expect(argumentParser.getOptionOrDefault).toHaveBeenCalledWith("snippets", true);
    });

    it("returns the flag value", function () {
      expect(argumentParser.shouldSnippetsBeShown()).toBe(shouldSnippetsBeShown);
    });
  });

  describe("shouldFilterStackTraces()", function () {
    beforeEach(function () {
      spyOn(argumentParser, 'getOptionOrDefault');
    });

    it("gets the 'backtrace' flag with a falsy default value", function () {
      argumentParser.shouldFilterStackTraces();
      expect(argumentParser.getOptionOrDefault).toHaveBeenCalledWith("backtrace", false);
    });

    it("returns true when the backtrace flag isn't set", function () {
      argumentParser.getOptionOrDefault.andReturn(false);
      expect(argumentParser.shouldFilterStackTraces()).toBeTruthy();
    });

    it("returns false when the backtrace flag is set", function () {
      argumentParser.getOptionOrDefault.andReturn(true);
      expect(argumentParser.shouldFilterStackTraces()).toBeFalsy();
    });
  });

  describe("getOptions() [storeOptions()]", function () {
    var options;

    beforeEach(function () {
      options = createSpy("options");
    });

    it("returns the stored options", function () {
      argumentParser.storeOptions(options);
      expect(argumentParser.getOptions()).toBe(options);
    });
  });

  describe("getOptionOrDefault()", function () {
    var optionName, defaultValue;

    beforeEach(function () {
      optionName   = "option-name";
      defaultValue = createSpy("default option value");
      spyOn(argumentParser, 'getOptions').andReturn({});
    });

    it("gets the options", function () {
      argumentParser.getOptionOrDefault(optionName, defaultValue);
      expect(argumentParser.getOptions).toHaveBeenCalled();
    });

    describe("when the requested option has a value", function () {
      var options, optionValue;

      beforeEach(function () {
        options             = {};
        optionValue         = createSpy("option value");
        options[optionName] = optionValue;
        argumentParser.getOptions.andReturn(options);
      });

      it("returns the option value", function () {
        expect(argumentParser.getOptionOrDefault(optionName, defaultValue)).toBe(optionValue);
      });
    });

    describe("when the requested option is not set", function () {
      it("returns the default value", function () {
        expect(argumentParser.getOptionOrDefault(optionName, defaultValue)).toBe(defaultValue);
      });
    });
  });
});
