var PrettyFormatter = function(options) {
  var Cucumber = require('../../cucumber');

  var self             = Cucumber.Listener.Formatter(options);
  var summaryFormatter = Cucumber.Listener.SummaryFormatter({logToConsole: false});

  var parentHear = self.hear;
  self.hear = function hear(event, callback) {
    summaryFormatter.hear(event, function () {
      parentHear(event, callback);
    });
  };

  self.handleBeforeFeatureEvent = function handleBeforeFeatureEvent(event, callback) {
    var feature = event.getPayloadItem('feature');
    var source = feature.getKeyword() + ": " + feature.getName() + "\n\n";
    self.log(source);
    callback();
  };

  self.handleBeforeScenarioEvent = function handleBeforeScenarioEvent(event, callback) {
    var scenario = event.getPayloadItem('scenario');
    var source = scenario.getKeyword() + ": " + scenario.getName() + "\n";
    self.logIndented(source, 1);
    callback();
  };

  self.handleAfterScenarioEvent = function handleAfterScenarioEvent(event, callback) {
    self.log("\n");
    callback();
  };

  self.handleStepResultEvent = function handleStepResultEvent(event, callback) {
    var stepResult = event.getPayloadItem('stepResult');
    var step = stepResult.getStep();
    var source = step.getKeyword() + step.getName() + "\n";
    self.logIndented(source, 2);

    if (step.hasDataTable()) {
      var dataTable = step.getDataTable();
      self.logDataTable(dataTable);
    }

    if (step.hasDocString()) {
      var docString = step.getDocString();
      self.logDocString(docString);
    }

    stepResult.isFailed();
    if (stepResult.isFailed()) {
      var failure            = stepResult.getFailureException();
      var failureDescription = failure.stack || failure;
      self.logIndented(failureDescription + "\n", 3);
    }
    callback();
  };

  self.handleAfterFeaturesEvent = function handleAfterFeaturesEvent(event, callback) {
    var summaryLogs = summaryFormatter.getLogs();
    self.log("\n");
    self.log(summaryLogs);
    callback();
  };

  self.logDataTable = function logDataTable(dataTable) {
    var rows         = dataTable.raw();
    var columnWidths = self._determineColumnWidthsFromRows(rows);
    var rowCount     = rows.length;
    var columnCount  = columnWidths.length;

    for (var rowIndex = 0; rowIndex < rowCount; rowIndex++) {
      var cells = rows[rowIndex];
      var line = "|";
      for (var columnIndex = 0; columnIndex < columnCount; columnIndex++) {
        var cell        = cells[columnIndex];
        var columnWidth = columnWidths[columnIndex];
        line += " " + self._pad(cell, columnWidth) + " |"
      }
      line += "\n";
      self.logIndented(line, 3);
    }
  };

  self.logDocString = function logDocString(docString) {
    var contents = docString.getContents();
    self.logIndented('"""\n' + contents + '\n"""\n' , 3);
  };

  self.logIndented = function logIndented(text, level) {
    var indented = self.indent(text, level);
    self.log(indented);
  };

  self.indent = function indent(text, level) {
    var indented;
    text.split("\n").forEach(function(line) {
      var prefix = new Array(level + 1).join("  ");
      line = (prefix + line).replace(/\s+$/, '');
      indented = (typeof(indented) == 'undefined' ? line : indented + "\n" + line);
    });
    return indented;
  };

  self._determineColumnWidthsFromRows = function _determineColumnWidthsFromRows(rows) {
    var columnWidths = [];
    var currentColumn;

    rows.forEach(function (cells) {
      currentColumn = 0;
      cells.forEach(function (cell) {
        var currentColumnWidth = columnWidths[currentColumn];
        var currentCellWidth   = cell.length;
        if (typeof currentColumnWidth == "undefined" || currentColumnWidth < currentCellWidth)
          columnWidths[currentColumn] = currentCellWidth;
        currentColumn += 1;
      });
    });

    return columnWidths;
  };

  self._pad = function _pad(text, width) {
    var padded = "" + text;
    while (padded.length < width) {
      padded += " ";
    }
    return padded;
  };

  return self;
};
module.exports = PrettyFormatter;
