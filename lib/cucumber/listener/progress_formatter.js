function ProgressFormatter(options) {
  var Cucumber = require('../../cucumber');

  if (!options)
    options = {};

  var colors = Cucumber.Util.Colors(options.useColors);

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

  var characters = {};
  characters[Cucumber.Status.AMBIGUOUS] = 'A';
  characters[Cucumber.Status.FAILED] = 'F';
  characters[Cucumber.Status.PASSED] = '.';
  characters[Cucumber.Status.PENDING] = 'P';
  characters[Cucumber.Status.SKIPPED] = '-';
  characters[Cucumber.Status.UNDEFINED] = 'U';

  self.handleStepResultEvent = function handleStepResult(event, callback) {
    var stepResult = event.getPayloadItem('stepResult');
    var status = stepResult.getStatus();
    var step = stepResult.getStep();
    if (!step.isHidden() || status === Cucumber.Status.FAILED) {
      var character = colors[status](characters[status]);
      self.log(character);
    }
    callback();
  };

  self.handleAfterFeaturesEvent = function handleAfterFeaturesEvent(event, callback) {
    var summaryLogs = summaryFormatter.getLogs();
    self.log('\n\n');
    self.log(summaryLogs);
    self.finish(callback);
  };

  return self;
}

module.exports = ProgressFormatter;
