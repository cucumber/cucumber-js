require('../support/spec_helper');
require('../support/configurations_shared_examples.js');

describe("Cucumber.VolatileConfiguration", function() {
  var Cucumber = requireLib('cucumber');

  var featureSource, supportCodeInitializer, configuration;
  var supportCodeLibrary;
  var context = {};

  beforeEach(function() {
    supportCodeLibrary       = createSpy("support code library");
    spyOn(Cucumber.SupportCode, 'Library').andReturn(supportCodeLibrary);
    featureSource            = createSpy("feature source");
    supportCodeInitializer   = createSpy("support code initializer");
    configuration            = Cucumber.VolatileConfiguration(featureSource, supportCodeInitializer);
    context['configuration'] = configuration;
  });

  itBehavesLikeAllCucumberConfigurations(context);

  describe("constructor", function() {
    it("creates a support code library with the initializer", function() {
      expect(Cucumber.SupportCode.Library).toHaveBeenCalledWith(supportCodeInitializer);
    });
  });

  describe("getFeatureSources()", function() {
    it("returns the feature source and its volatile name", function() {
      var featureNameSourcePair = [Cucumber.VolatileConfiguration.FEATURE_SOURCE_NAME, featureSource];
      var featureSources        = [featureNameSourcePair];
      expect(configuration.getFeatureSources()).toEqual(featureSources);
    })
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
    it("returns the support code library", function() {
      expect(configuration.getSupportCodeLibrary()).toBe(supportCodeLibrary);
    });
  });

  describe("getTagAstFilterRules()", function() {
    describe("when there are no tags specified", function() {
      beforeEach(function() {
        configuration = Cucumber.VolatileConfiguration(featureSource, supportCodeInitializer);
      });

      it("returns an empty set of rules", function() {
        expect(configuration.getTagAstFilterRules()).toEqual([]);
      });
    });

    describe("when there are some tags", function() {
      var options, tagGroups, rules;

      beforeEach(function() {
        tagGroups = [createSpy("tag group 1"), createSpy("tag group 2"), createSpy("tag group 3")];
        rules     = [createSpy("any of tags rule 1"), createSpy("any of tags rule 2"), createSpy("any of tags rule 3")];
        spyOn(Cucumber.Ast.Filter, 'AnyOfTagsRule').andReturnSeveral(rules);
        options                  = {tags: tagGroups};
        configuration            = Cucumber.VolatileConfiguration(featureSource, supportCodeInitializer, options);
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
  });
});
