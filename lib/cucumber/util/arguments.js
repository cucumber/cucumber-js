if (typeof define !== 'function') { var define = require('amdefine')(module); }
define([], function() {
var Arguments = function Arguments(argumentsObject) {
  return Array.prototype.slice.call(argumentsObject);
};
return Arguments;
});