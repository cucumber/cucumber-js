var asyncForEach = function asyncForEach(items, userFunction, callback) {
  var itemsCopy = items.slice(0);

  function iterate() {
    if (itemsCopy.length > 0) {
      var item = itemsCopy.shift();
      userFunction(item, function () {
        iterate();
      });
    } else {
      callback();
    }
  }

  iterate();
};

module.exports = asyncForEach;
