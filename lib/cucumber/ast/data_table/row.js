var Row = function(cells, line) {
  var Cucumber = require('../../../cucumber');

  self = {
    raw: function raw() {
      return cells;
    }
  };
  return self;
}
module.exports = Row;
