function Row(cells, uri, line) {
  var self = {
    raw: function raw() {
      return [].concat(cells);
    },

    getLine: function getLine() {
      return line;
    }
  };
  return self;
}

module.exports = Row;
