function Formatter(options) {
  var Cucumber = require('../../cucumber');

  if (!options)
    options = {};

  var logs = '';

  var self = Cucumber.Listener();

  self.log = function log(string) {
    logs += string;
    if (options.stream)
      options.stream.write(string);
    if (typeof(options.logToFunction) === 'function')
      options.logToFunction(string);
  };

  self.finish = function finish(callback) {
    if (options.stream && options.stream !== process.stdout)
      options.stream.end(callback);
    else
      callback();
  };

  self.getLogs = function getLogs() {
    return logs;
  };

  return self;
}

module.exports = Formatter;
