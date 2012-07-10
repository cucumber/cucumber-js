if (typeof define !== 'function') { var define = require('amdefine')(module); }
define([], function() {
var Row = function(cells, uri, line) {
  var self = {
    raw: function raw() {
      return cells;
    }
  };
  return self;
};

return Row;
});
