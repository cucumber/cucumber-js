function TagGroupParser(tagGroupConfig) {
  var tagGroupString = tagGroupConfig;

  if (typeof tagGroupConfig === 'object' && tagGroupConfig !== null) {
    tagGroupString = tagGroupConfig.tags.join(',');
  }

  return {
    parse: function parse() {
      return tagGroupString
        .split(TagGroupParser.TAG_SEPARATOR)
        .map(function (tag) { return tag.trim(); });
    }
  };
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
