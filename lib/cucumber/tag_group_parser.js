if (typeof define !== 'function') { var define = require('amdefine')(module); }
define(['./util/array'], function(_) {

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

TagGroupParser.getTagGroupsFromStrings = function getTagGroupsFromStrings(tagGroupStrings) {

  var tagGroups = _.map(tagGroupStrings, function(tagOptionValue) {
    var tagGroupParser = require('../cucumber').TagGroupParser(tagOptionValue);
    var tagGroup       = tagGroupParser.parse();
    return tagGroup;
  });
  return tagGroups;
};

TagGroupParser.TAG_SEPARATOR = ',';
return TagGroupParser;
});
