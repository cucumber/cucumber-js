var _ = require('underscore');

var TagGroupParser = function(tagGroupString) {
  var self = {
    parse: function parse() {
      var splitTags = tagGroupString.split(TagGroupParser.TAG_SEPARATOR);
      var trimmedTags = _.map(splitTags, function(tag) { return tag.trim(); });
      return trimmedTags;
    }
  };

  return self;
};
TagGroupParser.TAG_SEPARATOR = ',';
module.exports = TagGroupParser;
