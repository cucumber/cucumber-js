import Tag from "./tag";

describe("Tag", function() {
  describe("build", function() {
    it("is equivalent to invoking the constructor", function() {
      const gherkinData = { location: {} };
      const built = Tag.build(gherkinData);
      const constructed = new Tag(gherkinData);
      expect(built).to.eql(constructed);
    });
  });

  describe("instance", function() {
    beforeEach(function() {
      this.tag = new Tag({
        location: { line: 1 },
        name: "@tagA"
      });
    });

    describe("get line", function() {
      it("returns the line", function() {
        expect(this.tag.line).to.eql(1);
      });
    });

    describe("get name", function() {
      it("returns the name", function() {
        expect(this.tag.name).to.eql("@tagA");
      });
    });
  });
});
