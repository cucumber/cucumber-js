define([], function() {
var Row = function(cells, line) {
  var self = {
    raw: function raw() {
      return cells;
    }
  };
  return self;
};

return Row;
});
