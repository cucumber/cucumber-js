function SummaryFormatter(options) {
  var Cucumber = require('../../cucumber');
  var path     = require('path');


  var failedScenarioLogBuffer = '';
  var undefinedStepLogBuffer  = '';
  var failedStepResults       = Cucumber.Type.Collection();
  var statsJournal            = Cucumber.Listener.StatsJournal();
  var colors                  = Cucumber.Util.Colors;

  var self = Cucumber.Listener.Formatter(options);

  var parentHear = self.hear;
  self.hear = function hear(event, callback) {
    statsJournal.hear(event, function () {
      parentHear(event, callback);
    });
  };

  self.handleStepResultEvent = function handleStepResult(event, callback) {
    var stepResult = event.getPayloadItem('stepResult');
    if (stepResult.isUndefined()) {
      self.handleUndefinedStepResult(stepResult);
    } else if (stepResult.isFailed()) {
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
    callback();
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
    var snippetBuilder = Cucumber.SupportCode.StepDefinitionSnippetBuilder(step, self.getStepDefinitionSyntax());
    var snippet        = snippetBuilder.buildSnippet();
    self.appendStringToUndefinedStepLogBuffer(snippet);
  };

  self.getStepDefinitionSyntax = function getStepDefinitionSyntax() {
    var syntax = options.coffeeScriptSnippets ? 'CoffeeScript' : 'JavaScript';
    return new Cucumber.SupportCode.StepDefinitionSnippetBuilderSyntax[syntax]();
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
    if (statsJournal.witnessedAnyFailedStep())
      self.logFailedStepResults();
    self.logScenariosSummary();
    self.logStepsSummary();
    if (statsJournal.witnessedAnyUndefinedStep())
      self.logUndefinedStepSnippets();
  };

  self.logFailedStepResults = function logFailedStepResults() {
    self.log('(::) failed steps (::)\n\n');
    failedStepResults.syncForEach(function (stepResult) {
      self.logFailedStepResult(stepResult);
    });
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
    var scenarioCount          = statsJournal.getScenarioCount();
    var passedScenarioCount    = statsJournal.getPassedScenarioCount();
    var undefinedScenarioCount = statsJournal.getUndefinedScenarioCount();
    var pendingScenarioCount   = statsJournal.getPendingScenarioCount();
    var failedScenarioCount    = statsJournal.getFailedScenarioCount();
    var skippedScenarioCount   = statsJournal.getSkippedScenarioCount();
    var details                = [];

    self.log(scenarioCount + ' scenario' + (scenarioCount !== 1 ? 's' : ''));
    if (scenarioCount > 0 ) {
      if (failedScenarioCount > 0)
        details.push(colors.failed(failedScenarioCount + ' failed'));
      if (undefinedScenarioCount > 0)
        details.push(colors.undefined(undefinedScenarioCount + ' undefined'));
      if (pendingScenarioCount > 0)
        details.push(colors.pending(pendingScenarioCount + ' pending'));
      if (skippedScenarioCount > 0)
        details.push(colors.skipped(skippedScenarioCount + ' skipped'));
      if (passedScenarioCount > 0)
        details.push(colors.passed(passedScenarioCount + ' passed'));
      self.log(' (' + details.join(', ') + ')');
    }
    self.log('\n');
  };

  self.logStepsSummary = function logStepsSummary() {
    var stepCount          = statsJournal.getStepCount();
    var passedStepCount    = statsJournal.getPassedStepCount();
    var undefinedStepCount = statsJournal.getUndefinedStepCount();
    var skippedStepCount   = statsJournal.getSkippedStepCount();
    var pendingStepCount   = statsJournal.getPendingStepCount();
    var failedStepCount    = statsJournal.getFailedStepCount();
    var details            = [];

    self.log(stepCount + ' step' + (stepCount !== 1 ? 's' : ''));
    if (stepCount > 0) {
      if (failedStepCount > 0)
        details.push(colors.failed(failedStepCount + ' failed'));
      if (undefinedStepCount > 0)
        details.push(colors.undefined(undefinedStepCount + ' undefined'));
      if (pendingStepCount > 0)
        details.push(colors.pending(pendingStepCount + ' pending'));
      if (skippedStepCount > 0)
        details.push(colors.skipped(skippedStepCount + ' skipped'));
      if (passedStepCount > 0)
        details.push(colors.passed(passedStepCount + ' passed'));
      self.log(' (' + details.join(', ') + ')');
    }
    self.log('\n');
  };

  self.logUndefinedStepSnippets = function logUndefinedStepSnippets() {
    var undefinedStepLogBuffer = self.getUndefinedStepLogBuffer();
    if (options.snippets) {
      self.log(colors.pending('\nYou can implement step definitions for undefined steps with these snippets:\n\n'));
      self.log(colors.pending(undefinedStepLogBuffer));
    }
  };

  return self;
}

module.exports = SummaryFormatter;
