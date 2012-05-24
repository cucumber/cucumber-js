require('../../support/spec_helper');
require('../../support/configurations_shared_examples.js');

describe("Cucumber.Cli.Configuration", function() {
  var Cucumber = requireLib('cucumber');

  var argv, configuration;
  var argumentParser;
  var context = {};

  beforeEach(function() {
    argv                = createSpy("arguments (argv)");
    argumentParser      = createSpyWithStubs("argument parser", {parse: null});
    spyOn(Cucumber.Cli, 'ArgumentParser').andReturn(argumentParser);
    configuration       = Cucumber.Cli.Configuration(argv);
    context['configuration'] = configuration;
  });

  itBehavesLikeAllCucumberConfigurations(context);

  describe("constructor", function() {
    it("creates an argument parser", function() {
      expect(Cucumber.Cli.ArgumentParser).toHaveBeenCalledWith();
    });

    it("tells the argument parser to parse the arguments", function() {
      expect(argumentParser.parse).toHaveBeenCalledWith(argv);
    });
  });

  describe("getFeatureSources()", function() {
    var featureFilePaths, featureSourceLoader, featureSources;

    beforeEach(function() {
      featureFilePaths    = createSpy("feature file paths");
      featureSourceLoader = createSpy("feature source loader");
      featureSources      = createSpy("feature sources");
      spyOnStub(argumentParser, 'getFeatureFilePaths').andReturn(featureFilePaths);
      spyOnStub(featureSourceLoader, 'getSources').andReturn(featureSources);
      spyOn(Cucumber.Cli, 'FeatureSourceLoader').andReturn(featureSourceLoader);
    });

    it("gets the feature file paths", function() {
      configuration.getFeatureSources();
      expect(argumentParser.getFeatureFilePaths).toHaveBeenCalled();
    });

    it("creates a feature source loader for those paths", function() {
      configuration.getFeatureSources();
      expect(Cucumber.Cli.FeatureSourceLoader).toHaveBeenCalledWith(featureFilePaths);
    });

    it("gets the feature sources from the loader", function() {
      configuration.getFeatureSources();
      expect(featureSourceLoader.getSources).toHaveBeenCalled();
    });

    it("returns the feature sources", function() {
      expect(configuration.getFeatureSources()).toBe(featureSources);
    });
  });

  describe("getAstFilter()", function() {
    var astFilter, tagFilterRules;

    beforeEach(function() {
      astFilter      = createSpyWithStubs("AST filter");
      tagFilterRules = createSpy("tag specs");
      spyOn(Cucumber.Ast, 'Filter').andReturn(astFilter);
      spyOn(configuration, 'getTagAstFilterRules').andReturn(tagFilterRules);
    });

    it("gets the tag filter rules", function() {
      configuration.getAstFilter();
      expect(configuration.getTagAstFilterRules).toHaveBeenCalled();
    });

    it("instantiates an AST filter", function() {
      configuration.getAstFilter();
      expect(Cucumber.Ast.Filter).toHaveBeenCalledWith(tagFilterRules);
    });

    it("returns the AST filter", function() {
      expect(configuration.getAstFilter()).toBe(astFilter);
    });
  });

  describe("getSupportCodeLibrary()", function() {
    var supportCodeFilePaths, supportCodeLoader, supportCodeLibrary;

    beforeEach(function() {
      supportCodeFilePaths = createSpy("support code file paths");
      supportCodeLoader    = createSpy("support code loader");
      supportCodeLibrary   = createSpy("support code library");
      spyOnStub(argumentParser, 'getSupportCodeFilePaths').andReturn(supportCodeFilePaths);
      spyOn(Cucumber.Cli, 'SupportCodeLoader').andReturn(supportCodeLoader);
      spyOnStub(supportCodeLoader, 'getSupportCodeLibrary').andReturn(supportCodeLibrary);
    });

    it("gets the support code file paths", function() {
      configuration.getSupportCodeLibrary();
      expect(argumentParser.getSupportCodeFilePaths).toHaveBeenCalled();
    });

    it("creates a support code loader for those paths", function() {
      configuration.getSupportCodeLibrary();
      expect(Cucumber.Cli.SupportCodeLoader).toHaveBeenCalledWith(supportCodeFilePaths);
    });

    it("gets the support code library from the support code loader", function() {
      configuration.getSupportCodeLibrary();
      expect(supportCodeLoader.getSupportCodeLibrary).toHaveBeenCalled();
    });

    it("returns the support code library", function() {
      expect(configuration.getSupportCodeLibrary()).toBe(supportCodeLibrary);
    });
  });

  describe("getTagAstFilterRules()", function() {
    var tagGroups, rules;

    beforeEach(function() {
      tagGroups = [createSpy("tag group 1"), createSpy("tag group 2"), createSpy("tag group 3")];
      rules     = [createSpy("any of tags rule 1"), createSpy("any of tags rule 2"), createSpy("any of tags rule 3")];
      spyOnStub(argumentParser, 'getTagGroups').andReturn(tagGroups);
      spyOn(Cucumber.Ast.Filter, 'AnyOfTagsRule').andReturnSeveral(rules);
    });

    it("gets the tag groups from the argument parser", function() {
      configuration.getTagAstFilterRules();
      expect(argumentParser.getTagGroups).toHaveBeenCalled();
    });

    it("creates an 'any of tags' filter rule per each group", function() {
      configuration.getTagAstFilterRules();
      tagGroups.forEach(function(tagGroup) {
        expect(Cucumber.Ast.Filter.AnyOfTagsRule).toHaveBeenCalledWith(tagGroup);
      });
    });

    it("returns all the rules", function() {
      expect(configuration.getTagAstFilterRules()).toEqual(rules);
    });
  });

  describe("isHelpRequired()", function() {
    beforeEach(function() {
      spyOnStub(argumentParser, 'isHelpRequested');
    });

    it("asks the argument parser wether the help was requested or not", function() {
      configuration.isHelpRequested();
      expect(argumentParser.isHelpRequested).toHaveBeenCalled();
    });

    it("returns the answer from the argument parser", function() {
      var isHelpRequested = createSpy("is help requested?");
      argumentParser.isHelpRequested.andReturn(isHelpRequested);
      expect(configuration.isHelpRequested()).toBe(isHelpRequested);
    });
  });

  describe("isVersionRequired()", function() {
    beforeEach(function() {
      spyOnStub(argumentParser, 'isVersionRequested');
    });

    it("asks the argument parser wether the version was requested or not", function() {
      configuration.isVersionRequested();
      expect(argumentParser.isVersionRequested).toHaveBeenCalled();
    });

    it("returns the answer from the argument parser", function() {
      var isVersionRequested = createSpy("is version requested?");
      argumentParser.isVersionRequested.andReturn(isVersionRequested);
      expect(configuration.isVersionRequested()).toBe(isVersionRequested);
    });
  });

  describe("getFormatter()", function() {
    beforeEach(function() {
      spyOnStub(argumentParser, 'getFormat');
    });

    it("asks the argument parser which format we should be outputting in", function() {
      configuration.getFormatter();
      expect(argumentParser.getFormat).toHaveBeenCalled();
    });
//
//    it("returns the corresponding formatter for us to use", function() {
//      // TODO: Fill this out when my head is in a better place
//    });
  });

});
