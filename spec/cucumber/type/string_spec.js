require('../../support/spec_helper');

describe("Cucumber.Type.String", function() {
  var Cucumber = requireLib('cucumber');
  var string;

  it("is an alias of the global String constructor", function() {
    expect(Cucumber.Type.String).toBe(String);
  });

  describe("trim()", function() {
    it("removes leading and trailing whitespaces", function() {
      var original = "   cucumber   ";
      var trimmed  = original.trim();
      expect(trimmed).toBe("cucumber");
    });

    it("removes leading and trailing newlines", function() {
      var original = "\ncucumber\n";
      var trimmed  = original.trim();
      expect(trimmed).toBe("cucumber");
    });

    it("removes leading and trailing tabs", function() {
      var original = "\tcucumber\t";
      var trimmed  = original.trim();
      expect(trimmed).toBe("cucumber");
    });

    it("removes all leading and trailing white characters", function() {
      var original = " \t   \n  cucumber  \t \n\n\t  ";
      var trimmed  = original.trim();
      expect(trimmed).toBe("cucumber");
    });
  });
});
