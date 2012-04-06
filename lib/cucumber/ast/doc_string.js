if (typeof define !== 'function') { var define = require('amdefine')(module); }
define([], function() {
var DocString = function(contentType, contents, line) {
  var self = {
    getContents: function getContents() {
      return contents;
    },

    getContentType: function getContentType() {
      return contentType;
    },

    getLine: function getLine() {
      return line;
    }
  };
  return self;
};

return DocString;
});
