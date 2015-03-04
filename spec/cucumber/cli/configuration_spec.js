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
    spyOn(Cucumber.Cli, 'ArgumentParser').andReturn(argumentParser);
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

  describe("getFormatter()", function () {
    var shouldSnippetsBeInCoffeeScript, formatterOptions, shouldSnippetsBeShown;

    beforeEach(function () {
      shouldSnippetsBeInCoffeeScript = createSpy("should snippets be in CS?");
      shouldSnippetsBeShown = createSpy("should snippets be shown?");
      formatterOptions               = {coffeeScriptSnippets: shouldSnippetsBeInCoffeeScript, snippets: shouldSnippetsBeShown};
      spyOnStub(argumentParser, 'getFormat').andReturn("progress");
      spyOnStub(argumentParser, 'shouldSnippetsBeInCoffeeScript').andReturn(shouldSnippetsBeInCoffeeScript);
      spyOnStub(argumentParser, 'shouldSnippetsBeShown').andReturn(shouldSnippetsBeShown);
      spyOn(Cucumber.Listener, 'JsonFormatter');
      spyOn(Cucumber.Listener, 'ProgressFormatter');
      spyOn(Cucumber.Listener, 'PrettyFormatter');
      spyOn(Cucumber.Listener, 'SummaryFormatter');
    });

    it("gets the formatter name from the argument parser", function () {
      configuration.getFormatter();
      expect(argumentParser.getFormat).toHaveBeenCalled();
    });

    it("checks whether the step definition snippets should be in CoffeeScript", function () {
      configuration.getFormatter();
      expect(argumentParser.shouldSnippetsBeInCoffeeScript).toHaveBeenCalled();
    });

    it("checks whether the step definition snippets should be shown", function () {
      configuration.getFormatter();
      expect(argumentParser.shouldSnippetsBeShown).toHaveBeenCalled();
      expect(argumentParser.shouldSnippetsBeShown.callCount).toBe(1);
    });

    describe("when the formatter name is \"json\"", function () {
      var formatter;

      beforeEach(function () {
        argumentParser.getFormat.andReturn("json");
        formatter = createSpy("formatter");
        Cucumber.Listener.JsonFormatter.andReturn(formatter);
      });

      it("creates a new progress formatter", function () {
        configuration.getFormatter();
        expect(Cucumber.Listener.JsonFormatter).toHaveBeenCalledWith(formatterOptions);
      });

      it("returns the progress formatter", function () {
        expect(configuration.getFormatter()).toBe(formatter);
      });
    });

    describe("when the formatter name is \"progress\"", function () {
      var formatter;

      beforeEach(function () {
        argumentParser.getFormat.andReturn("progress");
        formatter = createSpy("formatter");
        Cucumber.Listener.ProgressFormatter.andReturn(formatter);
      });

      it("creates a new progress formatter", function () {
        configuration.getFormatter();
        expect(Cucumber.Listener.ProgressFormatter).toHaveBeenCalledWith(formatterOptions);
      });

      it("returns the progress formatter", function () {
        expect(configuration.getFormatter()).toBe(formatter);
      });
    });

    describe("when the formatter name is \"pretty\"", function () {
      var formatter;

      beforeEach(function () {
        argumentParser.getFormat.andReturn("pretty");
        formatter = createSpy("formatter");
        Cucumber.Listener.PrettyFormatter.andReturn(formatter);
      });

      it("creates a new pretty formatter", function () {
        configuration.getFormatter();
        expect(Cucumber.Listener.PrettyFormatter).toHaveBeenCalledWith(formatterOptions);
      });

      it("returns the pretty formatter", function () {
        expect(configuration.getFormatter()).toBe(formatter);
      });
    });

    describe("when the formatter name is \"summary\"", function () {
      var formatter;

      beforeEach(function () {
        argumentParser.getFormat.andReturn("summary");
        formatter = createSpy("formatter");
        Cucumber.Listener.SummaryFormatter.andReturn(formatter);
      });

      it("creates a new summary formatter", function () {
        configuration.getFormatter();
        expect(Cucumber.Listener.SummaryFormatter).toHaveBeenCalledWith(formatterOptions);
      });

      it("returns the summary formatter", function () {
        expect(configuration.getFormatter()).toBe(formatter);
      });
    });

    describe("when the formatter name is unknown", function () {
      beforeEach(function () {
        argumentParser.getFormat.andReturn("blah");
      });

      it("throws an exceptions", function () {
        expect(configuration.getFormatter).toThrow();
      });
    });
  });


  describe("getFeatureSources()", function () {
    var featureFilePaths, featureSourceLoader, featureSources;

    beforeEach(function () {
      featureFilePaths    = createSpy("feature file paths");
      featureSourceLoader = createSpy("feature source loader");
      featureSources      = createSpy("feature sources");
      spyOnStub(argumentParser, 'getFeatureFilePaths').andReturn(featureFilePaths);
      spyOnStub(featureSourceLoader, 'getSources').andReturn(featureSources);
      spyOn(Cucumber.Cli, 'FeatureSourceLoader').andReturn(featureSourceLoader);
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
      spyOn(Cucumber.Ast, 'Filter').andReturn(astFilter);
      spyOn(configuration, 'getTagAstFilterRules').andReturn(tagFilterRules);
      spyOn(configuration, 'getSingleScenarioAstFilterRule').andReturn(scenarioByLineFilterRules);
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
    var supportCodeFilePaths, supportCodeLoader, supportCodeLibrary;

    beforeEach(function () {
      supportCodeFilePaths = createSpy("support code file paths");
      supportCodeLoader    = createSpy("support code loader");
      supportCodeLibrary   = createSpy("support code library");
      spyOnStub(argumentParser, 'getSupportCodeFilePaths').andReturn(supportCodeFilePaths);
      spyOn(Cucumber.Cli, 'SupportCodeLoader').andReturn(supportCodeLoader);
      spyOnStub(supportCodeLoader, 'getSupportCodeLibrary').andReturn(supportCodeLibrary);
    });

    it("gets the support code file paths", function () {
      configuration.getSupportCodeLibrary();
      expect(argumentParser.getSupportCodeFilePaths).toHaveBeenCalled();
    });

    it("creates a support code loader for those paths", function () {
      configuration.getSupportCodeLibrary();
      expect(Cucumber.Cli.SupportCodeLoader).toHaveBeenCalledWith(supportCodeFilePaths);
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
      spyOnStub(argumentParser, 'getTagGroups').andReturn(tagGroups);
      spyOn(Cucumber.Ast.Filter, 'AnyOfTagsRule').andReturnSeveral(rules);
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
      argumentParser.isHelpRequested.andReturn(isHelpRequested);
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
      argumentParser.isVersionRequested.andReturn(isVersionRequested);
      expect(configuration.isVersionRequested()).toBe(isVersionRequested);
    });
  });

  describe("shouldSnippetsBeInCoffeeScript()", function () {
    beforeEach(function () {
      spyOnStub(argumentParser, 'shouldSnippetsBeInCoffeeScript');
    });

    it("asks the argument parser whether the step definition snippets are in Coffeescript or not", function () {
      configuration.shouldSnippetsBeInCoffeeScript();
      expect(argumentParser.shouldSnippetsBeInCoffeeScript).toHaveBeenCalled();
    });

    it("returns the answer from the argument parser", function () {
      var shouldSnippetsBeInCoffeeScript = createSpy("step definitions in CS?");
      argumentParser.shouldSnippetsBeInCoffeeScript.andReturn(shouldSnippetsBeInCoffeeScript);
      expect(configuration.shouldSnippetsBeInCoffeeScript()).toBe(shouldSnippetsBeInCoffeeScript);
    });
  });

  describe("shouldSnippetsBeShown()", function () {
    beforeEach(function () {
      spyOnStub(argumentParser, 'shouldSnippetsBeShown');
    });

    it("asks the argument parser whether the step definition snippets are shown or not", function () {
      configuration.shouldSnippetsBeShown();
      expect(argumentParser.shouldSnippetsBeShown).toHaveBeenCalled();
      expect(argumentParser.shouldSnippetsBeShown.callCount).toBe(1);
    });

    it("returns the answer from the argument parser", function () {
      var shouldSnippetsBeShown = createSpy("show step definitions?");
      argumentParser.shouldSnippetsBeShown.andReturn(shouldSnippetsBeShown);
      expect(configuration.shouldSnippetsBeShown()).toBe(shouldSnippetsBeShown);
    });
  });

});
