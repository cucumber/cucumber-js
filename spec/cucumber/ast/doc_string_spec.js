require('../../support/spec_helper');

describe("Cucumber.Ast.DocString", function() {
  var Cucumber = requireLib('cucumber');
  var docString, contents, uri, line;

  beforeEach(function() {
    contentType = createSpy("content type");
    contents    = createSpy("contents");
    uri         = createSpy("uri");
    line        = createSpy("line number");
    docString   = Cucumber.Ast.DocString(contentType, contents, uri, line);
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

  describe("getUri()", function() {
    it("returns the URI on which the background starts", function() {
      expect(docString.getUri()).toBe(uri);
    });
  });

  describe("getLine()", function() {
    it("returns the line on which the DocString starts", function() {
      expect(docString.getLine()).toBe(line);
    });
  });
});
