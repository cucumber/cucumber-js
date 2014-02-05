require('../../support/spec_helper');

describe("Cucumber.Ast.Tag", function() {
  var Cucumber = requireLib('cucumber');

  var tag, name, uri, line;

  beforeEach(function() {
    name = createSpy("name");
    uri  = createSpy("uri");
    line = createSpy("line");
    tag  = Cucumber.Ast.Tag(name, uri, line);
  });

  describe("getName()", function() {
    it("returns the name of the tag", function() {
      expect(tag.getName()).toBe(name);
    });
  });

  describe("getUri()", function() {
    it("returns the URI on which the background starts", function() {
      expect(tag.getUri()).toBe(uri);
    });
  });

  describe("getLine()", function() {
    it("returns the line on which the DocString starts", function() {
      expect(tag.getLine()).toBe(line);
    });
  });
});
