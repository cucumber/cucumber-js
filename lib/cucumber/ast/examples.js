var Examples = function (keyword, name, description, line) {
  var Cucumber = require('../../cucumber');
  var dataTable;

  var self = {
    getKeyword: function getKeyword() {
      return keyword;
    },

    getName: function getName() {
      return name;
    },

    getDescription: function getDescription() {
      return description;
    },

    getLine: function getLine() {
      return line;
    },

    getDataTable: function getDataTable() {
      return dataTable;
    },

    hasDataTable: function hasDataTable() {
      return !!dataTable;
    },

    attachDataTable: function attachDataTable(_dataTable) {
      dataTable = _dataTable;
    },

    attachDataTableRow: function attachDataTableRow(row) {
      self.ensureDataTableIsAttached();
      var dataTable = self.getDataTable();
      dataTable.attachRow(row);
    },

    ensureDataTableIsAttached: function ensureDataTableIsAttached() {
      var dataTable = self.getDataTable();
      if (!dataTable) {
        dataTable = Cucumber.Ast.DataTable();
        self.attachDataTable(dataTable);
      }
    }
  };

  return self;
};
module.exports = Examples;
