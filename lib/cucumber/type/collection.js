function Collection() {
  var items = [];

  var self = {
    add: function add(item) {
      items.push(item);
    },

    insert: function insert(index, item) {
      items.splice(index, 0, item);
    },

    removeAtIndex: function removeAtIndex(index) {
      items.splice(index, 1);
    },

    unshift: function unshift(item) {
      items.unshift(item);
    },

    shift: function shift() {
      return items.shift();
    },

    clear: function clear() {
      items.length = 0;
    },

    indexOf: function indexOf(item) {
      return items.indexOf(item);
    },

    getAtIndex: function getAtIndex(index) {
      return items[index];
    },

    getLast: function getLast() {
      return items[items.length - 1];
    },

    forEach: function forEach(userFunction) {
      var itemsCopy = items.slice(0);
      itemsCopy.forEach(userFunction);
    },

    asyncForEach: function asyncForEach(userFunction, callback) {
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
    },

    syncMap: function map(userFunction) {
      var newCollection = new Collection();
      items.map(function (item) {
        newCollection.add(userFunction(item));
      });
      return newCollection;
    },

    sort: function sort(comparator) {
      var sortedItems = items.sort(comparator);
      var sortedCollection = new Collection();
      sortedItems.forEach(function (item) {
        sortedCollection.add(item);
      });
      return sortedCollection;
    },

    length: function length() {
      return items.length;
    },

    toArray: function toArray() {
      return items.slice(0);
    },

    filter: function (predicate) {
      var filteredItems = items.filter(predicate);
      var filteredCollection = new Collection();
      filteredItems.forEach(function (item) {
        filteredCollection.add(item);
      });
      return filteredCollection;
    }
  };
  return self;
}

module.exports = Collection;
