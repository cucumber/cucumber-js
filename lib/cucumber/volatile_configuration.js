var VolatileConfiguration = function VolatileConfiguration(featureSource, supportCodeInitializer, options) {
  var Cucumber = require('../cucumber');

  var supportCodeLibrary = Cucumber.SupportCode.Library(supportCodeInitializer);

  options = options || {};
  var tagGroups = options['tags'] || [];

  var self = {
    getFeatureSources: function getFeatureSources() {
      var featureNameSourcePair = [VolatileConfiguration.FEATURE_SOURCE_NAME, featureSource];
      return [featureNameSourcePair];
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
      tagGroups.forEach(function(tags) {
        var rule = Cucumber.Ast.Filter.AnyOfTagsRule(tags);
        rules.push(rule);
      });
      return rules;
    }
  };
  return self;
};
VolatileConfiguration.FEATURE_SOURCE_NAME = "(feature)";
module.exports = VolatileConfiguration;
