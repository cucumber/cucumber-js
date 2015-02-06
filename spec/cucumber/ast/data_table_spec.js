require('../../support/spec_helper');

describe("Cucumber.Ast.DataTable", function () {
  var Cucumber = requireLib('cucumber');

  var dataTable;

  beforeEach(function () {
    dataTable = Cucumber.Ast.DataTable();
  });

  describe("attachRow() [getRows]", function () {
    var row;

    it("adds the row to the row collection", function () {
      dataTable.attachRow(row);
      var rows = dataTable.getRows();
      expect(rows.length()).toBe(1);
      expect(rows.getAtIndex(0)).toBe(row);
    });
  });

  describe("getContents()", function () {
    it("returns the data table itself", function () {
      expect(dataTable.getContents()).toBe(dataTable);
    });
  });

  describe("raw()", function () {
    var rowArray, rawRows;

    beforeEach(function () {
      rawRows  = [
        createSpy("raw row 1"),
        createSpy("raw row 2")
      ];
      rowArray = [
        createSpyWithStubs("row 1", {raw: rawRows[0]}),
        createSpyWithStubs("row 2", {raw: rawRows[1]})
      ];
      dataTable.attachRow(rowArray[0]);
      dataTable.attachRow(rowArray[1]);
    });

    it("returns the raw representations in an array", function () {
      expect(dataTable.raw()).toEqual(rawRows);
    });
  });

  describe("rows()", function () {
    var rawRows, rowArray;

    beforeEach(function () {
      rawRows = [
        createSpy("raw row 1"),
        createSpy("raw row 2")];
      rowArray = [
        createSpyWithStubs("row 1", {raw: rawRows[0]}),
        createSpyWithStubs("row 2", {raw: rawRows[1]})
      ];
      dataTable.attachRow(rowArray[0]);
      dataTable.attachRow(rowArray[1]);
    });

    it("gets the raw representation of the row without the header", function () {
      var actualRows = dataTable.rows();
      expect(rowArray[1].raw).toHaveBeenCalled();
      expect(rowArray[0].raw).not.toHaveBeenCalled();
      expect(actualRows).toEqual([rawRows[1]]);
    });
  });

  describe("getRows()", function () {
    var rowArray;

    beforeEach(function () {
      rowArray = [
        createSpyWithStubs("row 1"),
        createSpyWithStubs("row 2")
      ];
      dataTable.attachRow(rowArray[0]);
      dataTable.attachRow(rowArray[1]);
    });

    it("gets the raw representation of the rows, including the header", function () {
      var actualRows = dataTable.getRows();
      expect(actualRows.length()).toEqual(2);
      expect(actualRows.getAtIndex(0)).toEqual(rowArray[0]);
      expect(actualRows.getAtIndex(1)).toEqual(rowArray[1]);
    });

    it("returns a new row collection every time", function () {
      var actualRows1 = dataTable.getRows();
      expect(actualRows1.length()).toEqual(2);
      expect(actualRows1.getAtIndex(0)).toEqual(rowArray[0]);
      expect(actualRows1.getAtIndex(1)).toEqual(rowArray[1]);

      var actualRows2 = dataTable.getRows();
      expect(actualRows2.length()).toEqual(2);
      expect(actualRows2.getAtIndex(0)).toEqual(rowArray[0]);
      expect(actualRows2.getAtIndex(1)).toEqual(rowArray[1]);

      expect(actualRows2).toNotBe(actualRows1);
    });
  });

  describe("hashes", function () {
    var raw, rawHashDataTable, hashDataTable;

    beforeEach(function () {
      raw              = createSpy("raw data table");
      rawHashDataTable = createSpy("raw hash data table");
      hashDataTable    = createSpyWithStubs("hash data table", {raw: rawHashDataTable});
      spyOn(dataTable, 'raw').andReturn(raw);
      spyOn(Cucumber.Type, 'HashDataTable').andReturn(hashDataTable);
    });

    it("gets the raw representation of the data table", function () {
      dataTable.hashes();
      expect(dataTable.raw).toHaveBeenCalled();
    });

    it("creates a hash data table based on the raw representation", function () {
      dataTable.hashes();
      expect(Cucumber.Type.HashDataTable).toHaveBeenCalledWith(raw);
    });

    it("gets the raw representation of the hash data table", function () {
      dataTable.hashes();
      expect(hashDataTable.raw).toHaveBeenCalled();
    });

    it("returns the raw hash data table", function () {
      expect(dataTable.hashes()).toBe(rawHashDataTable);
    });
  });
});
