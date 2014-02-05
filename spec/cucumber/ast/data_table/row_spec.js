require('../../../support/spec_helper');

describe("Cucumber.Ast.Feature", function() {
  var Cucumber = requireLib('cucumber');

  var row, cells, uri, line;

  beforeEach(function() {
    cells = createSpy("cells");
    uri   = createSpy("uri");
    line  = createSpy("line");
    row   = Cucumber.Ast.DataTable.Row(cells, uri, line);
  });

  describe("raw()", function() {
    it("returns the cells", function() {
      expect(row.raw()).toBe(cells);
    });
  });
});
