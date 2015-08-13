require('../../support/spec_helper');

describe("Cucumber.Ast.Examples", function () {
  var Cucumber = requireLib('cucumber');

  var examples,
      keyword,
      name,
      description,
      line,
      dataTable;

  beforeEach(function () {
    keyword     = createSpy("examples keyword");
    name        = createSpy("examples name");
    description = createSpy("examples description");
    line        = createSpy("starting examples line number");
    dataTable   = createSpy("examples data table");

    examples = Cucumber.Ast.Examples(keyword,name,description,line);
  });

  describe("getKeyword()", function () {
    it("returns the keyword of the examples", function () {
      expect(examples.getKeyword()).toBe(keyword);
    });
  });

  describe("getName()", function () {
    it("returns the name of the examples", function () {
      expect(examples.getName()).toBe(name);
    });
  });

  describe("getDescription()", function () {
    it("returns the description of the examples", function () {
      expect(examples.getDescription()).toBe(description);
    });
  });

  describe("getLine()", function () {
    it("returns the line number on which the examples lies", function () {
      expect(examples.getLine()).toBe(line);
    });
  });

  describe("attachDataTable() [getDataTable()]", function () {
    beforeEach(function () {
      examples.attachDataTable(dataTable);
    });

    it("returns the data table of the examples", function () {
      expect(examples.getDataTable()).toBe(dataTable);
    });
  });

  describe("ensureDataTableIsAttached() [getDataTable()]", function () {
    beforeEach(function () {
      examples.ensureDataTableIsAttached();
    });

    it("returns the data table of the examples", function () {
      expect(examples.getDataTable()).toBeDefined();
    });
  });

  describe("attachDataTableRow [getDataTable()]", function () {
    var rawRow, row, rawDataTable;

    beforeEach(function () {
      rawRow = createSpy("raw row");
      row = createSpyWithStubs("row", {raw: rawRow});
      examples.attachDataTableRow(row);
    });

    it("should have an attached data table with a single row", function () {
      rawDataTable = examples.getDataTable().raw();
      expect(rawDataTable.length).toBe(1);
      expect(rawDataTable[0]).toBe(rawRow);
    });
  });

  describe("hasDataTable()", function () {
    it("returns false when the examples has no attached data table", function () {
      expect(examples.hasDataTable()).toBe(false);
    });
  });
});
