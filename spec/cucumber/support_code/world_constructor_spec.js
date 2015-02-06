require('../../support/spec_helper');

describe("Cucumber.SupportCode.WorldConstructor", function () {
  var Cucumber = requireLib('cucumber');
  var WorldConstructor;

  it("returns a default World constructor", function () {
    WorldConstructor = Cucumber.SupportCode.WorldConstructor();
    expect(WorldConstructor).toBeAFunction ();
  });

  describe("default World constructor", function () {
    var callback;

    beforeEach(function () {
      WorldConstructor = Cucumber.SupportCode.WorldConstructor();
      callback = createSpy("callback");
    });

    it("calls back", function () {
      new WorldConstructor(callback);
      expect(callback).toHaveBeenCalled();
    });
  });
});
