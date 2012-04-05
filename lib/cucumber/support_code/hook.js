define(['dojo/_base/array', '../tag_group_parser', '../ast/filter'],
       function(_, TagGroupParser, AstFilter) {

var Hook = function(code, options) {

  var tags = options['tags'] || [];

  var self = {
    invokeBesideScenario: function invokeBesideScenario(scenario, world, callback) {
      if (self.appliesToScenario(scenario))
        code.call(world, callback);
      else
        callback(function(endPostScenarioAroundHook) { endPostScenarioAroundHook(); });
    },

    appliesToScenario: function appliesToScenario(scenario) {
      var astFilter = self.getAstFilter();
      return astFilter.isScenarioEnrolled(scenario);
    },

    getAstFilter: function getAstFilter() {
      var tagGroups = TagGroupParser.getTagGroupsFromStrings(tags);
      var rules = _.map(tagGroups, function(tagGroup) {
        var rule = AstFilter.AnyOfTagsRule(tagGroup);
        return rule;
      });
      var astFilter = AstFilter(rules);
      return astFilter;
    }
  };
  return self;
};
return Hook;
});
