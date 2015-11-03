function DocString(data) {
  var self = {
    getType: function getType() {
      return 'DocString';
    },

    getContent: function getContent() {
      return data.content;
    },

    getContentType: function getContentType() {
      return data.contentType;
    },

    getLine: function getLine() {
      return data.location.line;
    }
  };
  return self;
}

module.exports = DocString;
