function DataTable() {
  var Cucumber = require('../../cucumber');

  var _ = require('underscore');

  var rowsCollection = Cucumber.Type.Collection();

  var self = {
    attachRow: function attachRow(row) {
      rowsCollection.add(row);
    },

    getContents: function getContents() {
      return self;
    },

    getRows: function getRows() {
      var newRows = Cucumber.Type.Collection();
      rowsCollection.syncForEach(function (row) {
        newRows.add(row);
      });
      return newRows;
    },

    rows: function rows() {
      var rawRows = [];
      rowsCollection.syncForEach(function (row, index) {
        if (index > 0) {
          rawRows.push(row.raw());
        }
      });
      return rawRows;
    },

    rowsHash: function rowsHash() {
      var rows = self.raw();
      var everyRowHasTwoColumns = rows.every(function (row) {
        return row.length === 2;
      });

      if (!everyRowHasTwoColumns) {
        throw new Error('rowsHash was called on a data table with more than two columns');
      }

      return _.object(rows);
    },

    raw: function raw() {
      var rawRows = [];
      rowsCollection.syncForEach(function (row) {
        rawRows.push(row.raw());
      });
      return rawRows;
    },

    hashes: function hashes() {
      var raw              = self.raw();
      var hashDataTable    = Cucumber.Type.HashDataTable(raw);
      var rawHashDataTable = hashDataTable.raw();
      return rawHashDataTable;
    }
  };
  return self;
}

DataTable.Row  = require('./data_table/row');

module.exports = DataTable;
