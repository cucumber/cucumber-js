if (typeof define !== 'function') { var define = require('amdefine')(module); }
define([], function() {
var WorldConstructor = function() {
  return function World(callback) { callback(); };
};
return WorldConstructor;
});
