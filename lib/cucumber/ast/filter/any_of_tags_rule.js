if (typeof define !== 'function') { var define = require('amdefine')(module); }
define([
    '../../util/array',
    './element_matching_tag_spec'
], function(_, ElementMatchingTagSpec) {

var AnyOfTagsRule = function(tags) {

  var self = {
    isSatisfiedByElement: function isSatisfiedByElement(element) {
      var satisfied = _.some(tags, function(tag) {
        var spec = require("../filter").ElementMatchingTagSpec(tag);
        return spec.isMatching(element);
      });
      return satisfied;
    }
  };
  return self;
};
return AnyOfTagsRule;
});
