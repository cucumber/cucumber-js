var Row = function(cells, uri, line) {
  var Cucumber = require('../../../cucumber');

  var self = {
    raw: function raw() {
      return cells;
    },

    getLine: function getLine(){
      return line;
    }
  };
  return self;
}
module.exports = Row;
