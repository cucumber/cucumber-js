var WorldConstructor = function() {
  return function World(callback) { callback() };
};
module.exports = WorldConstructor;
