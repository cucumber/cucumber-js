function VolatileConfiguration(features, supportCodeInitializer, options) {
  var Cucumber = require('../cucumber');
  var supportCodeLibrary = Cucumber.SupportCode.Library(supportCodeInitializer);

  options = options || {};
  var strictMode = !!options.strict;
  var tagGroupStrings = options.tags || [];
  var backtrace = !!options.backtrace;

  var self = {
    isStrictRequested: function isStrictRequested() {
      return strictMode;
    },

    getFeatureSources: function getFeatureSources() {
      if (features.replace) { // single source
        var featureNameSourcePair = [VolatileConfiguration.FEATURE_SOURCE_NAME, features];
        return [featureNameSourcePair];
      } else { // multiple features
        return features;
      }
    },

    getAstFilter: function getAstFilter() {
      var tagRules = self.getTagAstFilterRules();
      var astFilter = Cucumber.Ast.Filter(tagRules);
      return astFilter;
    },

    getSupportCodeLibrary: function getSupportCodeLibrary() {
      return supportCodeLibrary;
    },

    getTagAstFilterRules: function getTagAstFilterRules() {
      var rules = [];
      tagGroupStrings.forEach(function (tagGroupString) {
        var rule = self.buildAstFilterRuleFromTagGroupString(tagGroupString);
        rules.push(rule);
      });
      return rules;
    },

    buildAstFilterRuleFromTagGroupString: function buildAstFilterRuleFromTagGroupString(tagGroupString) {
      var tagGroupParser = Cucumber.TagGroupParser(tagGroupString);
      var tagGroup       = tagGroupParser.parse();
      var rule           = Cucumber.Ast.Filter.AnyOfTagsRule(tagGroup);
      return rule;
    },

    shouldFilterStackTraces: function shouldFilterStackTraces() {
      return !backtrace;
    }
  };
  return self;
}

VolatileConfiguration.FEATURE_SOURCE_NAME = '(feature)';

module.exports = VolatileConfiguration;
