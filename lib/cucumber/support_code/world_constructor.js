define([], function() {
var WorldConstructor = function() {
  return function World(callback) { callback(); };
};
return WorldConstructor;
});
