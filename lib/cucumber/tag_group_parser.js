var _ = require('underscore');

var TagGroupParser = function (tagGroupString) {
    'use strict';
    var self = {
        parse: function parse() {
            var splitTags = tagGroupString.split(TagGroupParser.TAG_SEPARATOR);
            var trimmedTags = _.map(splitTags, function (tag) {
                return tag.trim();
            });
            return trimmedTags;
        }
    };
    return self;
};

TagGroupParser.getTagGroupsFromStrings = function getTagGroupsFromStrings(tagGroupStrings) {
    'use strict';
    var Cucumber = require('../cucumber');

    var tagGroups = _.map(tagGroupStrings, function (tagOptionValue) {
        var tagGroupParser = Cucumber.TagGroupParser(tagOptionValue);
        var tagGroup = tagGroupParser.parse();
        return tagGroup;
    });
    return tagGroups;
};

TagGroupParser.TAG_SEPARATOR = ',';
module.exports = TagGroupParser;