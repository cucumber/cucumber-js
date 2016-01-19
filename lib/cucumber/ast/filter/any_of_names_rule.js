var _ = require('lodash');

function AnyOfNamesRule(names) {
  var self = {
    isSatisfiedByElement: function isSatisfiedByElement(element) {
      if (names.length === 0) {
        return true;
      }
      var satisfied = _.some(names, function (name) {
        return element.getName().match(name);
      });
      return satisfied;
    }
  };
  return self;
}

module.exports = AnyOfNamesRule;
