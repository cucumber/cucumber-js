require('../../support/spec_helper');
require('../../support/configurations_shared_examples.js');

describe("Cucumber.Cli.Configuration", function () {
  var Cucumber = requireLib('cucumber');

  var argv, configuration;
  var argumentParser;
  var context = {};

  beforeEach(function () {
    argv                = createSpy("arguments (argv)");
    argumentParser      = createSpyWithStubs("argument parser", {parse: null});
    spyOn(Cucumber.Cli, 'ArgumentParser').and.returnValue(argumentParser);
    configuration       = Cucumber.Cli.Configuration(argv);
    context.configuration = configuration;
  });

  itBehavesLikeAllCucumberConfigurations(context);

  describe("constructor", function () {
    it("creates an argument parser", function () {
      expect(Cucumber.Cli.ArgumentParser).toHaveBeenCalledWith(argv);
    });

    it("tells the argument parser to parse the arguments", function () {
      expect(argumentParser.parse).toHaveBeenCalledWith();
    });
  });

  describe("getFormatters()", function () {
    var snippetSyntax, formatterOptions, shouldSnippetsBeShown, shouldShowSource, stream, useColors;

    beforeEach(function () {
      stream = createSpy('stream');
      snippetSyntax = createSpy("snippet syntax");
      shouldSnippetsBeShown = createSpy("should snippets be shown?");
      shouldShowSource = createSpy("should source uris be visible?");
      useColors = createSpy("use colors");
      formatterOptions = {
        snippetSyntax: snippetSyntax,
        snippets: shouldSnippetsBeShown,
        showSource: shouldShowSource,
        stream: stream,
        useColors: useColors
      };
      spyOnStub(argumentParser, 'getFormats').and.returnValue([]);
      spyOnStub(argumentParser, 'getSnippetSyntax').and.returnValue(snippetSyntax);
      spyOnStub(argumentParser, 'shouldSnippetsBeShown').and.returnValue(shouldSnippetsBeShown);
      spyOnStub(argumentParser, 'shouldShowSource').and.returnValue(shouldShowSource);
      spyOnStub(argumentParser, 'shouldUseColors').and.returnValue(useColors);
      spyOn(Cucumber.Listener, 'JsonFormatter');
      spyOn(Cucumber.Listener, 'ProgressFormatter');
      spyOn(Cucumber.Listener, 'PrettyFormatter');
      spyOn(Cucumber.Listener, 'SummaryFormatter');
    });

    describe("when the formatter name is \"json\"", function () {
      var formatter;

      beforeEach(function () {
        argumentParser.getFormats.and.returnValue([{type: "json", stream: stream}]);
        formatter = createSpy("formatter");
        Cucumber.Listener.JsonFormatter.and.returnValue(formatter);
      });

      it("creates a new json formatter", function () {
        configuration.getFormatters();
        expect(Cucumber.Listener.JsonFormatter).toHaveBeenCalledWith(formatterOptions);
      });

      it("returns the json formatter", function () {
        expect(configuration.getFormatters()).toEqual([formatter]);
      });
    });

    describe("when the formatter name is \"progress\"", function () {
      var formatter;

      beforeEach(function () {
        argumentParser.getFormats.and.returnValue([{type: "progress", stream: stream}]);
        formatter = createSpy("formatter");
        Cucumber.Listener.ProgressFormatter.and.returnValue(formatter);
      });

      it("creates a new progress formatter", function () {
        configuration.getFormatters();
        expect(Cucumber.Listener.ProgressFormatter).toHaveBeenCalledWith(formatterOptions);
      });

      it("returns the progress formatter", function () {
        expect(configuration.getFormatters()).toEqual([formatter]);
      });
    });

    describe("when the formatter name is \"pretty\"", function () {
      var formatter;

      beforeEach(function () {
        argumentParser.getFormats.and.returnValue([{type: "pretty", stream: stream}]);
        formatter = createSpy("formatter");
        Cucumber.Listener.PrettyFormatter.and.returnValue(formatter);
      });

      it("creates a new pretty formatter", function () {
        configuration.getFormatters();
        expect(Cucumber.Listener.PrettyFormatter).toHaveBeenCalledWith(formatterOptions);
      });

      it("returns the pretty formatter", function () {
        expect(configuration.getFormatters()).toEqual([formatter]);
      });
    });

    describe("when the formatter name is \"summary\"", function () {
      var formatter;

      beforeEach(function () {
        argumentParser.getFormats.and.returnValue([{type: "summary", stream: stream}]);
        formatter = createSpy("formatter");
        Cucumber.Listener.SummaryFormatter.and.returnValue(formatter);
      });

      it("creates a new summary formatter", function () {
        configuration.getFormatters();
        expect(Cucumber.Listener.SummaryFormatter).toHaveBeenCalledWith(formatterOptions);
      });

      it("returns the summary formatter", function () {
        expect(configuration.getFormatters()).toEqual([formatter]);
      });
    });

    describe("when the formatter name is unknown", function () {
      beforeEach(function () {
        argumentParser.getFormats.and.returnValue([{type: "blah", stream: stream}]);
      });

      it("throws an exceptions", function () {
        expect(configuration.getFormatters).toThrow();
      });
    });
  });


  describe("getFeatureSources()", function () {
    var featureFilePaths, featureSourceLoader, featureSources;

    beforeEach(function () {
      featureFilePaths    = createSpy("feature file paths");
      featureSourceLoader = createSpy("feature source loader");
      featureSources      = createSpy("feature sources");
      spyOnStub(argumentParser, 'getFeatureFilePaths').and.returnValue(featureFilePaths);
      spyOnStub(featureSourceLoader, 'getSources').and.returnValue(featureSources);
      spyOn(Cucumber.Cli, 'FeatureSourceLoader').and.returnValue(featureSourceLoader);
    });

    it("gets the feature file paths", function () {
      configuration.getFeatureSources();
      expect(argumentParser.getFeatureFilePaths).toHaveBeenCalled();
    });

    it("creates a feature source loader for those paths", function () {
      configuration.getFeatureSources();
      expect(Cucumber.Cli.FeatureSourceLoader).toHaveBeenCalledWith(featureFilePaths);
    });

    it("gets the feature sources from the loader", function () {
      configuration.getFeatureSources();
      expect(featureSourceLoader.getSources).toHaveBeenCalled();
    });

    it("returns the feature sources", function () {
      expect(configuration.getFeatureSources()).toBe(featureSources);
    });
  });

  describe("getAstFilter()", function () {
    var astFilter, tagFilterRules, scenarioByLineFilterRules;

    beforeEach(function () {
      astFilter      = createSpyWithStubs("AST filter");
      tagFilterRules = [];
      scenarioByLineFilterRules = createSpy("line specs");
      spyOn(Cucumber.Ast, 'Filter').and.returnValue(astFilter);
      spyOn(configuration, 'getTagAstFilterRules').and.returnValue(tagFilterRules);
      spyOn(configuration, 'getSingleScenarioAstFilterRule').and.returnValue(scenarioByLineFilterRules);
    });

    it("gets the tag filter rules", function () {
      configuration.getAstFilter();
      expect(configuration.getTagAstFilterRules).toHaveBeenCalled();
    });

    it("instantiates an AST filter", function () {
      configuration.getAstFilter();
      expect(Cucumber.Ast.Filter).toHaveBeenCalledWith(tagFilterRules);
    });

    it("returns the AST filter", function () {
      expect(configuration.getAstFilter()).toBe(astFilter);
    });
  });

  describe("getSupportCodeLibrary()", function () {
    var compilerModules, supportCodeFilePaths, supportCodeLoader, supportCodeLibrary;

    beforeEach(function () {
      compilerModules      = createSpy("compiler modules");
      supportCodeFilePaths = createSpy("support code file paths");
      supportCodeLoader    = createSpy("support code loader");
      supportCodeLibrary   = createSpy("support code library");
      spyOnStub(argumentParser, 'getCompilerModules').and.returnValue(compilerModules);
      spyOnStub(argumentParser, 'getSupportCodeFilePaths').and.returnValue(supportCodeFilePaths);
      spyOn(Cucumber.Cli, 'SupportCodeLoader').and.returnValue(supportCodeLoader);
      spyOnStub(supportCodeLoader, 'getSupportCodeLibrary').and.returnValue(supportCodeLibrary);
    });

    it("gets the support code file paths", function () {
      configuration.getSupportCodeLibrary();
      expect(argumentParser.getSupportCodeFilePaths).toHaveBeenCalled();
    });

    it("creates a support code loader for those paths and compiler modules", function () {
      configuration.getSupportCodeLibrary();
      expect(Cucumber.Cli.SupportCodeLoader).toHaveBeenCalledWith(supportCodeFilePaths, compilerModules);
    });

    it("gets the support code library from the support code loader", function () {
      configuration.getSupportCodeLibrary();
      expect(supportCodeLoader.getSupportCodeLibrary).toHaveBeenCalled();
    });

    it("returns the support code library", function () {
      expect(configuration.getSupportCodeLibrary()).toBe(supportCodeLibrary);
    });
  });

  describe("getTagAstFilterRules()", function () {
    var tagGroups, rules;

    beforeEach(function () {
      tagGroups = [createSpy("tag group 1"), createSpy("tag group 2"), createSpy("tag group 3")];
      rules     = [createSpy("any of tags rule 1"), createSpy("any of tags rule 2"), createSpy("any of tags rule 3")];
      spyOnStub(argumentParser, 'getTagGroups').and.returnValue(tagGroups);
      spyOn(Cucumber.Ast.Filter, 'AnyOfTagsRule').and.returnValues.apply(null, rules);
    });

    it("gets the tag groups from the argument parser", function () {
      configuration.getTagAstFilterRules();
      expect(argumentParser.getTagGroups).toHaveBeenCalled();
    });

    it("creates an 'any of tags' filter rule per each group", function () {
      configuration.getTagAstFilterRules();
      tagGroups.forEach(function (tagGroup) {
        expect(Cucumber.Ast.Filter.AnyOfTagsRule).toHaveBeenCalledWith(tagGroup);
      });
    });

    it("returns all the rules", function () {
      expect(configuration.getTagAstFilterRules()).toEqual(rules);
    });
  });

  describe("isHelpRequired()", function () {
    beforeEach(function () {
      spyOnStub(argumentParser, 'isHelpRequested');
    });

    it("asks the argument parser whether the help was requested or not", function () {
      configuration.isHelpRequested();
      expect(argumentParser.isHelpRequested).toHaveBeenCalled();
    });

    it("returns the answer from the argument parser", function () {
      var isHelpRequested = createSpy("is help requested?");
      argumentParser.isHelpRequested.and.returnValue(isHelpRequested);
      expect(configuration.isHelpRequested()).toBe(isHelpRequested);
    });
  });

  describe("isVersionRequested()", function () {
    beforeEach(function () {
      spyOnStub(argumentParser, 'isVersionRequested');
    });

    it("asks the argument parser whether the version was requested or not", function () {
      configuration.isVersionRequested();
      expect(argumentParser.isVersionRequested).toHaveBeenCalled();
    });

    it("returns the answer from the argument parser", function () {
      var isVersionRequested = createSpy("is version requested?");
      argumentParser.isVersionRequested.and.returnValue(isVersionRequested);
      expect(configuration.isVersionRequested()).toBe(isVersionRequested);
    });
  });

  describe("shouldSnippetsBeShown()", function () {
    beforeEach(function () {
      spyOnStub(argumentParser, 'shouldSnippetsBeShown');
    });

    it("asks the argument parser whether the step definition snippets are shown or not", function () {
      configuration.shouldSnippetsBeShown();
      expect(argumentParser.shouldSnippetsBeShown).toHaveBeenCalledTimes(1);
    });

    it("returns the answer from the argument parser", function () {
      var shouldSnippetsBeShown = createSpy("show step definitions?");
      argumentParser.shouldSnippetsBeShown.and.returnValue(shouldSnippetsBeShown);
      expect(configuration.shouldSnippetsBeShown()).toBe(shouldSnippetsBeShown);
    });
  });

  describe("shouldFilterStackTraces()", function () {
    beforeEach(function () {
      spyOnStub(argumentParser, 'shouldFilterStackTraces');
    });

    it("asks the argument parser whether the stack traces are filtered", function () {
      configuration.shouldFilterStackTraces();
      expect(argumentParser.shouldFilterStackTraces).toHaveBeenCalled();
    });

    it("tells whether the stack traces are filtered or not", function () {
      var shouldStackTracesBeFiltered = createSpy("filter stack traces?");
      argumentParser.shouldFilterStackTraces.and.returnValue(shouldStackTracesBeFiltered);
      expect(configuration.shouldFilterStackTraces()).toBe(shouldStackTracesBeFiltered);
    });
  });

});
