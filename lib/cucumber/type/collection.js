var Collection = function () {
  var items = new Array();
  var self = {
    add: function add(item) {
      items.push(item);
    },

    unshift: function unshift(item) {
      items.unshift(item);
    },

    shift: function shift() {
      return items.shift();
    },

    getLast: function getLast() {
      return items[items.length - 1];
    },

    syncForEach: function syncForEach(userFunction) {
      items.forEach(userFunction);
    },

    forEach: function forEach(userFunction, callback) {
      var itemsCopy = items.slice(0);

      function iterate() {
        if (itemsCopy.length > 0) {
          processItem();
        } else {
          callback();
        };
      }

      function processItem() {
        var item = itemsCopy.shift();
        userFunction(item, function () {
          iterate();
        });
      };
      iterate();
    },

    syncMap: function map(userFunction) {
      var newCollection = Collection();
      items.map(function (item) {
        newCollection.add(userFunction(item));
      });
      return newCollection;
    },

    length: function length() {
      return items.length;
    }
  };
  return self;
};
module.exports = Collection;
