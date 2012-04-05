define([
    'dojo/_base/array',
    './filter/element_matching_tag_spec',
    './filter/any_of_tags_rule'
], function(_, ElementMatchingTagSpec, AnyOfTagsRule) {

var Filter = function(rules) {
  var self = {
    isScenarioEnrolled: function isScenarioEnrolled(scenario) {
      var enrolled = _.every(rules, function(rule) {
        return rule.isSatisfiedByElement(scenario);
      });
      return enrolled;
    }
  };
  return self;
};
Filter.ElementMatchingTagSpec = ElementMatchingTagSpec;
Filter.AnyOfTagsRule          = AnyOfTagsRule;
return Filter;
});
