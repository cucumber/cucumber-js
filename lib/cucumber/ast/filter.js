var _ = require('lodash');

function Filter(rules) {
  var self = {
    isElementEnrolled: function isElementEnrolled(element) {
      var enrolled = _.every(rules, function (rule) {
        return rule.isSatisfiedByElement(element);
      });
      return enrolled;
    }
  };
  return self;
}

Filter.AnyOfTagsRule          = require('./filter/any_of_tags_rule');
Filter.AnyOfNamesRule         = require('./filter/any_of_names_rule');
Filter.ElementMatchingTagSpec = require('./filter/element_matching_tag_spec');
Filter.ScenarioAtLineRule     = require('./filter/scenario_at_line_rule');

module.exports = Filter;
