var _ = require('underscore');

var Filter = function(rules) {
  var self = {
    isElementEnrolled: function isElementEnrolled(element) {
      var enrolled = _.all(rules, function(rule) {
        return rule.isSatisfiedByElement(element);
      });
      return enrolled;
    }
  };
  return self;
};
Filter.AnyOfTagsRule          = require('./filter/any_of_tags_rule');
Filter.ElementMatchingTagSpec = require('./filter/element_matching_tag_spec');
module.exports = Filter;
