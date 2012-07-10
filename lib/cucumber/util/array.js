if (typeof define !== 'function') { var define = require('amdefine')(module); }
define([], function() {
  function everyOrSome(every, items, userfunc, thisObj) {
    var itemsCopy = items.slice(0), i, result = every, some = !every;
    for (i = 0; i < itemsCopy.length; i++) {
      result = userfunc.call(thisObj, itemsCopy[i], i, itemsCopy);
      if (result === some) {
        return result;
      }
    }
    return result;
  }

  return {
    every: function every(items, userfunc, thisObj) {
      return everyOrSome(true, items, userfunc, thisObj);
    },
    some: function some(items, userfunc, thisObj) {
      return everyOrSome(false, items, userfunc, thisObj);
    },
    map: function map(items, userfunc, thisObj) {
      var itemsCopy = items.slice(0), i, results = [];
      for (i = 0; i < itemsCopy.length; i++) {
        results.push(userfunc.call(thisObj, itemsCopy[i], i, itemsCopy));
      }
      return results;
    },
    uniq: function uniq(items) {
      var i, j, results = [], itemsCopy = items.slice(0);
      for (i = 0; i < itemsCopy.length; i++) {
        for (j = 0; j < results.length; j++) {
          if (itemsCopy[i] === results[j]) { break; }
        }
        if (j == results.length) {
          results.push(itemsCopy[i]);
        }
      }
      return results;
    }
  };
});