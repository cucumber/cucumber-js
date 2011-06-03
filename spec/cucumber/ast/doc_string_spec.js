require('../../support/spec_helper');

describe("Cucumber.Ast.DocString", function() {
  var Cucumber = require('cucumber');
  var docString, string, line;

  beforeEach(function() {
    string    = createSpy("DocString string");
    line      = createSpy("DocString line number");
    docString = Cucumber.Ast.DocString(string, line);
  });

  describe("getString()", function() {
    it("returns the string of the DocString", function() {
      expect(docString.getString()).toBe(string);
    });
  });
});
