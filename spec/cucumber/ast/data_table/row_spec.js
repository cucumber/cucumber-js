require('../../../support/spec_helper');

describe("Cucumber.Ast.Feature", function() {
  var Cucumber = requireLib('cucumber');

  var row, cells, line;

  beforeEach(function() {
    cells = createSpy("cells");
    line  = createSpy("line");
    row   = Cucumber.Ast.DataTable.Row(cells);
  });

  describe("raw()", function() {
    it("returns the cells", function() {
      expect(row.raw()).toBe(cells);
    });
  });
});
