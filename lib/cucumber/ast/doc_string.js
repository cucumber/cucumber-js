if (typeof define !== 'function') { var define = require('amdefine')(module); }
define([], function() {
var DocString = function(contentType, contents, uri, line) {
  var self = {
    getContents: function getContents() {
      return contents;
    },

    getContentType: function getContentType() {
      return contentType;
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

return DocString;
});
