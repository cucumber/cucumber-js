require('../../support/spec_helper');

describe("Cucumber.Ast.Tag", function() {
  var Cucumber = requireLib('cucumber');

  var tag, name, line;

  beforeEach(function() {
    name = createSpy("tag name");
    line = createSpy("tag line");
    tag  = Cucumber.Ast.Tag(name, line);
  });

  describe("getName()", function() {
    it("returns the name of the tag", function() {
      expect(tag.getName()).toBe(name);
    });
  });
});