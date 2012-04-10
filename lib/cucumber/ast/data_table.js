if (typeof define !== 'function') { var define = require('amdefine')(module); }
define([
    '../type',
    './data_table/row'
], function(Type, Row) {
var DataTable  = function() {
  var rows = Type.Collection();

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
      var hashDataTable    = Type.HashDataTable(raw);
      var rawHashDataTable = hashDataTable.raw();
      return rawHashDataTable;
    }
  };
  return self;
};

DataTable.Row  = Row;
return DataTable;
});
