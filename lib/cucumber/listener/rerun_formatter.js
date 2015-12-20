function RerunFormatter(options) {
  var Cucumber = require('../../cucumber');
  var path = require('path');

  var self = Cucumber.Listener.Formatter(options);
  var failures = {};


  self.handleScenarioResultEvent = function handleScenarioResultEvent(event, callback) {
    var scenarioResult = event.getPayloadItem('scenarioResult');

    if (scenarioResult.getStatus() === Cucumber.Status.FAILED) {
      var scenario = scenarioResult.getScenario();
      var uri = path.relative(process.cwd(), scenario.getUri());
      var line = scenario.getLine();
      if (!failures[uri]) {
        failures[uri] = [];
      }
      failures[uri].push(line);
    }
    callback();
  };

  self.handleAfterFeaturesEvent = function handleAfterFeaturesEvent(event, callback) {
    for (var uri in failures) {
      self.log(uri + ':' + failures[uri].join(':') + '\n');
    }
    self.finish(callback);
  };

  return self;
}

module.exports = RerunFormatter;
