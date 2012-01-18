require('../../support/spec_helper');

describe("Cucumber.Type.Collection", function() {
  var Cucumber = requireLib('cucumber');
  var collection, itemArray;

  beforeEach(function() {
    itemArray = [1, 2, 3];
    spyOn(itemArray, 'push');
    spyOn(itemArray, 'unshift');
    spyOn(global, 'Array').andReturn(itemArray);
    collection = Cucumber.Type.Collection();
  });

  describe("constructor", function() {
    it("creates a new array to store the items in the collection", function() {
      expect(Array).toHaveBeenCalled();
    });
  });

  describe("add()", function() {
    it("pushes the item onto the end of the item array", function() {
      var item = createSpy("Collection item");
      collection.add(item);
      expect(itemArray.push).toHaveBeenCalledWith(item);
    });
  });

  describe("unshift()", function() {
    it("unshifts the item onto the start of the item array", function() {
      var item = createSpy("Collection item");
      collection.unshift(item);
      expect(itemArray.unshift).toHaveBeenCalledWith(item);
    });
  });

  describe("getLast()", function() {
    it("returns the latest added item from the array", function() {
      var lastItem = createSpy("last item");
      itemArray[itemArray.length] = lastItem;
      expect(collection.getLast()).toBe(lastItem);
    });
  });

  describe("forEach()", function() {
    var userFunction, callback, itemCount;
    var processedItems, allItemsProcessedBeforeCallback;
    var delayItemProcessing;
    var itemArrayCopy;

    beforeEach(function() {
      processedItems = [];
      allItemsProcessedBeforeCallback = false;
      delayItemProcessing = false;
      userFunction = createSpy("forEach() user function").andCallFake(function(item, callback) {
        processedItems.push(item);
        if (!delayItemProcessing)
          callback();
      });
      callback = createSpy("forEach() callback").andCallFake(function() {
        if (processedItems.length == itemCount)
          allItemsProcessedBeforeCallback = true;
      });;
      itemCount = itemArray.length;
    });

    it("calls the user function on each item in the array with a callback", function() {
      collection.forEach(userFunction, callback);
      var callIndex = 0;
      expect(userFunction).toHaveBeenCalledNTimes(3);
      itemArray.forEach(function(item) {
        var args = userFunction.calls[callIndex++].args;
        expect(args[0]).toBe(item);
        expect(args[1]).toBeAFunction();
      });
    });

    it("calls the forEach() callback when all items have been processed and called their user function callback", function() {
      collection.forEach(userFunction, callback);
      expect(callback).toHaveBeenCalled();
      expect(allItemsProcessedBeforeCallback).toBeTruthy();
    });

    it("does not call the forEach() callback if not all items are processed", function() {
      delayItemProcessing = true;
      collection.forEach(userFunction, callback);
      expect(allItemsProcessedBeforeCallback).toBeFalsy();
      expect(callback).not.toHaveBeenCalled();
    });

    it("does not process the next item until the current one is finished", function() {
      delayItemProcessing = true;
      collection.forEach(userFunction, callback);
      var callIndex = 0;
      expect(userFunction).toHaveBeenCalledNTimes(1);
      var args = userFunction.mostRecentCall.args;
      expect(args[0]).toBe(itemArray[0]);
    });

    it("does not modify the original array", function() {
      var originalArray = itemArray.slice(0);
      collection.forEach(userFunction, callback);
      expect(itemArray).toEqual(originalArray);
    });
  });

  describe("syncForEach()", function() {
    var userFunction = createSpy("userFunction");

    it("calls foreach on the array", function() {
      spyOn(itemArray, 'forEach');
      collection.syncForEach(userFunction);
      expect(itemArray.forEach).toHaveBeenCalledWith(userFunction);
    });
  });
});

