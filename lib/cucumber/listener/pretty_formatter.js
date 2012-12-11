var PrettyFormatter = function(options) {
  var Cucumber         = require('../../cucumber');

  var color            = Cucumber.Util.ConsoleColor;
  var self             = Cucumber.Listener.Formatter(options);
  var summaryFormatter = Cucumber.Listener.SummaryFormatter({coffee: options.coffee, logToConsole: false});
  var currentMaxStepLength = 0;

  if (!options)
    options = {};
  if (options['logToConsole'] == undefined)
    options['logToConsole'] = true;

  var parentHear = self.hear;
  self.hear = function hear(event, callback) {
    summaryFormatter.hear(event, function () {
      parentHear(event, callback);
    });
  };

  self.handleBeforeFeatureEvent = function handleBeforeFeatureEvent(event, callback) {
    var feature = event.getPayloadItem('feature');
    var source = feature.getKeyword() + ": " + feature.getName() + "\n";
    self.log(source);
    self.logIndented(feature.getDescription() + "\n\n", 1);
    callback();
  };

  self.handleBeforeScenarioEvent = function handleBeforeScenarioEvent(event, callback) {
    var scenario = event.getPayloadItem('scenario');
    var source = scenario.getKeyword() + ": " + scenario.getName();
    currentMaxStepLength = scenario.getMaxStepLength() > scenario.getBackground().getMaxStepLength() ? scenario.getMaxStepLength() : scenario.getBackground().getMaxStepLength();
    source = self._pad(source, currentMaxStepLength + 3);

    if(options['logToConsole'])
      uri = color.format('comment', "# " + scenario.getUri().replace(process.cwd(),'').slice(1) + ":" + scenario.getLine());
    else
      uri = scenario.getUri() + ":" + scenario.getLine();

    source += uri + "\n";

    self.logIndented(source, 1);
    callback();
  };

  self.handleAfterScenarioEvent = function handleAfterScenarioEvent(event, callback) {
    self.log("\n");
    callback();
  };

  self.applyColor = function (stepResult, source) {
    if(stepResult.isFailed()) source = color.format('failed', source);
    else if (stepResult.isPending()) source = color.format('pending',source);
    else if (stepResult.isSkipped()) source = color.format('skipped',source);
    else if (stepResult.isSuccessful()) source = color.format('passed',source);
    else if (stepResult.isUndefined()) source = color.format('undefined',source);
    return source;
  };

  self.handleStepResultEvent = function handleStepResultEvent(event, callback) {
    var stepResult = event.getPayloadItem('stepResult');
    var step = stepResult.getStep();

    var uri = "";

    if(options['logToConsole'])
      uri = color.format('comment', "# " + step.getUri().replace(process.cwd(),'').slice(1) + ":" + step.getLine());
    else
      uri = step.getUri() + ":" + step.getLine();

    var source = self.applyColor(stepResult, step.getKeyword() + step.getName());

    source = self._pad(source, currentMaxStepLength + 10);

    source += uri + "\n";
    self.logIndented(source, 2);

    if (step.hasDataTable()) {
      var dataTable = step.getDataTable();
      self.logDataTable(stepResult, dataTable);
    }

    if (step.hasDocString()) {
      var docString = step.getDocString();
      self.logDocString(stepResult, docString);
    }

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

  self.logDataTable = function logDataTable(stepResult, dataTable) {
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
      self.logIndented(self.applyColor(stepResult, line), 3);
    }
  };

  self.logDocString = function logDocString(stepResult, docString) {
    // To handle weird ansi code behaviour
    if(stepResult.isFailed()) color.setFormat('failed');
    else if (stepResult.isPending()) color.setFormat('pending');
    else if (stepResult.isSkipped()) color.setFormat('skipped');
    else if (stepResult.isSuccessful()) color.setFormat('passed');
    else if (stepResult.isUndefined()) color.setFormat('undefined');

    var contents = docString.getContents();
    self.logIndented('"""\n' + contents + '\n"""\n', 3);
    color.resetFormat();

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
