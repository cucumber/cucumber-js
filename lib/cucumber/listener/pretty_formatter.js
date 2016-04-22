function PrettyFormatter(options) {
  var Cucumber         = require('../../cucumber');

  var colors           = Cucumber.Util.Colors(options.useColors);
  var self             = Cucumber.Listener.Formatter(options);
  var summaryFormatter = Cucumber.Listener.SummaryFormatter({
    snippetSyntax: options.snippetSyntax,
    useColors: options.useColors
  });

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
      source = tagsSource + '\n';
    }

    var identifier = feature.getKeyword() + ': ' + feature.getName();
    source += identifier;

    var description = feature.getDescription();
    if (description) {
      source += '\n\n' + self.indent(description, 1);
    }

    source += '\n\n';

    self.log(source);
    callback();
  };

  self.handleBeforeScenarioEvent = function handleBeforeScenarioEvent(event, callback) {
    var scenario = event.getPayloadItem('scenario');
    var source = '';

    var tagsSource = self.formatTags(scenario.getOwnTags());
    if (tagsSource) {
      source = tagsSource + '\n';
    }

    var identifier = scenario.getKeyword() + ': ' + scenario.getName();
    source += identifier;

    self.logIndented(source, 1);
    self.log('\n');
    callback();
  };

  self.handleAfterScenarioEvent = function handleAfterScenarioEvent(event, callback) {
    self.log('\n');
    callback();
  };

  self.applyColor = function applyColor (stepResult, source) {
    var status = stepResult.getStatus();
    return colors[status](source);
  };

  self.handleStepResultEvent = function handleStepResultEvent(event, callback) {
    var stepResult = event.getPayloadItem('stepResult');
    var step = stepResult.getStep();
    if (!step.isHidden()) {
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
  };

  self.logStepResult = function logStepResult(step, stepResult) {
    var identifier = step.getKeyword() + (step.getName() || '');

    identifier = self.applyColor(stepResult, identifier);
    self.logIndented(identifier, 2);
    self.log('\n');

    if (step.hasDataTable()) {
      var dataTable = step.getDataTable();
      var dataTableSource = self.formatDataTable(stepResult, dataTable);
      self.logIndented(dataTableSource, 3);
    }

    if (step.hasDocString()) {
      var docString = step.getDocString();
      var docStringSource = self.formatDocString(stepResult, docString);
      self.logIndented(docStringSource, 3);
    }
  };

  self.handleAfterFeaturesEvent = function handleAfterFeaturesEvent(event, callback) {
    var summaryLogs = summaryFormatter.getLogs();
    self.log(summaryLogs);
    self.finish(callback);
  };

  self.formatDataTable = function formatDataTable(stepResult, dataTable) {
    var rows = dataTable.raw().map(function (row) {
      return row.map(function (cell) {
        return cell
          .replace(/\\/g, '\\\\')
          .replace(/\n/g, '\\n');
      });
    });
    var columnWidths = self._determineColumnWidthsFromRows(rows);
    var source = '';
    rows.forEach(function (row) {
      source += '|';
      row.forEach(function (cell, columnIndex) {
        var columnWidth = columnWidths[columnIndex];
        source += ' ' + self.applyColor(stepResult, self._pad(cell, columnWidth)) + ' |';
      });
      source += '\n';
    });
    return source;
  };

  self.formatDocString = function formatDocString(stepResult, docString) {
    var contents = '"""\n' + docString.getContents() + '\n"""';
    return self.applyColor(stepResult, contents) + '\n';
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
