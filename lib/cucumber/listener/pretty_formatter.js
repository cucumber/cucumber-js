function PrettyFormatter(options) {
  var Cucumber         = require('../../cucumber');
  var figures          = require('figures');

  var colors           = Cucumber.Util.Colors(options.useColors);
  var self             = Cucumber.Listener.Formatter(options);
  var summaryFormatter = Cucumber.Listener.SummaryFormatter({
    snippetSyntax: options.snippetSyntax,
    useColors: options.useColors
  });

  var parentHear = self.hear;
  self.hear = function hear(event, defaultTimeout, callback) {
    summaryFormatter.hear(event, defaultTimeout, function () {
      parentHear(event, defaultTimeout, callback);
    });
  };

  var characters = {};
  characters[Cucumber.Status.AMBIGUOUS] = figures.cross;
  characters[Cucumber.Status.FAILED] = figures.cross;
  characters[Cucumber.Status.PASSED] = figures.tick;
  characters[Cucumber.Status.PENDING] = '?';
  characters[Cucumber.Status.SKIPPED] = '-';
  characters[Cucumber.Status.UNDEFINED] = '?';

  self.handleBeforeFeatureEvent = function handleBeforeFeatureEvent(feature) {
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
  };

  self.handleBeforeScenarioEvent = function handleBeforeScenarioEvent(scenario) {
    var source = '';

    var tagsSource = self.formatTags(scenario.getTags());
    if (tagsSource) {
      source = tagsSource + '\n';
    }

    var identifier = scenario.getKeyword() + ': ' + scenario.getName();
    source += identifier;

    self.logIndented(source, 1);
    self.log('\n');
  };

  self.handleAfterScenarioEvent = function handleAfterScenarioEvent() {
    self.log('\n');
  };

  self.applyColor = function applyColor (stepResult, source) {
    var status = stepResult.getStatus();
    return colors[status](source);
  };

  self.getSymbol = function getSymbol (stepResult) {
    var status = stepResult.getStatus();
    return characters[status];
  };

  self.handleStepResultEvent = function handleStepResultEvent(stepResult) {
    var step = stepResult.getStep();
    if (!step.isHidden()) {
      self.logStepResult(step, stepResult);
    }
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
    var symbol = self.getSymbol(stepResult);
    var identifier = symbol + ' ' + step.getKeyword() + (step.getName() || '');
    identifier = self.applyColor(stepResult, identifier);
    self.logIndented(identifier, 1);
    self.log('\n');

    step.getArguments().forEach(function (arg) {
      var str;
      switch(arg.getType()) {
        case 'DataTable':
          str = self.formatDataTable(stepResult, arg);
          break;
        case 'DocString':
          str = self.formatDocString(stepResult, arg);
          break;
        default:
          throw new Error('Unknown argument type: ' + arg.getType());
      }
      self.logIndented(str, 3);
    });
  };

  self.handleAfterFeaturesEvent = function handleAfterFeaturesEvent(features, callback) {
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
    var contents = '"""\n' + docString.getContent() + '\n"""';
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
