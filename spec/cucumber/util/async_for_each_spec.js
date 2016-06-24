require('../../support/spec_helper');

describe("Cucumber.Util.asyncForEach", function () {
  var Cucumber = requireLib('cucumber');
  var userFunction;
  var items, processedItems;
  var delayItemProcessing;

  beforeEach(function () {
    items = ['a','b','c'];
    processedItems = [];
    delayItemProcessing = false;
    userFunction = createSpy("user function").and.callFake(function (item, callback) {
      processedItems.push(item);
      if (!delayItemProcessing)
        callback();
    });
  });

  it("calls the user function on each item in the array with a callback before calling the final callback", function (done) {
    Cucumber.Util.asyncForEach(items, userFunction, function() {
      var callIndex = 0;
      expect(userFunction).toHaveBeenCalledTimes(3);
      items.forEach(function (item) {
        var args = userFunction.calls.argsFor(callIndex++);
        expect(args[0]).toBe(item);
        expect(args[1]).toBeAFunction();
      });
      done();
    });
  });

  it("does not process the next item until the current one is finished", function () {
    delayItemProcessing = true;
    Cucumber.Util.asyncForEach(items, userFunction, function() {});
    expect(userFunction).toHaveBeenCalledTimes(1);
    var args = userFunction.calls.mostRecent().args;
    expect(args[0]).toBe('a');
  });
});
