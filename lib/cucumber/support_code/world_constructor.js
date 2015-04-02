function WorldConstructor() {
  return function World(callback) {
    callback();
  };
}

module.exports = WorldConstructor;
