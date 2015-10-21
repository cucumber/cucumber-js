function SummaryFormatter(options) {
  var Cucumber = require('../../cucumber');
  var Duration = require('duration');
  var path     = require('path');
  var _        = require('underscore');

  var failedScenarioLogBuffer = '';
  var undefinedStepLogBuffer  = '';
  var failedStepResults       = Cucumber.Type.Collection();
  var statsJournal            = Cucumber.Listener.StatsJournal();
  var colors                  = Cucumber.Util.Colors(options.useColors);
  var statusReportOrder = [
    Cucumber.Status.FAILED,
    Cucumber.Status.UNDEFINED,
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
    if (status === Cucumber.Status.UNDEFINED) {
      self.handleUndefinedStepResult(stepResult);
    } else if (status === Cucumber.Status.FAILED) {
      self.handleFailedStepResult(stepResult);
    }
    callback();
  };

  self.handleUndefinedStepResult = function handleUndefinedStepResult(stepResult) {
    var step = stepResult.getStep();
    self.storeUndefinedStepResult(step);
  };

  self.handleFailedStepResult = function handleFailedStepResult(stepResult) {
    self.storeFailedStepResult(stepResult);
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

  self.storeFailedStepResult = function storeFailedStepResult(failedStepResult) {
    failedStepResults.add(failedStepResult);
  };

  self.storeFailedScenario = function storeFailedScenario(failedScenario) {
    var name        = failedScenario.getName();
    var relativeUri = path.relative(process.cwd(), failedScenario.getUri());
    var line        = failedScenario.getLine();
    self.appendStringToFailedScenarioLogBuffer(relativeUri + ':' + line + ' # Scenario: ' + name);
  };

  self.storeUndefinedStepResult = function storeUndefinedStepResult(step) {
    var snippetBuilder = Cucumber.SupportCode.StepDefinitionSnippetBuilder(step, options.snippetSyntax);
    var snippet        = snippetBuilder.buildSnippet();
    self.appendStringToUndefinedStepLogBuffer(snippet);
  };

  self.appendStringToFailedScenarioLogBuffer = function appendStringToFailedScenarioLogBuffer(string) {
    failedScenarioLogBuffer += string + '\n';
  };

  self.appendStringToUndefinedStepLogBuffer = function appendStringToUndefinedStepLogBuffer(string) {
    if (undefinedStepLogBuffer.indexOf(string) === -1)
      undefinedStepLogBuffer += string + '\n';
  };

  self.getFailedScenarioLogBuffer = function getFailedScenarioLogBuffer() {
    return failedScenarioLogBuffer;
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
  };

  self.logFailedStepResults = function logFailedStepResults() {
    self.log('(::) failed steps (::)\n\n');
    failedStepResults.forEach(function (stepResult) {
      self.logFailedStepResult(stepResult);
    });
  };

  self.logFailedScenarios = function logFailedScenarios() {
    self.log('Failing scenarios:\n');
    var failedScenarios = self.getFailedScenarioLogBuffer();
    self.log(failedScenarios);
    self.log('\n');
  };

  self.logFailedStepResult = function logFailedStepResult(stepResult) {
    var failureMessage = stepResult.getFailureException();
    if (failureMessage)
      self.log(failureMessage.stack || failureMessage);
    self.log('\n\n');
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
