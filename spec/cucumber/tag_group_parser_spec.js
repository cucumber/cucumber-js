require('../support/spec_helper');

describe("Cucumber.TagGroupParser", function() {
  var Cucumber = requireLib('cucumber');

  describe("parse()", function() {
    it("splits two tags based on the separator", function() {
      var tagGroupParser = Cucumber.TagGroupParser("@foo,@bar");
      var parsed         = tagGroupParser.parse();
      expect(parsed).toEqual(["@foo", "@bar"]);
    });

    it("splits three tags based on the separator", function() {
      var tagGroupParser = Cucumber.TagGroupParser("@foo,@bar,@baz");
      var parsed         = tagGroupParser.parse();
      expect(parsed).toEqual(["@foo", "@bar", "@baz"]);
    });

    it("splits negative tags based on the separator", function() {
      var tagGroupParser = Cucumber.TagGroupParser("@foo,~@bar,@baz");
      var parsed         = tagGroupParser.parse();
      expect(parsed).toEqual(["@foo", "~@bar", "@baz"]);
    });

    it("removes leading and trailing whitespaces", function() {
      var tagGroupParser = Cucumber.TagGroupParser("\t  @foo, ~@bar ,\n @baz ");
      var parsed         = tagGroupParser.parse();
      expect(parsed).toEqual(["@foo", "~@bar", "@baz"]);
    });
  });
});
