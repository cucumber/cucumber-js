function RerunFormatter(options) {

	var Cucumber = require('../../cucumber');
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
  	var scenario = event.getPayloadItem('scenario');
  	var uri = scenario.getUri().replace(process.cwd(),'').slice(1);
  	var line = scenario.getLine();

  	if (isCurrentScenarioFailing ) {
      if (self.isUriHasLineNumber(uri)) {
        failedScenarioLogBuffer += uri + ' ';
      } else {
    		failedScenarioLogBuffer += uri + ':' + line + ' ';
      }
  	}
  	callback();
  };

  self.handleAfterFeaturesEvent = function handleAfterFeaturesEvent(event, callback) {
  	self.log(failedScenarioLogBuffer.trim());
  	callback();
  };

  self.isUriHasLineNumber = function isUriHasLineNumber(uri) {
    if (uri.indexOf(':') > -1) {
      return true;
    } else {
      return false;
    }
  }

  return self;
}

module.exports = RerunFormatter;