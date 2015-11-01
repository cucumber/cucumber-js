function TagGroupParser(tagGroupString) {
  var self = {
    parse: function parse() {
      var splitTags = tagGroupString.split(TagGroupParser.TAG_SEPARATOR);
      var trimmedTags = splitTags.map(function (tag) { return tag.trim(); });
      return trimmedTags;
    }
  };
  return self;
}

TagGroupParser.getTagGroupsFromStrings = function getTagGroupsFromStrings(tagGroupStrings) {
  var Cucumber = require('../cucumber');

  var tagGroups = tagGroupStrings.map(function (tagOptionValue) {
    var tagGroupParser = Cucumber.TagGroupParser(tagOptionValue);
    var tagGroup       = tagGroupParser.parse();
    return tagGroup;
  });
  return tagGroups;
};

TagGroupParser.TAG_SEPARATOR = ',';

module.exports = TagGroupParser;
