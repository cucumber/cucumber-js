require('../../support/spec_helper');

describe("Cucumber.SupportCode.WorldConstructor", function() {
  var Cucumber = requireLib('cucumber');

  it("returns a default World constructor", function() {
    worldConstructor = Cucumber.SupportCode.WorldConstructor();
    expect(worldConstructor).toBeAFunction();
  });

  describe("default World constructor", function() {
    var callback;

    beforeEach(function() {
      worldConstructor = Cucumber.SupportCode.WorldConstructor();
      callback = createSpy("callback");
    });

    it("calls back", function() {
      var world = new worldConstructor(callback);
      expect(callback).toHaveBeenCalled();
    });
  });
});
