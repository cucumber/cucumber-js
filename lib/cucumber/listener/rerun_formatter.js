function RerunFormatter(options) {
  var Cucumber = require('../../cucumber');
  var path = require('path');
  var _ = require('lodash');

  var self = Cucumber.Listener.Formatter(options);
  var failures = {};


  self.handleScenarioResultEvent = function handleScenarioResultEvent(scenarioResult) {
    if (scenarioResult.getStatus() === Cucumber.Status.FAILED) {
      var scenario = scenarioResult.getScenario();
      var uri = path.relative(process.cwd(), scenario.getUri());
      var line = scenario.getLine();
      if (!failures[uri]) {
        failures[uri] = [];
      }
      failures[uri].push(line);
    }
  };

  self.handleAfterFeaturesEvent = function handleAfterFeaturesEvent(features, callback) {
    var text = _.map(failures, function(lines, uri) {
      return uri + ':' + lines.join(':');
    }).join('\n');
    self.log(text);
    self.finish(callback);
  };

  return self;
}

module.exports = RerunFormatter;
