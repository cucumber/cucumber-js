require('../../support/spec_helper');

describe("Cucumber.Type.Collection", function () {
  var Cucumber = requireLib('cucumber');
  var collection, itemArray;

  beforeEach(function () {
    itemArray = [1, 2, 3];
    spyOn(itemArray, 'push');
    spyOn(itemArray, 'unshift');
    spyOn(itemArray, 'splice');
    spyOn(itemArray, 'indexOf');
    spyOn(global, 'Array').andReturn(itemArray);
    collection = Cucumber.Type.Collection();
  });

  describe("constructor", function () {
    it("creates a new array to store the items in the collection", function () {
      expect(Array).toHaveBeenCalled();
    });
  });

  describe("add()", function () {
    it("pushes the item onto the end of the item array", function () {
      var item = createSpy("collection item");
      collection.add(item);
      expect(itemArray.push).toHaveBeenCalledWith(item);
    });
  });

  describe("insert()", function () {
    it("inserts an item at a specific index in the item array", function () {
      var index = createSpy("index in the collection");
      var item = createSpy("collection item");
      collection.insert(index, item);
      expect(itemArray.splice).toHaveBeenCalledWith(index, 0, item);
    });
  });

  describe("removeAtIndex()", function () {
    it("removes an item at a specific index in the item array", function () {
      var index = createSpy("index in the collection");
      collection.removeAtIndex(index);
      expect(itemArray.splice).toHaveBeenCalledWith(index, 1);
    });
  });

  describe("unshift()", function () {
    it("unshifts the item onto the start of the item array", function () {
      var item = createSpy("collection item");
      collection.unshift(item);
      expect(itemArray.unshift).toHaveBeenCalledWith(item);
    });
  });

  describe("clear()", function () {
    it("empties the item array", function () {
      expect(itemArray.length).toEqual(3);
      collection.clear();
      expect(itemArray.length).toEqual(0);
    });
  });

  describe("indexOf()", function () {
    it("gets the index of an item in the item array", function () {
      var item  = createSpy("collection item");
      var index = createSpy("index in the collection");
      itemArray.indexOf.andReturn(index);
      var actualIndex = collection.indexOf(item);
      expect(itemArray.indexOf).toHaveBeenCalledWith(item);
      expect(actualIndex).toBe(index);
    });
  });

  describe("getAtIndex()", function () {
    it("gets the item at a specific index in the item array", function () {
      expect(collection.getAtIndex(0)).toEqual(1);
      expect(collection.getAtIndex(1)).toEqual(2);
      expect(collection.getAtIndex(2)).toEqual(3);
    });
  });

  describe("getLast()", function () {
    it("returns the latest added item from the array", function () {
      var lastItem = createSpy("last item");
      itemArray[itemArray.length] = lastItem;
      expect(collection.getLast()).toBe(lastItem);
    });
  });

  describe("forEach()", function () {
    var userFunction, callback, itemCount;
    var processedItems, allItemsProcessedBeforeCallback;
    var delayItemProcessing;

    beforeEach(function () {
      processedItems = [];
      allItemsProcessedBeforeCallback = false;
      delayItemProcessing = false;
      userFunction = createSpy("forEach() user function").andCallFake(function (item, callback) {
        processedItems.push(item);
        if (!delayItemProcessing)
          callback();
      });
      callback = createSpy("forEach() callback").andCallFake(function () {
        if (processedItems.length === itemCount)
          allItemsProcessedBeforeCallback = true;
      });
      itemCount = itemArray.length;
    });

    it("calls the user function on each item in the array with a callback", function () {
      collection.forEach(userFunction, callback);
      var callIndex = 0;
      expect(userFunction).toHaveBeenCalledNTimes(3);
      itemArray.forEach(function (item) {
        var args = userFunction.calls[callIndex++].args;
        expect(args[0]).toBe(item);
        expect(args[1]).toBeAFunction ();
      });
    });

    it("calls the forEach() callback when all items have been processed and called their user function callback", function () {
      collection.forEach(userFunction, callback);
      expect(callback).toHaveBeenCalled();
      expect(allItemsProcessedBeforeCallback).toBeTruthy();
    });

    it("does not call the forEach() callback if not all items are processed", function () {
      delayItemProcessing = true;
      collection.forEach(userFunction, callback);
      expect(allItemsProcessedBeforeCallback).toBeFalsy();
      expect(callback).not.toHaveBeenCalled();
    });

    it("does not process the next item until the current one is finished", function () {
      delayItemProcessing = true;
      collection.forEach(userFunction, callback);
      expect(userFunction).toHaveBeenCalledNTimes(1);
      var args = userFunction.mostRecentCall.args;
      expect(args[0]).toBe(itemArray[0]);
    });

    it("does not modify the original array", function () {
      var originalArray = itemArray.slice(0);
      collection.forEach(userFunction, callback);
      expect(itemArray).toEqual(originalArray);
    });
  });

  describe("syncForEach()", function () {
    var userFunction = createSpy("userFunction");

    it("calls foreach on a copy of the array", function () {
      var itemsCopy = createSpy("items copy");
      spyOn(itemArray, 'slice').andReturn(itemsCopy);
      spyOnStub(itemsCopy, 'forEach');
      collection.syncForEach(userFunction);
      expect(itemArray.slice).toHaveBeenCalledWith(0);
      expect(itemsCopy.forEach).toHaveBeenCalledWith(userFunction);
    });
  });
});
