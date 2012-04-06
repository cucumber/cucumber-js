if (typeof define !== 'function') { var define = require('amdefine')(module); }
define([
    './support_code/library',
    './ast/filter',
    './tag_group_parser'
], function(Library, AstFilter, TagGroupParser) {
var VolatileConfiguration = function VolatileConfiguration(featureSource, supportCodeInitializer, options) {

  var supportCodeLibrary = Library(supportCodeInitializer);

  options = options || {};
  var tagGroupStrings = options['tags'] || [];

  var self = {
    getFeatureSources: function getFeatureSources() {
      var featureNameSourcePair = [VolatileConfiguration.FEATURE_SOURCE_NAME, featureSource];
      return [featureNameSourcePair];
    },

    getAstFilter: function getAstFilter() {
      var tagRules = self.getTagAstFilterRules();
      var astFilter = AstFilter(tagRules);
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
      var tagGroupParser = TagGroupParser(tagGroupString);
      var tagGroup       = tagGroupParser.parse();
      var rule           = AstFilter.AnyOfTagsRule(tagGroup);
      return rule;
    }
  };
  return self;
};
VolatileConfiguration.FEATURE_SOURCE_NAME = "(feature)";
return VolatileConfiguration;
});