require('../../support/spec_helper');

describe("Cucumber.Ast.DataTable", function() {
  var Cucumber = requireLib('cucumber');

  var dataTable, rows;

  beforeEach(function() {
    rows = Cucumber.Type.Collection();
    spyOn(Cucumber.Type, 'Collection').andReturn(rows);
    dataTable = Cucumber.Ast.DataTable();
  });

  describe("constructor", function() {
    it("creates a new collection to store rows", function() {
      expect(Cucumber.Type.Collection).toHaveBeenCalledWith();
    });
  });

  describe("attachRow()", function() {
    var row;

    beforeEach(function() {
      spyOnStub(rows, 'add');
    });

    it("adds the row to the row collection", function() {
      dataTable.attachRow(row);
      expect(rows.add).toHaveBeenCalledWith(row);
    });
  });

  describe("getContents()", function() {
    it("returns the data table itself", function() {
      expect(dataTable.getContents()).toBe(dataTable);
    });
  });

  describe("raw()", function() {
    var rowArray;

    beforeEach(function() {
      rawRows  = [
        createSpy("raw row 1"),
        createSpy("raw row 2")
      ];
      rowArray = [
        createSpyWithStubs("row 1", {raw: rawRows[0]}),
        createSpyWithStubs("row 2", {raw: rawRows[1]})
      ];
      rows.add(rowArray[0]);
      rows.add(rowArray[1]);
    });

    it("gets the raw representation of the row", function() {
      dataTable.raw();
      expect(rowArray[0].raw).toHaveBeenCalled();
      expect(rowArray[1].raw).toHaveBeenCalled();
    });

    it("returns the raw representations in an array", function() {
      expect(dataTable.raw()).toEqual(rawRows);
    });
  });

  describe("rows()", function() {
    var rowArray;
    beforeEach(function() {
      rawRows = [
        createSpy("raw row 1"),
        createSpy("raw row 2")];
      rowArray = [
        createSpyWithStubs("row 1", {raw: rawRows[0]}),
        createSpyWithStubs("row 2", {raw: rawRows[1]})
      ];
      rows.add(rowArray[0]);
      rows.add(rowArray[1]);
    });

    it("gets the raw representation of the row without the header", function() {
      dataTable.rows();
      expect(rowArray[1].raw).toHaveBeenCalled();
      expect(rowArray[0].raw).not.toHaveBeenCalled();
    });
  });


  describe("hashes", function() {
    var raw, hashDataTable;

    beforeEach(function() {
      raw              = createSpy("raw data table");
      rawHashDataTable = createSpy("raw hash data table");
      hashDataTable    = createSpyWithStubs("hash data table", {raw: rawHashDataTable});
      spyOn(dataTable, 'raw').andReturn(raw);
      spyOn(Cucumber.Type, 'HashDataTable').andReturn(hashDataTable);
    });

    it("gets the raw representation of the data table", function() {
      dataTable.hashes();
      expect(dataTable.raw).toHaveBeenCalled();
    });

    it("creates a hash data table based on the raw representation", function() {
      dataTable.hashes();
      expect(Cucumber.Type.HashDataTable).toHaveBeenCalledWith(raw);
    });

    it("gets the raw representation of the hash data table", function() {
      dataTable.hashes();
      expect(hashDataTable.raw).toHaveBeenCalled();
    });

    it("returns the raw hash data table", function() {
      expect(dataTable.hashes()).toBe(rawHashDataTable);
    });
  });
});
