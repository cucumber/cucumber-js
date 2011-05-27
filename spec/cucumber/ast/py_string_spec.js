require('../../support/spec_helper');

describe("Cucumber.Ast.PyString", function() {
  var Cucumber = require('cucumber');
  var pyString, string, line;

  beforeEach(function() {
    string   = createSpy("PY string string");
    line     = createSpy("PY string line number");
    pyString = Cucumber.Ast.PyString(string, line);
  });
  
  describe("getString()", function() {
    it("returns the string of the PY string", function() {
      expect(pyString.getString()).toBe(string);
    });
  });
});
