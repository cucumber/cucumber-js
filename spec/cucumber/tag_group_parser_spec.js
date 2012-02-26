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

  describe(".getTagGroupsFromStrings()", function() {
    var tagGroupStrings, getTagGroupsFromStringsFunc;

    beforeEach(function() {
      getTagGroupsFromStringsFunc = Cucumber.TagGroupParser.getTagGroupsFromStrings;
      tagGroupStrings             = [createSpy("first tag group string"), createSpy("second tag group string"), createSpy("third tag group string")];
      tagGroups                   = [createSpy("first tag group"), createSpy("second tag group"), createSpy("third tag group")];
      tagGroupParsers             = [createSpyWithStubs("first tag group parser", {parse: tagGroups[0]}),
                                     createSpyWithStubs("second tag group parser", {parse: tagGroups[1]}),
                                     createSpyWithStubs("third tag group parser", {parse: tagGroups[2]})];
      spyOn(Cucumber, 'TagGroupParser').andReturnSeveral(tagGroupParsers);
    });

    it("creates a TagGroupParser instance for each tag group string", function() {
      getTagGroupsFromStringsFunc(tagGroupStrings);
      tagGroupStrings.forEach(function(tagGroupString) {
        expect(Cucumber.TagGroupParser).toHaveBeenCalledWith(tagGroupString);
      });
    });

    it("gets the parsed tag groups", function() {
      getTagGroupsFromStringsFunc(tagGroupStrings);
      tagGroupParsers.forEach(function(tagGroupParser) {
        expect(tagGroupParser.parse).toHaveBeenCalled();
      });
    });

    it("returns the tag groups", function() {
      expect(getTagGroupsFromStringsFunc(tagGroupStrings)).toEqual(tagGroups);
    });
  });
});
