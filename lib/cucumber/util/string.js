if (typeof define !== 'function') { var define = require('amdefine')(module); }
define([], function() {
var String = {
  count: function count(hayStack, needle) {
    var splitHayStack = hayStack.split(needle);
    return splitHayStack.length - 1;
  }
};
return String;
});
