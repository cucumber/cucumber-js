var Tag = function (name, uri, line) {
    'use strict';

    var self = {
        getName: function getName() {
            return name;
        },

        getUri: function getUri() {
            return uri;
        },

        getLine: function getLine() {
            return line;
        }
    };
    return self;
};
module.exports = Tag;