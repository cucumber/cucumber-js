var _ = require('lodash');

function AnyOfTagsRule(tags) {
  var Cucumber = require('../../../cucumber');

  var self = {
    isSatisfiedByElement: function isSatisfiedByElement(element) {
      var satisfied = _.some(tags, function (tag) {
        var spec = Cucumber.Ast.Filter.ElementMatchingTagSpec(tag);
        return spec.isMatching(element);
      });
      return satisfied;
    }
  };
  return self;
}

module.exports = AnyOfTagsRule;
