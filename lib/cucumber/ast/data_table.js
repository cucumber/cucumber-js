function DataTable(data) {
  var Cucumber = require('../../cucumber');
  var _ = require('lodash');

  var rawTable = data.rows.map(function (row) {
    return row.cells.map(function (cell) {
      return cell.value;
    });
  });

  var self = {
    getType: function getType() {
      return 'DataTable';
    },

    rows: function rows() {
      var copy = self.raw();
      copy.shift();
      return copy;
    },

    rowsHash: function rowsHash() {
      var rows = self.raw();
      var everyRowHasTwoColumns = rows.every(function (row) {
        return row.length === 2;
      });

      if (!everyRowHasTwoColumns) {
        throw new Error('rowsHash was called on a data table with more than two columns');
      }

      return _.fromPairs(rows);
    },

    raw: function raw() {
      return rawTable.slice(0);
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

module.exports = DataTable;
