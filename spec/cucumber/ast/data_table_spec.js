require('../../support/spec_helper');

describe("Cucumber.Ast.DataTable", function () {
  var Cucumber = requireLib('cucumber');

  var dataTable;

  describe("table with headers", function () {
    beforeEach(function () {
      dataTable = Cucumber.Ast.DataTable({
        rows: [
          {
            cells: [
              {value: 'header 1'},
              {value: 'header 2'},
            ]
          }, {
            cells: [
              {value: 'row 1 col 1'},
              {value: 'row 1 col 2'},
            ]
          }, {
            cells: [
              {value: 'row 2 col 1'},
              {value: 'row 2 col 2'},
            ]
          }
        ]
      });
    });

    describe("rows", function () {
      it("returns a 2-D array without the header", function () {
        expect(dataTable.rows()).toEqual([
          ['row 1 col 1', 'row 1 col 2'],
          ['row 2 col 1', 'row 2 col 2']
        ]);
      });
    });

    describe("hashes", function () {
      it("returns an array of object where the keys are the headers", function () {
        expect(dataTable.hashes()).toEqual([
          {'header 1': 'row 1 col 1', 'header 2': 'row 1 col 2'},
          {'header 1': 'row 2 col 1', 'header 2': 'row 2 col 2'},
        ]);
      });
    });
  });

  describe("table without headers", function () {
    beforeEach(function () {
      dataTable = Cucumber.Ast.DataTable({
        rows: [
          {
            cells: [
              {value: 'row 1 col 1'},
              {value: 'row 1 col 2'},
            ]
          }, {
            cells: [
              {value: 'row 2 col 1'},
              {value: 'row 2 col 2'},
            ]
          }
        ]
      });
    });

    describe("raw", function () {
      it("returns a 2-D array", function () {
        expect(dataTable.raw()).toEqual([
          ['row 1 col 1', 'row 1 col 2'],
          ['row 2 col 1', 'row 2 col 2']
        ]);
      });
    });

    describe("rowsHash", function () {
      it("returns an object where the keys are the first column", function () {
        expect(dataTable.rowsHash()).toEqual({
          'row 1 col 1': 'row 1 col 2',
          'row 2 col 1': 'row 2 col 2',
        });
      });
    });
  });
});
