function PrettyFormatter(options) {
  var Cucumber         = require('../../cucumber');
  var path             = require('path');

  var colors           = Cucumber.Util.Colors;
  var self             = Cucumber.Listener.Formatter(options);
  var summaryFormatter = Cucumber.Listener.SummaryFormatter({
    coffeeScriptSnippets: options.coffeeScriptSnippets,
    snippets: options.snippets,
    logToConsole: false
  });
  var currentMaxStepLength = 0;

  var parentHear = self.hear;
  self.hear = function hear(event, callback) {
    summaryFormatter.hear(event, function () {
      parentHear(event, callback);
    });
  };

  self.handleBeforeFeatureEvent = function handleBeforeFeatureEvent(event, callback) {
    var feature = event.getPayloadItem('feature');
    var source = '';

    var tagsSource = self.formatTags(feature.getTags());
    if (tagsSource) {
      source = tagsSource + '\n'
    }

    var identifier = feature.getKeyword() + ': ' + feature.getName();
    source += identifier;

    var description = feature.getDescription()
    if (description) {
      source += '\n' + self.indent(description, 1);
    }

    self.log(source);
    self.log('\n\n');
    callback();
  };

  self.handleBeforeScenarioEvent = function handleBeforeScenarioEvent(event, callback) {
    var scenario = event.getPayloadItem('scenario');
    var source = '';

    var tagsSource = self.formatTags(scenario.getOwnTags());
    if (tagsSource) {
      source = tagsSource + '\n'
    }

    var identifier = scenario.getKeyword() + ': ' + scenario.getName();
    if (options.showSource) {
      var lineLengths = [identifier.length, self.determineMaxStepLengthForElement(scenario)];
      if (scenario.getBackground() !== undefined) {
        lineLengths.push(self.determineMaxStepLengthForElement(scenario.getBackground()));
      }
      currentMaxStepLength = Math.max.apply(null, lineLengths)

      identifier = self._pad(identifier, currentMaxStepLength + 3) +
                   colors.comment('# ' + path.relative(process.cwd(), scenario.getUri()) + ':' + scenario.getLine());
    }
    source += identifier

    self.logIndented(source, 1);
    self.log('\n');
    callback();
  };

  self.handleAfterScenarioEvent = function handleAfterScenarioEvent(event, callback) {
    self.log('\n');
    callback();
  };

  self.applyColor = function (stepResult, source) {
    if (stepResult.isFailed()) source = colors.failed(source);
    else if (stepResult.isPending()) source = colors.pending(source);
    else if (stepResult.isSkipped()) source = colors.skipped(source);
    else if (stepResult.isSuccessful()) source = colors.passed(source);
    else if (stepResult.isUndefined()) source = colors.undefined(source);
    return source;
  };

  self.handleStepResultEvent = function handleStepResultEvent(event, callback) {
    var stepResult = event.getPayloadItem('stepResult');
    var step = stepResult.getStep();
    if (!step.isHidden() || stepResult.isFailed()) {
      self.logStepResult(step, stepResult);
    }
    callback();
  };

  self.formatTags = function formatTags(tags) {
    if (tags.length === 0) {
      return '';
    }

    var tagNames = tags.map(function (tag) {
      return tag.getName();
    });

    return colors.tag(tagNames.join(' '));
  }

  self.logStepResult = function logStepResult(step, stepResult) {
    var source = step.getKeyword() + (step.getName() || '');
    source = self._pad(source, self._getCurrentMaxStepLength() + 1);
    source = self.applyColor(stepResult, source);

    if (options.showSource && step.hasUri()) {
      source += colors.comment('# ' + path.relative(process.cwd(), step.getUri()) + ':' + step.getLine());
    }

    source += '\n';
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
      self.logIndented(failureDescription + '\n', 3);
    }
  };

  self.handleAfterFeaturesEvent = function handleAfterFeaturesEvent(event, callback) {
    var summaryLogs = summaryFormatter.getLogs();
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
      var line = '|';
      for (var columnIndex = 0; columnIndex < columnCount; columnIndex++) {
        var cell        = cells[columnIndex];
        var columnWidth = columnWidths[columnIndex];
        line += ' ' + self.applyColor(stepResult, self._pad(cell, columnWidth)) + ' |';
      }
      line += '\n';
      self.logIndented(line, 3);
    }
  };

  self.logDocString = function logDocString(stepResult, docString) {
    var contents = '"""\n' + docString.getContents() + '\n"""\n';
    contents = self.applyColor(stepResult, contents);
    self.logIndented(contents, 3);
  };

  self.logIndented = function logIndented(text, level) {
    var indented = self.indent(text, level);
    self.log(indented);
  };

  self.indent = function indent(text, level) {
    var indented;
    text.split('\n').forEach(function (line) {
      var prefix = new Array(level + 1).join('  ');
      line = (prefix + line).replace(/\s+$/, '');
      indented = (typeof(indented) === 'undefined' ? line : indented + '\n' + line);
    });
    return indented;
  };

  self.determineMaxStepLengthForElement = function determineMaxStepLengthForElement(element) {
    var max = 0;
    element.getSteps().forEach(function (step) {
      var stepLength = step.getKeyword().length + step.getName().length;
      if (stepLength > max) max = stepLength;
    });
    return max;
  };

  self._determineColumnWidthsFromRows = function _determineColumnWidthsFromRows(rows) {
    var columnWidths = [];
    var currentColumn;

    rows.forEach(function (cells) {
      currentColumn = 0;
      cells.forEach(function (cell) {
        var currentColumnWidth = columnWidths[currentColumn];
        var currentCellWidth   = cell.length;
        if (typeof currentColumnWidth === 'undefined' || currentColumnWidth < currentCellWidth)
          columnWidths[currentColumn] = currentCellWidth;
        currentColumn += 1;
      });
    });

    return columnWidths;
  };

  self._getCurrentMaxStepLength = function _getCurrentMaxStepLength() {
    return currentMaxStepLength;
  };

  self._pad = function _pad(text, width) {
    var padded = '' + text;
    while (padded.length < width) {
      padded += ' ';
    }
    return padded;
  };

  return self;
}

module.exports = PrettyFormatter;
