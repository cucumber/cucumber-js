define([], function() {
var Arguments = function Arguments(argumentsObject) {
  return Array.prototype.slice.call(argumentsObject);
};
return Arguments;
});