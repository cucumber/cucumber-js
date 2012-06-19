var Row = function(cells, uri, line) {
  var Cucumber = require('../../../cucumber');

  self = {
    raw: function raw() {
      return cells;
    }
  };
  return self;
}
module.exports = Row;
