function SummaryFormatter(options) {
  var Cucumber = require('../../cucumber');
  var Duration = require('duration');
  var Table    = require('cli-table');
  var path     = require('path');
  var _        = require('lodash');

  var ambiguousStepLogBuffer = '';
  var failedScenarioLogBuffer = '';
  var failedStepResultLogBuffer = '';
  var undefinedStepLogBuffer = '';
  var statsJournal            = Cucumber.Listener.StatsJournal();
  var colors                  = Cucumber.Util.Colors(options.useColors);
  var statusReportOrder = [
    Cucumber.Status.FAILED,
    Cucumber.Status.UNDEFINED,
    Cucumber.Status.AMBIGUOUS,
    Cucumber.Status.PENDING,
    Cucumber.Status.SKIPPED,
    Cucumber.Status.PASSED
  ];

  var self = Cucumber.Listener.Formatter(options);

  var parentHear = self.hear;
  self.hear = function hear(event, callback) {
    statsJournal.hear(event, function () {
      parentHear(event, callback);
    });
  };

  self.handleStepResultEvent = function handleStepResult(event, callback) {
    var stepResult = event.getPayloadItem('stepResult');
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
    }
    callback();
  };

  self.handleAfterScenarioEvent = function handleAfterScenarioEvent(event, callback) {
    if (statsJournal.isCurrentScenarioFailing()) {
      var scenario = event.getPayloadItem('scenario');
      self.storeFailedScenario(scenario);
    }
    callback();
  };

  self.handleAfterFeaturesEvent = function handleAfterFeaturesEvent(event, callback) {
    self.logSummary();
    self.finish(callback);
  };

  self.storeAmbiguousStepResult = function storeAmbiguousStepResult(stepResult) {
    var step = stepResult.getStep();
    var stepDefinitions = stepResult.getAmbiguousStepDefinitions();

    var table = new Table({
      chars: {
        'bottom': '', 'bottom-left': '', 'bottom-mid': '', 'bottom-right': '',
        'left': '', 'left-mid': '',
        'mid': '', 'mid-mid': '',
        'middle': ' ',
        'right': '', 'right-mid': '',
        'top': '' , 'top-left': '', 'top-mid': '', 'top-right': ''
      },
      style: {
        'padding-left': 0, 'padding-right': 0
      }
    });
    table.push.apply(table, stepDefinitions.map(function (stepDefinition) {
      var pattern = stepDefinition.getPattern();
      var relativeUri = path.relative(process.cwd(), stepDefinition.getUri());
      var line = stepDefinition.getLine();
      return [colors.ambiguous(pattern), colors.comment('# ' + relativeUri + ':' + line)];
    }));
    var message = colors.ambiguous('"' + step.getName() + '" matches:') + '\n' + table.toString();
    self.appendStringToAmbiguousStepLogBuffer(message);
  };

  self.storeFailedStepResult = function storeFailedStepResult(failedStepResult) {
    var failureException = failedStepResult.getFailureException();
    var failureMessage = failureException.stack || failureException;
    self.appendStringToFailedStepResultLogBuffer(failureMessage);
  };

  self.storeFailedScenario = function storeFailedScenario(failedScenario) {
    var name        = failedScenario.getName();
    var relativeUri = path.relative(process.cwd(), failedScenario.getUri());
    var line        = failedScenario.getLine();
    self.appendStringToFailedScenarioLogBuffer(relativeUri + ':' + line + ' # Scenario: ' + name);
  };

  self.storeUndefinedStepResult = function storeUndefinedStepResult(stepResult) {
    var step = stepResult.getStep();
    var snippetBuilder = Cucumber.SupportCode.StepDefinitionSnippetBuilder(step, options.snippetSyntax);
    var snippet        = snippetBuilder.buildSnippet();
    self.appendStringToUndefinedStepLogBuffer(snippet);
  };

  self.appendStringToAmbiguousStepLogBuffer = function appendStringToAmbiguousStepLogBuffer(string) {
    if (ambiguousStepLogBuffer.indexOf(string) === -1)
      ambiguousStepLogBuffer += string + '\n\n';
  };

  self.appendStringToFailedScenarioLogBuffer = function appendStringToFailedScenarioLogBuffer(string) {
    failedScenarioLogBuffer += string + '\n';
  };

  self.appendStringToFailedStepResultLogBuffer = function appendStringToFailedScenarioLogBuffer(string) {
    failedStepResultLogBuffer += string + '\n\n';
  };

  self.appendStringToUndefinedStepLogBuffer = function appendStringToUndefinedStepLogBuffer(string) {
    if (undefinedStepLogBuffer.indexOf(string) === -1)
      undefinedStepLogBuffer += string + '\n';
  };

  self.getFailedScenarioLogBuffer = function getFailedScenarioLogBuffer() {
    return failedScenarioLogBuffer;
  };

  self.getFailedStepResultLogBuffer = function getFailedStepResultLogBuffer() {
    return failedStepResultLogBuffer;
  };

  self.getUndefinedStepLogBuffer = function getUndefinedStepLogBuffer() {
    return undefinedStepLogBuffer;
  };

  self.logSummary = function logSummary() {
    if (failedScenarioLogBuffer) {
      if (!options.hideFailedStepResults) {
        self.logFailedStepResults();
      }
      self.logFailedScenarios();
    }
    self.logScenariosSummary();
    self.logStepsSummary();
    self.logDuration();
    if (undefinedStepLogBuffer)
      self.logUndefinedStepSnippets();
    if (ambiguousStepLogBuffer)
      self.logAmbiguousSteps();
  };

  self.logAmbiguousSteps = function logAmbiguousSteps() {
    self.log(colors.ambiguous('\nThe following steps have multiple matching definitions:\n\n'));
    self.log(colors.ambiguous(ambiguousStepLogBuffer));
  };

  self.logFailedStepResults = function logFailedStepResults() {
    self.log('(::) failed steps (::)\n\n');
    var failedStepResults = self.getFailedStepResultLogBuffer();
    self.log(failedStepResults);
  };

  self.logFailedScenarios = function logFailedScenarios() {
    self.log('Failing scenarios:\n');
    var failedScenarios = self.getFailedScenarioLogBuffer();
    self.log(failedScenarios);
    self.log('\n');
  };

  self.logScenariosSummary = function logScenariosSummary() {
    self.logCountSummary('scenario', statsJournal.getScenarioCounts());
  };

  self.logStepsSummary = function logStepsSummary() {
    self.logCountSummary('step', statsJournal.getStepCounts());
  };

  self.logDuration = function logDuration() {
    var nanoseconds = statsJournal.getDuration();
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
