var DataTable  = function() {
  var Cucumber = require('../../cucumber');

  var rows = Cucumber.Type.Collection();

  var self = {
    attachRow: function attachRow(row) {
      rows.add(row);
    },

    getContents: function getContents() {
      return self;
    },

    getRows: function getRows(){
        var newRows = Cucumber.Type.Collection();
        rows.syncForEach(function(row){
            newRows.add(row);
        });
        return newRows;
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
      var hashDataTable    = Cucumber.Type.HashDataTable(raw);
      var rawHashDataTable = hashDataTable.raw();
      return rawHashDataTable;
    }
  };
  return self;
};
DataTable.Row  = require('./data_table/row');
module.exports = DataTable;
