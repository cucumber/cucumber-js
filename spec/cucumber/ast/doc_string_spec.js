require('../../support/spec_helper');

describe("Cucumber.Ast.DocString", function() {
  var Cucumber = require('cucumber');
  var docString, string, line;

  beforeEach(function() {
    contentType = createSpy("content type");
    string      = createSpy("DocString string");
    line        = createSpy("DocString line number");
    docString   = Cucumber.Ast.DocString(contentType, string, line);
  });

  describe("getString()", function() {
    it("returns the string of the DocString", function() {
      expect(docString.getString()).toBe(string);
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
