function SummaryFormatter(options) {
  var Cucumber = require('../../cucumber');
  var Duration = require('duration');
  var Table    = require('cli-table');
  var path     = require('path');
  var _        = require('lodash');

  var failures = [];
  var warnings = [];
  var colors = Cucumber.Util.Colors(options.useColors);
  var statusReportOrder = [
    Cucumber.Status.FAILED,
    Cucumber.Status.AMBIGUOUS,
    Cucumber.Status.UNDEFINED,
    Cucumber.Status.PENDING,
    Cucumber.Status.SKIPPED,
    Cucumber.Status.PASSED
  ];

  function indent(text, level) {
    var indented;
    text.split('\n').forEach(function (line) {
      var prefix = new Array(level + 1).join(' ');
      line = (prefix + line).replace(/\s+$/, '');
      indented = (typeof(indented) === 'undefined' ? line : indented + '\n' + line);
    });
    return indented;
  }

  var self = Cucumber.Listener.Formatter(options);

  self.handleStepResultEvent = function handleStepResult(stepResult) {
    var status = stepResult.getStatus();
    switch (status) {
      case Cucumber.Status.AMBIGUOUS:
        self.storeAmbiguousStepResult(stepResult);
        break;
      case Cucumber.Status.FAILED:
        self.storeFailedStepResult(stepResult);
        break;
      case Cucumber.Status.UNDEFINED:
        self.storeUndefinedStepResult(stepResult);
        break;
      case Cucumber.Status.PENDING:
        self.storePendingStepResult(stepResult);
        break;
    }
  };

  self.handleFeaturesResultEvent = function handleFeaturesResultEvent(featuresResult, callback) {
    self.logSummary(featuresResult);
    self.finish(callback);
  };

  self.storeAmbiguousStepResult = function storeAmbiguousStepResult(stepResult) {
    var stepDefinitions = stepResult.getAmbiguousStepDefinitions();

    var table = new Table({
      chars: {
        'bottom': '', 'bottom-left': '', 'bottom-mid': '', 'bottom-right': '',
        'left': '', 'left-mid': '',
        'mid': '', 'mid-mid': '',
        'middle': ' - ',
        'right': '', 'right-mid': '',
        'top': '' , 'top-left': '', 'top-mid': '', 'top-right': ''
      },
      style: {
        border: [], 'padding-left': 0, 'padding-right': 0
      }
    });
    table.push.apply(table, stepDefinitions.map(function (stepDefinition) {
      var pattern = stepDefinition.getPattern().toString();
      var relativeUri = path.relative(process.cwd(), stepDefinition.getUri());
      var line = stepDefinition.getLine();
      return [pattern, relativeUri + ':' + line];
    }));
    failures.push({
      stepResult: stepResult,
      message: 'Multiple step definitions match:' + '\n' + indent(table.toString(), 2)
    });
  };

  self.storeFailedStepResult = function storeFailedStepResult(stepResult) {
    var failureException = stepResult.getFailureException();
    failures.push({
      stepResult: stepResult,
      message: failureException.stack || failureException
    });
  };

  self.storeUndefinedStepResult = function storeUndefinedStepResult(stepResult) {
    var step = stepResult.getStep();
    var snippetBuilder = Cucumber.SupportCode.StepDefinitionSnippetBuilder(step, options.snippetSyntax);
    var snippet = snippetBuilder.buildSnippet();
    warnings.push({
      stepResult: stepResult,
      message: 'Undefined. Implement with the following snippet:' + '\n\n' + indent(snippet, 2)
    });
  };

  self.storePendingStepResult = function storePendingStepResult(stepResult) {
    var message = 'Pending';
    var pendingReason = stepResult.getPendingReason();
    if (pendingReason) {
      message += ': ' + pendingReason;
    }
    warnings.push({
      stepResult: stepResult,
      message: message
    });
  };

  self.logSummary = function logSummary(featuresResult) {
    if (failures.length > 0) {
      self.logFailures();
    }

    if (warnings.length > 0) {
      self.logWarnings();
    }

    self.logScenariosSummary(featuresResult);
    self.logStepsSummary(featuresResult);
    self.logDuration(featuresResult);
  };

  self.logFailures = function logFailures() {
    self.log('Failures:\n\n');
    failures.forEach(function(failure, index) {
      self.logIssue(index + 1, failure.stepResult, failure.message);
    });
  };

  self.logWarnings = function logWarnings() {
    self.log('Warnings:\n\n');
    warnings.forEach(function(warning, index) {
      self.logIssue(index + 1, warning.stepResult, warning.message);
    });
  };

  self.logIssue = function logIssue(number, stepResult, message) {
    var lines = [];
    var prefix = number + ') ';
    var step = stepResult.getStep();
    var scenario = step.getScenario();
    var colorFn = colors[stepResult.getStatus()];

    if(scenario) {
      var scenarioLocation = path.relative(process.cwd(), scenario.getUri()) + ':' + scenario.getLine();
      var scenarioLine = 'Scenario: ' + colors.bold(scenario.getName()) + ' - ' + colors.location(scenarioLocation);
      lines.push(prefix + scenarioLine);
    } else {
      lines.push(prefix + 'Background:');
    }

    var stepLine = 'Step: ' + colors.bold(step.getKeyword() + (step.getName() || ''));
    if (step.hasUri()) {
      var stepLocation = path.relative(process.cwd(), step.getUri()) + ':' + step.getLine();
      stepLine += ' - ' + colors.location(stepLocation);
    }
    lines.push(indent(stepLine, prefix.length));

    var stepDefintion = stepResult.getStepDefinition();
    if (stepDefintion) {
      var stepDefintionLocation = path.relative(process.cwd(), stepDefintion.getUri()) + ':' + stepDefintion.getLine();
      var stepDefinitionLine = 'Step Definition: ' + colors.location(stepDefintionLocation);
      lines.push(indent(stepDefinitionLine, prefix.length));
    }

    var header = lines.join('\n');
    var messageText = indent('Message: ', prefix.length) + '\n' + indent(colorFn(message), prefix.length + 2);

    self.log(header + '\n' + messageText + '\n\n');
  };

  self.logScenariosSummary = function logScenariosSummary(featuresResult) {
    self.logCountSummary('scenario', featuresResult.getScenarioCounts());
  };

  self.logStepsSummary = function logStepsSummary(featuresResult) {
    self.logCountSummary('step', featuresResult.getStepCounts());
  };

  self.logDuration = function logDuration(featuresResult) {
    var nanoseconds = featuresResult.getDuration();
    var milliseconds = Math.ceil(nanoseconds / 1e6);
    var start = new Date(0);
    var end = new Date(milliseconds);
    var duration = new Duration(start, end);

    self.log(duration.minutes + 'm' +
             duration.toString('%S') + '.' +
             duration.toString('%L') + 's' + '\n');
  };

  self.logUndefinedStepSnippets = function logUndefinedStepSnippets() {
    var undefinedStepLogBuffer = self.getUndefinedStepLogBuffer();
    if (options.snippets) {
      self.log(colors.pending('\nYou can implement step definitions for undefined steps with these snippets:\n\n'));
      self.log(colors.pending(undefinedStepLogBuffer));
    }
  };

  self.logCountSummary = function logCountSummary (type, counts) {
    var total = _.reduce(counts, function(memo, value){
      return memo + value;
    });

    self.log(total + ' ' + type + (total !== 1 ? 's' : ''));
    if (total > 0) {
      var details = [];
      statusReportOrder.forEach(function (status) {
        if (counts[status] > 0)
          details.push(colors[status](counts[status] + ' ' + status));
      });
      self.log(' (' + details.join(', ') + ')');
    }
    self.log('\n');
  };

  return self;
}

module.exports = SummaryFormatter;
