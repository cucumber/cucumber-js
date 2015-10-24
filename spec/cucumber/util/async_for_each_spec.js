require('../../support/spec_helper');

describe("Cucumber.Util.asyncForEach", function () {
  var Cucumber = requireLib('cucumber');
  var userFunction, callback;
  var items, processedItems, allItemsProcessedBeforeCallback;
  var delayItemProcessing;

  beforeEach(function () {
    items = ['a','b','c'];
    processedItems = [];
    allItemsProcessedBeforeCallback = false;
    delayItemProcessing = false;
    userFunction = createSpy("user function").and.callFake(function (item, callback) {
      processedItems.push(item);
      if (!delayItemProcessing)
        callback();
    });
    callback = createSpy("callback").and.callFake(function () {
      if (processedItems.length === items.length)
        allItemsProcessedBeforeCallback = true;
    });
  });

  it("calls the user function on each item in the array with a callback", function () {
    Cucumber.Util.asyncForEach(items, userFunction, callback);
    var callIndex = 0;
    expect(userFunction).toHaveBeenCalledTimes(3);
    items.forEach(function (item) {
      var args = userFunction.calls.argsFor(callIndex++);
      expect(args[0]).toBe(item);
      expect(args[1]).toBeAFunction();
    });
  });

  it("calls the asyncForEach() callback when all items have been processed and called their user function callback", function () {
    Cucumber.Util.asyncForEach(items, userFunction, callback);
    expect(callback).toHaveBeenCalled();
    expect(allItemsProcessedBeforeCallback).toBeTruthy();
  });

  it("does not call the asyncForEach() callback if not all items are processed", function () {
    delayItemProcessing = true;
    Cucumber.Util.asyncForEach(items, userFunction, callback);
    expect(allItemsProcessedBeforeCallback).toBeFalsy();
    expect(callback).not.toHaveBeenCalled();
  });

  it("does not process the next item until the current one is finished", function () {
    delayItemProcessing = true;
    Cucumber.Util.asyncForEach(items, userFunction, callback);
    expect(userFunction).toHaveBeenCalledTimes(1);
    var args = userFunction.calls.mostRecent().args;
    expect(args[0]).toBe('a');
  });
});
