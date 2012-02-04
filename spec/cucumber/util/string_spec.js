require('../../support/spec_helper');

describe("Cucumber.Util.String", function() {
  var Cucumber = requireLib('cucumber');

  describe("count()", function() {
    var hayStack, needle;

    it("returns 0 when the needle is not found", function() {
      var count = Cucumber.Util.String.count("cucumber", "a");
      expect(count).toBe(0);
    });

    it("returns 1 when the needle was found once", function() {
      var count = Cucumber.Util.String.count("cucumber", "b");
      expect(count).toBe(1);
    });

    it("returns 2 when the needle was found twice", function() {
      var count = Cucumber.Util.String.count("cucumber", "c");
      expect(count).toBe(2);
    });
  });
});
