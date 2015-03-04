function Collection() {
  /* jshint -W009 */
  var items = new Array();
  /* jshint +W009 */

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

    syncForEach: function syncForEach(userFunction) {
      var itemsCopy = items.slice(0);
      itemsCopy.forEach(userFunction);
    },

    forEach: function forEach(userFunction, callback) {
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
    },

    syncMap: function map(userFunction) {
      var newCollection = new Collection();
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
}

module.exports = Collection;
