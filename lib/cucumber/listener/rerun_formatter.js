function RerunFormatter(options) {

	var Cucumber = require('../../cucumber');
  var path     = require('path');
	var self = Cucumber.Listener.Formatter(options);
	var statsJournal = Cucumber.Listener.StatsJournal();
	var failedScenarioLogBuffer = '';
  var parentHear = self.hear;

  self.hear = function hear(event, callback) {
    statsJournal.hear(event, function () {
      parentHear(event, callback);
    });
  };

  self.handleAfterScenarioEvent = function handleAfterScenarioEvent(event, callback) {
  	var isCurrentScenarioFailing = statsJournal.isCurrentScenarioFailing();

  	if (isCurrentScenarioFailing) {
      var failedScenario = event.getPayloadItem('scenario');
      var uri            = path.relative(process.cwd(), failedScenario.getUri());
      var line           = failedScenario.getLine();
  		failedScenarioLogBuffer += uri + ':' + line + ' ';
  	}
  	callback();
  };

  self.handleAfterFeaturesEvent = function handleAfterFeaturesEvent(event, callback) {
  	self.log(failedScenarioLogBuffer.trim());
  	callback();
  };

  return self;
}

module.exports = RerunFormatter;
