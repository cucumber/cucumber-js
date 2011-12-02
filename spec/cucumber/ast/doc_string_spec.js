require('../../support/spec_helper');

describe("Cucumber.Ast.DocString", function() {
  var Cucumber = requireLib('cucumber');
  var docString, contents, line;

  beforeEach(function() {
    contentType = createSpy("content type");
    contents    = createSpy("DocString contents");
    line        = createSpy("DocString line number");
    docString   = Cucumber.Ast.DocString(contentType, contents, line);
  });

  describe("getContents()", function() {
    it("returns the contents of the DocString", function() {
      expect(docString.getContents()).toBe(contents);
    });
  });

  describe("getContentType()", function() {
    it("returns the doc type of the DocString", function() {
      expect(docString.getContentType()).toBe(contentType);
    });
  });

  describe("getLine()", function() {
    it("returns the line on which the DocString starts", function() {
      expect(docString.getLine()).toBe(line);
    });
  });
});
