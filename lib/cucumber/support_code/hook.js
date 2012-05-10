if (typeof define !== 'function') { var define = require('amdefine')(module); }
define(['../util/array', '../tag_group_parser', '../ast'],
       function(_, TagGroupParser, Ast) {

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
        var rule = Ast.Filter.AnyOfTagsRule(tagGroup);
        return rule;
      });
      var astFilter = Ast.Filter(rules);
      return astFilter;
    }
  };
  return self;
};
return Hook;
});
