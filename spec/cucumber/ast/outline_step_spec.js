require('../../support/spec_helper');

describe("Cucumber.Ast.OutlineStep", function() {
  var Cucumber = requireLib('cucumber');
  var step, keyword, name, uri, line;

  beforeEach(function() {
    name         = createSpy("name");
    keyword      = createSpy("keyword");
    uri          = createSpy("uri");
    line         = createSpy("line");
    step         = Cucumber.Ast.OutlineStep(keyword, name, uri, line);
  });

  describe("IsOutlineStep()", function() {
    it("returns true for an outline step", function() {
      expect(step.isOutlineStep()).toBe(true);
    });
  });
});
