var _ = require('lodash');

function ElementMatchingTagSpec(tagName) {
  var self = {
    isMatching: function isMatching(element) {
      var elementTags = element.getTags();
      var matching;
      if (self.isExpectingTag())
        matching = _.some(elementTags, self.isTagSatisfying);
      else
        matching = _.every(elementTags, self.isTagSatisfying);
      return matching;
    },

    isTagSatisfying: function isTagSatisfying(tag) {
      var checkedTagName = tag.getName();
      var satisfying;
      if (self.isExpectingTag())
        satisfying = checkedTagName === tagName;
      else {
        var negatedCheckedTagName = ElementMatchingTagSpec.NEGATION_CHARACTER + checkedTagName;
        satisfying = negatedCheckedTagName !== tagName;
      }
      return satisfying;
    },

    isExpectingTag: function isExpectingTag() {
      var expectingTag = tagName[0] !== ElementMatchingTagSpec.NEGATION_CHARACTER;
      return expectingTag;
    }
  };
  return self;
}

ElementMatchingTagSpec.NEGATION_CHARACTER = '~';

module.exports = ElementMatchingTagSpec;
