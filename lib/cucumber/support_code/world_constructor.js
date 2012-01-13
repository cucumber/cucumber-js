var WorldConstructor = function() {
  return function(callback) { callback(this) };
};
module.exports = WorldConstructor;
