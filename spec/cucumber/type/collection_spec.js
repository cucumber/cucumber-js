require('../../support/spec_helper');

describe("Cucumber.Type.Collection", function () {
  var Cucumber = requireLib('cucumber');
  var collection;

  beforeEach(function () {
    collection = Cucumber.Type.Collection();
    collection.add('a');
    collection.add('b');
    collection.add('c');
  });

  describe("add()", function () {
    it("pushes the item onto the end of the item array", function () {
      collection.add('d');
      expect(collection.toArray()).toEqual(['a','b','c','d']);
    });
  });

  describe("insert()", function () {
    it("inserts an item at a specific index in the item array", function () {
      collection.insert(1, 'd');
      expect(collection.toArray()).toEqual(['a','d','b','c']);
    });
  });

  describe("removeAtIndex()", function () {
    it("removes an item at a specific index in the item array", function () {
      collection.removeAtIndex(1);
      expect(collection.toArray()).toEqual(['a','c']);
    });
  });

  describe("unshift()", function () {
    it("unshifts the item onto the start of the item array", function () {
      collection.unshift('d');
      expect(collection.toArray()).toEqual(['d','a','b','c']);
    });
  });

  describe("clear()", function () {
    it("empties the item array", function () {
      expect(collection.length()).toEqual(3);
      collection.clear();
      expect(collection.length()).toEqual(0);
    });
  });

  describe("indexOf()", function () {
    it("gets the index of an item in the item array", function () {
      expect(collection.indexOf('a')).toEqual(0);
      expect(collection.indexOf('d')).toEqual(-1);
    });
  });

  describe("getAtIndex()", function () {
    it("gets the item at a specific index in the item array", function () {
      expect(collection.getAtIndex(0)).toEqual('a');
      expect(collection.getAtIndex(1)).toEqual('b');
      expect(collection.getAtIndex(2)).toEqual('c');
    });
  });

  describe("getLast()", function () {
    it("returns the latest added item from the array", function () {
      expect(collection.getLast()).toEqual('c');
    });
  });

  describe("asyncForEach()", function () {
    var userFunction, callback, itemCount;
    var processedItems, allItemsProcessedBeforeCallback;
    var delayItemProcessing;

    beforeEach(function () {
      processedItems = [];
      allItemsProcessedBeforeCallback = false;
      delayItemProcessing = false;
      userFunction = createSpy("asyncForEach() user function").and.callFake(function (item, callback) {
        processedItems.push(item);
        if (!delayItemProcessing)
          callback();
      });
      callback = createSpy("asyncForEach() callback").and.callFake(function () {
        if (processedItems.length === itemCount)
          allItemsProcessedBeforeCallback = true;
      });
      itemCount = collection.length();
    });

    it("calls the user function on each item in the array with a callback", function () {
      collection.asyncForEach(userFunction, callback);
      var callIndex = 0;
      expect(userFunction).toHaveBeenCalledTimes(3);
      collection.toArray().forEach(function (item) {
        var args = userFunction.calls.argsFor(callIndex++);
        expect(args[0]).toBe(item);
        expect(args[1]).toBeAFunction();
      });
    });

    it("calls the asyncForEach() callback when all items have been processed and called their user function callback", function () {
      collection.asyncForEach(userFunction, callback);
      expect(callback).toHaveBeenCalled();
      expect(allItemsProcessedBeforeCallback).toBeTruthy();
    });

    it("does not call the asyncForEach() callback if not all items are processed", function () {
      delayItemProcessing = true;
      collection.asyncForEach(userFunction, callback);
      expect(allItemsProcessedBeforeCallback).toBeFalsy();
      expect(callback).not.toHaveBeenCalled();
    });

    it("does not process the next item until the current one is finished", function () {
      delayItemProcessing = true;
      collection.asyncForEach(userFunction, callback);
      expect(userFunction).toHaveBeenCalledTimes(1);
      var args = userFunction.calls.mostRecent().args;
      expect(args[0]).toBe(collection.toArray()[0]);
    });
  });

  describe("forEach()", function () {
    it("calls forEach on a copy of the array", function () {
      var items = [];
      collection.forEach(function(item) {
        items.push(item);
      });
      expect(items).toEqual(['a', 'b', 'c']);
    });
  });

  describe("sort()", function () {
    it("sorts the array", function () {
      var sorted = collection.sort(function(a, b) {
        return b > a;
      });

      expect(sorted.toArray()).toEqual(['c', 'b', 'a']);
    });
  });
});
