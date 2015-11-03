function Tag(data) {
  var self = {
    getName: function getName() {
      return data.name;
    },

    getLine: function getLine() {
      return data.location.line;
    }
  };
  return self;
}

module.exports = Tag;
