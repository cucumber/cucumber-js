var DocString = function(contentType, string, line) {
  var self = {
    getString: function getString() {
      return string;
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
module.exports = DocString;
