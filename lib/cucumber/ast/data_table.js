var DataTable  = function() {
  var Cucumber = require('../../cucumber');

  var rowsCollection = Cucumber.Type.Collection();

  var self = {
    attachRow: function attachRow(row) {
      rowsCollection.add(row);
    },

    getContents: function getContents() {
      return self;
    },

    getRows: function getRows(){
        var newRows = Cucumber.Type.Collection();
        rowsCollection.syncForEach(function(row){
            newRows.add(row);
        });
        return newRows;
    },

    rows: function rows() {
      rawRows = [];
      rowsCollection.syncForEach(function(row, index) {
        if (index > 0) {
          rawRows.push(row.raw());
        }
      });
      return rawRows;
    },
      
    raw: function raw(){
      rawRows = [];
      rowsCollection.syncForEach(function(row) {
          rawRows.push(row.raw());      
      });
      return rawRows;
    },

    getRowForKey: function(key, aliases)
    {
        var positionOfPrimaryKey = 0;
        var matchingRow = null;

        if(key === null)
            return null;

        if (rowsCollection.length <= 1)
            return null;

        rowsCollection.syncForEach(function (row)
        {
            var rawRow = row.raw();
            var cellValue = aliases ? aliases[rawRow[positionOfPrimaryKey]] : rawRow[positionOfPrimaryKey];

            if(cellValue === null || cellValue === undefined)
                return;

            if (cellValue.trim() === key.trim())
            {
                matchingRow = rawRow;
            }
        });

        return matchingRow;
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
