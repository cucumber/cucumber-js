var asyncForEach = function asyncForEach(items, userFunction, callback) {
  var itemsCopy = items.slice(0);

  function iterate() {
    if (itemsCopy.length > 0) {
      processItem();
    } else {
      callback();
    }
  }

  function processItem() {
    var item = itemsCopy.shift();
    userFunction(item, function () {
      iterate();
    });
  }

  iterate();
};

module.exports = asyncForEach;
