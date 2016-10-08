require('../../support/spec_helper');

describe("Cucumber.Util.Colors", function () {
  var Cucumber = requireLib('cucumber');
  var colors = require('colors');
  colors.enabled = true;

  describe("failed()", function () {
    var RED = "red".red;

    it("enables colors by default", function () {
      expect(Cucumber.Util.Colors().failed("red")).toBe(RED);
    });

    it("enables colors explicitly", function () {
      expect(Cucumber.Util.Colors(true).failed("red")).toBe(RED);
    });

    it("disables colors explicitly", function () {
      expect(Cucumber.Util.Colors(false).failed("red")).toBe("red");
    });
  });
});
