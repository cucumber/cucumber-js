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
    Cucumber.SupportCode.Library.Hooker = createSpy("support code library hooker");
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
    var tagGroupStrings;

    describe("when there are no tags specified", function() {
      it("returns an empty set of rules", function() {
        expect(configuration.getTagAstFilterRules()).toEqual([]);
      });
    });

    describe("when some tags were specified", function() {
      beforeEach(function() {
        tagGroupStrings = [createSpy("tag group string 1"), createSpy("tag group string 2"), createSpy("tag group string 3")];
        rules           = [createSpy("rule 1"), createSpy("rule 2"), createSpy("rule 3")];
        configuration   = Cucumber.VolatileConfiguration(featureSource, supportCodeInitializer, {tags: tagGroupStrings});
        spyOn(configuration, 'buildAstFilterRuleFromTagGroupString').andReturnSeveral(rules);
      });

      it("builds the filter rule based on the tags", function() {
        configuration.getTagAstFilterRules();
        tagGroupStrings.forEach(function(tagGroupString) {
          expect(configuration.buildAstFilterRuleFromTagGroupString).toHaveBeenCalledWith(tagGroupString);
        });
      });

      it("returns the rules", function() {
        expect(configuration.getTagAstFilterRules()).toEqual(rules);
      });
    });
  });

  describe("buildAstFilterRuleFromTagGroupString()", function() {
    var tagGroupString, tagGroup, tagGroupParser, rule;

    beforeEach(function() {
      tagGroupString = createSpy("tag group string");
      tagGroup       = createSpy("tag group");
      tagGroupParser = createSpyWithStubs("tag group parser", {parse: tagGroup});
      rule           = createSpy("rule");
      spyOn(Cucumber, 'TagGroupParser').andReturn(tagGroupParser);
      spyOn(Cucumber.Ast.Filter, 'AnyOfTagsRule').andReturn(rule);
    });

    it("instantiates a tag group parser", function() {
      configuration.buildAstFilterRuleFromTagGroupString(tagGroupString);
      expect(Cucumber.TagGroupParser).toHaveBeenCalledWith(tagGroupString);
    });

    it("parses the tag group", function() {
      configuration.buildAstFilterRuleFromTagGroupString(tagGroupString);
      expect(tagGroupParser.parse).toHaveBeenCalled();
    });

    it("instantiates an 'any of tags' rule based on the tag group", function() {
      configuration.buildAstFilterRuleFromTagGroupString(tagGroupString);
      expect(Cucumber.Ast.Filter.AnyOfTagsRule).toHaveBeenCalledWith(tagGroup);
    });

    it("returns the rule", function() {
      var returned = configuration.buildAstFilterRuleFromTagGroupString(tagGroupString);
      expect(returned).toBe(rule);
    });
  });
});
