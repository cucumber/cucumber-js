if (typeof define !== 'function') { var define = require('amdefine')(module); }
define([
    '../type/collection',
    '../type/hash_data_table',
    './data_table/row'
], function(Collection, HashDataTable, Row) {
var DataTable  = function() {
  var rows = Collection();

  var self = {
    attachRow: function attachRow(row) {
      rows.add(row);
    },

    getContents: function getContents() {
      return self;
    },

    raw: function raw() {
      rawRows = [];
      rows.syncForEach(function(row) {
        var rawRow = row.raw();
        rawRows.push(rawRow);
      });
      return rawRows;
    },

    hashes: function hashes() {
      var raw              = self.raw();
      var hashDataTable    = HashDataTable(raw);
      var rawHashDataTable = hashDataTable.raw();
      return rawHashDataTable;
    }
  };
  return self;
};

DataTable.Row  = Row;
return DataTable;
});
