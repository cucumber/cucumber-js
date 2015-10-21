require('../../support/spec_helper');

describe("Cucumber.Cli.ArgumentParser", function () {
  var Cucumber = requireLib('cucumber');
  var path     = require('path');
  var fs       = require('fs');
  var nopt;

  var argumentParser, argv, slicedArgv;

  beforeEach(function () {
    nopt           = spyOnModule('nopt'); // stubbed BEFORE ArgumentParser() is called.
    slicedArgv     = createSpy("sliced arguments");
    argv           = createSpyWithStubs("arguments (argv)", {slice: slicedArgv});
    argumentParser = Cucumber.Cli.ArgumentParser(argv);
  });

  describe("parse()", function () {
    var expandedArgs, options;

    beforeEach(function () {
      expandedArgs = createSpy("expanded arguments");
      options = createSpy("options");
      spyOn(argumentParser, 'getExpandedArgs').and.returnValue(expandedArgs);
      spyOn(argumentParser, 'argsToOptions').and.returnValue(options);
      spyOn(argumentParser, 'storeOptions');
    });

    it("removes the leading args from argv", function () {
      argumentParser.parse();
      expect(argv.slice).toHaveBeenCalledWith(Cucumber.Cli.ArgumentParser.NUMBER_OF_LEADING_ARGS_TO_SLICE);
    });

    it("gets the expanded argv", function () {
      argumentParser.parse();
      expect(argumentParser.getExpandedArgs).toHaveBeenCalledWith(slicedArgv);
    });

    it("gets the options", function () {
      argumentParser.parse();
      expect(argumentParser.argsToOptions).toHaveBeenCalledWith(expandedArgs);
    });

    it("stores the expanded options", function () {
      argumentParser.parse();
      expect(argumentParser.storeOptions).toHaveBeenCalledWith(options);
    });
  });

  describe("argsToOptions()", function (){
    var knownOptionDefinitions, shortenedOptionDefinitions, args;
    var options;

    beforeEach(function () {
      knownOptionDefinitions     = createSpy("known option definitions");
      shortenedOptionDefinitions = createSpy("shortened option definitions");
      args                       = createSpy("arguments");
      options                    = createSpy("parsed options");
      nopt.and.returnValue(options);
      spyOn(argumentParser, 'getKnownOptionDefinitions').and.returnValue(knownOptionDefinitions);
      spyOn(argumentParser, 'getShortenedOptionDefinitions').and.returnValue(shortenedOptionDefinitions);
    });

    it("gets the known option definitions", function () {
      argumentParser.argsToOptions(args);
      expect(argumentParser.getKnownOptionDefinitions).toHaveBeenCalled();
    });

    it("gets the shortened option definitions", function () {
      argumentParser.argsToOptions(args);
      expect(argumentParser.getShortenedOptionDefinitions).toHaveBeenCalled();
    });

    it("gets the options from nopt based on the definitions and args", function () {
      argumentParser.argsToOptions(args);
      expect(nopt).toHaveBeenCalledWith(knownOptionDefinitions, shortenedOptionDefinitions, args, 0);
    });

    it("returns the parsed options", function () {
      expect(argumentParser.argsToOptions(args)).toEqual(options);
    });
  });

  describe("getExpandedArgs()", function () {
    var options, profileDefinitions, unexpandedArgs;

    beforeEach(function () {
      unexpandedArgs = ['unexpanded', 'args'];
    });

    describe("no profile specified", function () {
      beforeEach(function () {
        spyOn(argumentParser, 'argsToOptions').and.returnValue({});
      });

      describe("without default profile", function () {
        beforeEach(function () {
          spyOn(Cucumber.Cli.ArgumentParser.ProfileDefinitionLoader, 'getDefinitions').and.returnValue({});
        });

        it("returns the unexpanded args", function () {
          expect(argumentParser.getExpandedArgs(unexpandedArgs)).toEqual(unexpandedArgs);
        });
      });

      describe("with default profile", function () {
        beforeEach(function () {
          profileDefinitions = {
            'default': 'default args'
          };
          spyOn(Cucumber.Cli.ArgumentParser.ProfileDefinitionLoader, 'getDefinitions').and.returnValue(profileDefinitions);
        });

        it("returns the profile args split by whitespace concatenated with the unexpanded args", function () {
          expect(argumentParser.getExpandedArgs(unexpandedArgs)).toEqual(['default', 'args'].concat(unexpandedArgs));
        });
      });
    });

    describe("single profile specified", function () {
      beforeEach(function () {
        options = {};
        options[Cucumber.Cli.ArgumentParser.PROFILE_OPTION_NAME] = ['profileName'];
        spyOn(argumentParser, 'argsToOptions').and.returnValue(options);
      });

      describe("profile is not defined", function () {
        beforeEach(function () {
          spyOn(Cucumber.Cli.ArgumentParser.ProfileDefinitionLoader, 'getDefinitions').and.returnValue({});
        });

        it("throws an error", function () {
          expect(function(){
            argumentParser.getExpandedArgs(unexpandedArgs);
          }).toThrow();
        });
      });

      describe("profile is defined", function () {
        beforeEach(function () {
          profileDefinitions = {
            'profileName': 'profile args'
          };
          spyOn(Cucumber.Cli.ArgumentParser.ProfileDefinitionLoader, 'getDefinitions').and.returnValue(profileDefinitions);
        });

        it("returns the profile args split by whitespace concatenated with the unexpanded args", function () {
          expect(argumentParser.getExpandedArgs(unexpandedArgs)).toEqual(['profile', 'args'].concat(unexpandedArgs));
        });
      });
    });

    describe("multiple profiles specified", function () {
      beforeEach(function () {
        options = {};
        options[Cucumber.Cli.ArgumentParser.PROFILE_OPTION_NAME] = ['profileA', 'profileB'];
        profileDefinitions = {
          'profileA': 'profileA args',
          'profileB': 'profileB args'
        };
        spyOn(argumentParser, 'argsToOptions').and.returnValue(options);
        spyOn(Cucumber.Cli.ArgumentParser.ProfileDefinitionLoader, 'getDefinitions').and.returnValue(profileDefinitions);
      });

      it("returns the profile args split by whitespace concatenated with the unexpanded args", function () {
        var expandedArgs = ['profileA', 'args', 'profileB', 'args'].concat(unexpandedArgs);
        expect(argumentParser.getExpandedArgs(unexpandedArgs)).toEqual(expandedArgs);
      });
    });
  });

  /* jshint sub: true */
  describe("getKnownOptionDefinitions()", function () {
    var knownOptionDefinitions;

    beforeEach(function () {
      knownOptionDefinitions = argumentParser.getKnownOptionDefinitions();
    });

    it("returns a hash", function () {
      expect(typeof(knownOptionDefinitions)).toBe('object');
    });

    it("defines a repeatable --require option", function () {
      expect(knownOptionDefinitions['require']).toEqual([path, Array]);
    });

    it("defines a repeatable --tags option", function () {
      expect(knownOptionDefinitions['tags']).toEqual([String, Array]);
    });

    it("defines a repeatable --profile option", function () {
      expect(knownOptionDefinitions['profile']).toEqual([String, Array]);
    });

    it("defines a repeatable --compiler option", function () {
      expect(knownOptionDefinitions['compiler']).toEqual([String, Array]);
    });

    it("defines a repeatable --format option", function () {
      expect(knownOptionDefinitions['format']).toEqual([String, Array]);
    });

    it("defines a --strict flag", function () {
      expect(knownOptionDefinitions['strict']).toEqual(Boolean);
    });

    it("defines a --dry-run flag", function () {
      expect(knownOptionDefinitions['dry-run']).toEqual(Boolean);
    });

    it("defines a --colors flag", function () {
      expect(knownOptionDefinitions['colors']).toEqual(Boolean);
    });

    it("defines a --help flag", function () {
      expect(knownOptionDefinitions['help']).toEqual(Boolean);
    });

    it("defines a --version flag", function () {
      expect(knownOptionDefinitions['version']).toEqual(Boolean);
    });

    it("defines a --snippets flag", function () {
      expect(knownOptionDefinitions['snippets']).toEqual(Boolean);
    });

    it("defines a --backtrace flag", function () {
      expect(knownOptionDefinitions['backtrace']).toEqual(Boolean);
    });
  });

  describe("getShortenedOptionDefinitions()", function () {
    var shortenedOptionDefinitions;

    beforeEach(function () {
      shortenedOptionDefinitions = argumentParser.getShortenedOptionDefinitions();
    });

    it("returns a hash", function () {
      expect(typeof(shortenedOptionDefinitions)).toBe('object');
    });

    it("defines -r as an alias to --require", function () {
      expect(shortenedOptionDefinitions['r']).toEqual(['--require']);
    });

    it("defines -f as an alias to --format", function () {
      expect(shortenedOptionDefinitions['f']).toEqual(['--format']);
    });

    it("defines -p as an alias to --profile", function () {
      expect(shortenedOptionDefinitions['p']).toEqual(['--profile']);
    });

    it("defines -S as an alias to --strict", function () {
      expect(shortenedOptionDefinitions['S']).toEqual(['--strict']);
    });

    it("defines -d as an alias to --dry-run", function () {
      expect(shortenedOptionDefinitions['d']).toEqual(['--dry-run']);
    });

    it("defines -h as an alias to --help", function () {
      expect(shortenedOptionDefinitions['h']).toEqual(['--help']);
    });

    it("defines -t as an alias to --tags", function () {
      expect(shortenedOptionDefinitions['t']).toEqual(['--tags']);
    });

    it("defines -v as an alias to --version", function () {
      expect(shortenedOptionDefinitions['v']).toEqual(['--version']);
    });

    it("defines -i as an alias to --no-snippets", function () {
      expect(shortenedOptionDefinitions['i']).toEqual(['--no-snippets']);
    });

    it("defines -b as an alias to --backtrace", function () {
      expect(shortenedOptionDefinitions['b']).toEqual(['--backtrace']);
    });
  });
  /* jshint sub: false */

  describe("getFeatureFilePaths()", function () {
    var Cucumber = requireLib('cucumber');

    var unexpandedFeaturePaths;
    var expandedFeaturePaths;

    beforeEach(function () {
      unexpandedFeaturePaths = createSpy("unexpanded feature paths");
      expandedFeaturePaths   = createSpy("expanded feature paths");
      spyOn(argumentParser, 'getUnexpandedFeaturePaths').and.returnValue(unexpandedFeaturePaths);
      spyOn(Cucumber.Cli.ArgumentParser.FeaturePathExpander, 'expandPaths').and.returnValue(expandedFeaturePaths);
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
      spyOn(argumentParser, 'getFeatureFilePaths').and.returnValue(featureFilePaths);
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
      spyOn(argumentParser, 'getOptions').and.returnValue(options);
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
        argumentParser.getOptions.and.returnValue(options);
      });

      it("returns the remaining command-line arguments", function () {
        expect(argumentParser.getUnexpandedFeaturePaths()).toBe(remaining);
      });
    });

    describe("when there are no remaining command-line arguments", function () {
      beforeEach(function () {
        options   = { argv: { remain: [] } };
        argumentParser.getOptions.and.returnValue(options);
      });

      it("returns the default 'features' sub-directory path", function () {
        expect(argumentParser.getUnexpandedFeaturePaths()).toEqual(["features"]);
      });
    });
  });

  describe("getSupportCodeFilePaths", function () {
    var unexpandedSupportCodeFilePaths, compilerExtensions, expandedSupportCodePaths;

    beforeEach(function () {
      unexpandedSupportCodeFilePaths = createSpy("unexpanded support code file paths");
      compilerExtensions             = createSpy("compiler extensions");
      expandedSupportCodePaths       = createSpy("expanded support code file paths");
      spyOn(argumentParser, 'getUnexpandedSupportCodeFilePaths').and.returnValue(unexpandedSupportCodeFilePaths);
      spyOn(argumentParser, 'getCompilerExtensions').and.returnValue(compilerExtensions);
      spyOn(Cucumber.Cli.ArgumentParser.SupportCodePathExpander, 'expandPaths').and.returnValue(expandedSupportCodePaths);
    });

    it("gets the unexpanded support code file paths", function () {
      argumentParser.getSupportCodeFilePaths();
      expect(argumentParser.getUnexpandedSupportCodeFilePaths).toHaveBeenCalled();
    });

    it("asks the support code file expander to expand the paths", function () {
      argumentParser.getSupportCodeFilePaths();
      expect(Cucumber.Cli.ArgumentParser.SupportCodePathExpander.expandPaths).toHaveBeenCalledWith(unexpandedSupportCodeFilePaths, ['js'].concat(compilerExtensions));
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
      spyOn(argumentParser, 'getFeatureDirectoryPaths').and.returnValue(featureDirectoryPaths);
      spyOn(argumentParser, 'getOptionOrDefault').and.returnValue(unexpandedSupportCodeFilePaths);
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
      spyOn(argumentParser, 'getOptionOrDefault').and.returnValue(tagOptionValues);
      spyOn(Cucumber.TagGroupParser, 'getTagGroupsFromStrings').and.returnValue(tagGroups);
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

  describe("getFormats()", function () {
    var formats, fd, stream;

    beforeEach(function () {
      formats = ['progress', 'summary', 'pretty:path/to/file'];
      fd = createSpy('fd');
      stream = createSpy('stream');
      spyOn(argumentParser, 'getOptionOrDefault').and.returnValue(formats);
      spyOn(fs, 'openSync').and.returnValue(fd);
      spyOn(fs, 'createWriteStream').and.returnValue(stream);
    });

    it("returns the formats", function () {
      expect(argumentParser.getFormats()).toEqual([
        {stream: process.stdout, type: 'summary'},
        {stream: stream, type: 'pretty'},
      ]);
      expect(fs.openSync).toHaveBeenCalledWith('path/to/file', 'w');
      expect(fs.createWriteStream).toHaveBeenCalledWith(null, {fd: fd});
    });
  });

  describe("isStrictRequested()", function () {
    var isStrictRequested;

    beforeEach(function () {
      isStrictRequested = createSpy("is strict requested?");
      spyOn(argumentParser, 'getOptionOrDefault').and.returnValue(isStrictRequested);
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
      spyOn(argumentParser, 'getOptionOrDefault').and.returnValue(isHelpRequested);
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
      spyOn(argumentParser, 'getOptionOrDefault').and.returnValue(isVersionRequested);
    });

    it("gets the 'version' flag with a default value", function () {
      argumentParser.isVersionRequested();
      expect(argumentParser.getOptionOrDefault).toHaveBeenCalledWith(Cucumber.Cli.ArgumentParser.VERSION_FLAG_NAME, Cucumber.Cli.ArgumentParser.DEFAULT_VERSION_FLAG_VALUE);
    });

    it("returns the flag value", function () {
      expect(argumentParser.isVersionRequested()).toBe(isVersionRequested);
    });
  });

  describe("shouldSnippetsBeShown()", function () {
    var shouldSnippetsBeShown;

    beforeEach(function () {
      shouldSnippetsBeShown = createSpy("should snippets be shown?");
      spyOn(argumentParser, 'getOptionOrDefault').and.returnValue(shouldSnippetsBeShown);
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
      argumentParser.getOptionOrDefault.and.returnValue(false);
      expect(argumentParser.shouldFilterStackTraces()).toBeTruthy();
    });

    it("returns false when the backtrace flag is set", function () {
      argumentParser.getOptionOrDefault.and.returnValue(true);
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
      spyOn(argumentParser, 'getOptions').and.returnValue({});
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
        argumentParser.getOptions.and.returnValue(options);
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
