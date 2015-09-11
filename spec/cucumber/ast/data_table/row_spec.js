require('../../../support/spec_helper');

describe("Cucumber.Ast.Feature", function () {
  var Cucumber = requireLib('cucumber');

  var row, cells, uri, line;

  beforeEach(function () {
    cells = ['a', 'b', '1'];
    uri   = createSpy("uri");
    line  = createSpy("line");
    row   = Cucumber.Ast.DataTable.Row(cells, uri, line);
  });

  describe("raw()", function () {
    it("returns a copy of the cells", function () {
      expect(row.raw()).not.toBe(cells);
      expect(row.raw()).toEqual(['a', 'b', '1']);
    });
  });

  describe("getLine()", function () {
    it("returns the line number", function () {
      expect(row.getLine()).toBe(line);
    });
  });
});
