var PrettyFormatter = function(options) {
  var Cucumber = require('../../cucumber');

  var self       = Cucumber.Listener.Formatter(options);
  var summarizer = Cucumber.Listener.Summarizer();

  var parentHear = self.hear;
  self.hear = function hear(event, callback) {
    summarizer.hear(event, function () {
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

  self.handleStepResultEvent = function handleStepResult(event, callback) {
    var stepResult = event.getPayloadItem('stepResult');
    var step = stepResult.getStep();
    var source = step.getKeyword() + step.getName() + "\n";
    self.logIndented(source, 2);

    stepResult.isFailed();
    if (stepResult.isFailed()) {
      var failure            = stepResult.getFailureException();
      var failureDescription = failure.stack || failure;
      self.logIndented(failureDescription + "\n", 3);
    }
    callback();
  };

  self.handleAfterFeaturesEvent = function handleAfterFeaturesEvent(event, callback) {
    var summaryLogs = summarizer.getLogs();
    self.log(summaryLogs);
    callback();
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

  return self;
};
module.exports = PrettyFormatter;
