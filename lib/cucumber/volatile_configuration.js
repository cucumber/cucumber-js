if (typeof define !== 'function') { var define = require('amdefine')(module); }
define([
    'require',
    '../cucumber',
    './support_code',
    './ast',
    './tag_group_parser'
], function(require, Cucumber, SupportCode, Ast, TagGroupParser) {
var VolatileConfiguration = function VolatileConfiguration(featureSource, supportCodeInitializer, options) {

  var supportCodeLibrary = SupportCode.Library(supportCodeInitializer);

  options = options || {};
  var tagGroupStrings = options['tags'] || [];

  var self = {
    getFeatureSources: function getFeatureSources() {
      var featureNameSourcePair = [VolatileConfiguration.FEATURE_SOURCE_NAME, featureSource];
      return [featureNameSourcePair];
    },

    getAstFilter: function getAstFilter() {
      var tagRules = self.getTagAstFilterRules();
      var astFilter = Ast.Filter(tagRules);
      return astFilter;
    },

    getSupportCodeLibrary: function getSupportCodeLibrary() {
      return supportCodeLibrary;
    },

    getTagAstFilterRules: function getTagAstFilterRules() {
      var rules = [];
      tagGroupStrings.forEach(function(tagGroupString) {
        var rule = self.buildAstFilterRuleFromTagGroupString(tagGroupString);
        rules.push(rule);
      });
      return rules;
    },

    buildAstFilterRuleFromTagGroupString: function buildAstFilterRuleFromTagGroupString(tagGroupString) {
      var tagGroupParser = require('../cucumber').TagGroupParser(tagGroupString);
      var tagGroup       = tagGroupParser.parse();
      var rule           = Ast.Filter.AnyOfTagsRule(tagGroup);
      return rule;
    }
  };
  return self;
};
VolatileConfiguration.FEATURE_SOURCE_NAME = "(feature)";
return VolatileConfiguration;
});