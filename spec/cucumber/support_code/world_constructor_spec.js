require('../../support/spec_helper');

describe("Cucumber.SupportCode.WorldConstructor", function() {
  var Cucumber = requireLib('cucumber');

  it("returns a function", function() {
    worldConstructor = Cucumber.SupportCode.WorldConstructor();
    expect(worldConstructor).toBeAFunction();
  });
});
