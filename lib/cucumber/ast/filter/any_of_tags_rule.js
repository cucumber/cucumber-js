define([
    'dojo/_base/array',
    './element_matching_tag_spec'
], function(_, elementMatchingTagSpec) {

var AnyOfTagsRule = function(tags) {

  var self = {
    isSatisfiedByElement: function isSatisfiedByElement(element) {
      var satisfied = _.some(tags, function(tag) {
        var spec = elementMatchingTagSpec(tag);
        return spec.isMatching(element);
      });
      return satisfied;
    }
  };
  return self;
};
return AnyOfTagsRule;
});
