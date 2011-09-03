require('../../support/spec_helper');

describe("Cucumber.Cli.ArgumentParser", function() {
  var Cucumber = require('cucumber');
  var path     = require('path');
  var nopt;

  var argumentParser, argv;

  beforeEach(function() {
    nopt           = spyOnModule('nopt'); // stubbed BEFORE ArgumentParser() is called.
    argv           = createSpy("arguments (argv)");
    argumentParser = Cucumber.Cli.ArgumentParser(argv);
  });

  describe("parse()", function() {
    var knownOptionDefinitions, shortenedOptionDefinitions;
    var options;

    beforeEach(function() {
      knownOptionDefinitions     = createSpy("known option definitions");
      shortenedOptionDefinitions = createSpy("shortened option definitions");
      options                    = createSpy("parsed options");
      nopt.andReturn(options);
      spyOn(argumentParser, 'getKnownOptionDefinitions').andReturn(knownOptionDefinitions);
      spyOn(argumentParser, 'getShortenedOptionDefinitions').andReturn(shortenedOptionDefinitions);
      spyOn(argumentParser, 'storeOptions');
    });

    it("gets the known option definitions", function() {
      argumentParser.parse();
      expect(argumentParser.getKnownOptionDefinitions).toHaveBeenCalled();
    });

    it("gets the shortened option definitions", function() {
      argumentParser.parse();
      expect(argumentParser.getShortenedOptionDefinitions).toHaveBeenCalled();
    });

    it("gets the options from nopt based on the definitions and argv", function() {
      argumentParser.parse();
      expect(nopt).toHaveBeenCalledWith(knownOptionDefinitions, shortenedOptionDefinitions, argv, Cucumber.Cli.ArgumentParser.NUMBER_OF_LEADING_ARGS_TO_SLICE);
    });

    it("stores the options", function() {
      argumentParser.parse();
      expect(argumentParser.storeOptions).toHaveBeenCalledWith(options);
    });
  });

  describe("getKnownOptionDefinitions()", function() {
    it("returns a hash", function() {
      var knownOptionDefinitions = argumentParser.getKnownOptionDefinitions();
      expect(typeof(knownOptionDefinitions)).toBe('object');
    });

    it("defines a --require option to accept paths", function() {
      var knownOptionDefinitions = argumentParser.getKnownOptionDefinitions();
      expect(knownOptionDefinitions[Cucumber.Cli.ArgumentParser.REQUIRE_OPTION_NAME]).toEqual([path, Array]);
    });
  });

  describe("getShortenedOptionDefinitions()", function() {
    it("returns a hash", function() {
      var shortenedOptionDefinitions = argumentParser.getShortenedOptionDefinitions();
      expect(typeof(shortenedOptionDefinitions)).toBe('object');
    });

    it("defines an alias to to --require as -r", function() {
      var optionName = Cucumber.Cli.ArgumentParser.LONG_OPTION_PREFIX + Cucumber.Cli.ArgumentParser.REQUIRE_OPTION_NAME;
      var aliasName  = Cucumber.Cli.ArgumentParser.REQUIRE_OPTION_SHORT_NAME;
      var aliasValue = [optionName];
      var shortenedOptionDefinitions = argumentParser.getShortenedOptionDefinitions();
      expect(shortenedOptionDefinitions[aliasName]).toEqual(aliasValue);
    });
  });

  describe("getFeatureFilePaths()", function() {
    var Cucumber = require('cucumber');

    var unexpandedFeaturePaths;
    var expandedFeaturePaths;

    beforeEach(function() {
      unexpandedFeaturePaths = createSpy("unexpanded feature paths");
      expandedFeaturePaths   = createSpy("expanded feature paths");
      spyOn(argumentParser, 'getUnexpandedFeaturePaths').andReturn(unexpandedFeaturePaths);
      spyOn(Cucumber.Cli.ArgumentParser.FeaturePathExpander, 'expandPaths').andReturn(expandedFeaturePaths);
    });

    it("gets the unexpanded feature file paths", function() {
      argumentParser.getFeatureFilePaths();
      expect(argumentParser.getUnexpandedFeaturePaths).toHaveBeenCalled();
    });

    it("asks the feature path expander to expand the paths", function() {
      argumentParser.getFeatureFilePaths();
      expect(Cucumber.Cli.ArgumentParser.FeaturePathExpander.expandPaths).toHaveBeenCalledWith(unexpandedFeaturePaths);
    });

    it("returns the expanded feature file paths", function() {
      expect(argumentParser.getFeatureFilePaths()).toBe(expandedFeaturePaths);
    });
  });

  describe("getFeatureDirectoryPaths()", function() {
    var featureFilePaths, featureDirectoryPaths;

    beforeEach(function() {
      featureDirectoryPaths = [createSpy("first feature directory path"),
                               createSpy("second feature directory path")];
      featureFilePaths      = [createSpyWithStubs("first feature path",
                                                  {replace: featureDirectoryPaths[0]}),
                               createSpyWithStubs("second feature path",
                                                  {replace: featureDirectoryPaths[1]})];
      spyOn(argumentParser, 'getFeatureFilePaths').andReturn(featureFilePaths);
    });

    it("gets the feature file paths", function() {
      argumentParser.getFeatureDirectoryPaths();
      expect(argumentParser.getFeatureFilePaths).toHaveBeenCalled();
    });

    it("strips off the feature file name from each path", function() {
      argumentParser.getFeatureDirectoryPaths();
      featureFilePaths.forEach(function(featureFilePath) {
        expect(featureFilePath.replace).toHaveBeenCalledWith(Cucumber.Cli.ArgumentParser.FEATURE_FILENAME_REGEXP, '');
      });
    });

    it("returns the paths", function() {
      expect(argumentParser.getFeatureDirectoryPaths()).toEqual(featureDirectoryPaths);
    });
  });

  describe("getUnexpandedFeaturePaths()", function() {
    var options, remaining;

    beforeEach(function() {
      options   = { argv: { remain: [] } };
      spyOn(argumentParser, 'getOptions').andReturn(options);
    });

    it("gets the options", function() {
      argumentParser.getUnexpandedFeaturePaths();
      expect(argumentParser.getOptions).toHaveBeenCalled();
    });

    describe("when there are remaining command-line arguments", function() {
      beforeEach(function() {
        remaining = [createSpy("remaining command-line argument")];
        remaining.length = 1;
        options   = { argv: { remain: remaining } };
        argumentParser.getOptions.andReturn(options);
      });

      it("returns the remaining command-line arguments", function() {
        expect(argumentParser.getUnexpandedFeaturePaths()).toBe(remaining);
      });
    });

    describe("when there are no remaining command-line arguments", function() {
      beforeEach(function() {
        options   = { argv: { remain: [] } };
        argumentParser.getOptions.andReturn(options);
      });

      it("returns the default 'features' sub-directory path", function() {
        expect(argumentParser.getUnexpandedFeaturePaths()).toEqual(["features"]);
      });
    });
  });

  describe("getSupportCodeFilePaths", function() {
    var unexpandedSupportCodeFilePaths, expandedSupportCodePaths;

    beforeEach(function() {
      unexpandedSupportCodeFilePaths = createSpy("unexpanded support code file paths");
      expandedSupportCodePaths       = createSpy("expanded support code file paths");
      spyOn(argumentParser, 'getUnexpandedSupportCodeFilePaths').andReturn(unexpandedSupportCodeFilePaths);
      spyOn(Cucumber.Cli.ArgumentParser.SupportCodePathExpander, 'expandPaths').andReturn(expandedSupportCodePaths);
    });

    it("gets the unexpanded support code file paths", function() {
      argumentParser.getSupportCodeFilePaths();
      expect(argumentParser.getUnexpandedSupportCodeFilePaths).toHaveBeenCalled();
    });

    it("asks the support code file expander to expand the paths", function() {
      argumentParser.getSupportCodeFilePaths();
      expect(Cucumber.Cli.ArgumentParser.SupportCodePathExpander.expandPaths).toHaveBeenCalledWith(unexpandedSupportCodeFilePaths);
    });

    it("returns the expanded support code paths", function() {
      expect(argumentParser.getSupportCodeFilePaths()).toBe(expandedSupportCodePaths);
    });
  });

  describe("getUnexpandedSupportCodeFilePaths()", function() {
    var featureDirectoryPaths, unexpandedSupportCodeFilePaths;

    beforeEach(function() {
      featureDirectoryPaths          = createSpy("paths to directories in which features lie");
      unexpandedSupportCodeFilePaths = createSpy("unexpanded support code file paths");
      spyOn(argumentParser, 'getFeatureDirectoryPaths').andReturn(featureDirectoryPaths);
      spyOn(argumentParser, 'getOptionOrDefault').andReturn(unexpandedSupportCodeFilePaths);
    });

    it("gets the directories in which the features lie", function() {
      argumentParser.getUnexpandedSupportCodeFilePaths();
      expect(argumentParser.getFeatureDirectoryPaths).toHaveBeenCalled();
    });

    it("gets the unexpanded support code file paths from the --require option or its default value: the feature directories", function() {
      argumentParser.getUnexpandedSupportCodeFilePaths();
      expect(argumentParser.getOptionOrDefault).toHaveBeenCalledWith(Cucumber.Cli.ArgumentParser.REQUIRE_OPTION_NAME, featureDirectoryPaths);
    });

    it("returns the unexpanded support code file paths", function() {
      expect(argumentParser.getUnexpandedSupportCodeFilePaths()).toBe(unexpandedSupportCodeFilePaths);
    });
  });

  describe("getOptions() [storeOptions()]", function() {
    var options;

    beforeEach(function() {
      options = createSpy("options");
    });

    it("returns the stored options", function() {
      argumentParser.storeOptions(options);
      expect(argumentParser.getOptions()).toBe(options);
    });
  });

  describe("getOptionOrDefault()", function() {
    var optionName, defaultVaue;

    beforeEach(function() {
      optionName   = "option-name";
      defaultValue = createSpy("default option value");
      spyOn(argumentParser, 'getOptions').andReturn({});
    });

    it("gets the options", function() {
      argumentParser.getOptionOrDefault(optionName, defaultValue);
      expect(argumentParser.getOptions).toHaveBeenCalled();
    });

    describe("when the requested option has a value", function() {
      var options, optionValue;

      beforeEach(function() {
        options             = {};
        optionValue         = createSpy("option value");
        options[optionName] = optionValue;
        argumentParser.getOptions.andReturn(options);
      });

      it("returns the option value", function() {
        expect(argumentParser.getOptionOrDefault(optionName, defaultValue)).toBe(optionValue);
      });
    });

    describe("when the requested option is not set", function() {
      it("returns the default value", function() {
        expect(argumentParser.getOptionOrDefault(optionName, defaultValue)).toBe(defaultValue);
      });
    });
  });
});
