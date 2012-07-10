var Formatter = function (options) {
  var Cucumber = require('../../cucumber');

  if (!options)
    options = {};
  if (options['logToConsole'] == undefined)
    options['logToConsole'] = true;

  var logs = "";

  var self = Cucumber.Listener();

  self.log = function log(string) {
    logs += string;
    if (options['logToConsole'])
      process.stdout.write(string);
    if (typeof(options['logToFunction']) == 'function')
      options['logToFunction'](string);
  };

  self.getLogs = function getLogs() {
    return logs;
  };

  self.colorize = function colorize(text, stepResult) {
    var ansi_color = require('ansi-color');
    if (stepResult.isFailed()) {
      return ansi_color.set(text, Formatter.FAILED_COLOR);
    } else if (stepResult.isSkipped()) {
      return ansi_color.set(text, Formatter.SKIPPED_COLOR);
    } else if (stepResult.isPending()) {
      return ansi_color.set(text, Formatter.PENDING_COLOR);
    } else if (stepResult.isUndefined()) {
      return ansi_color.set(text, Formatter.UNDEFINED_COLOR);
    } else if (stepResult.isSuccessful()) {
      return ansi_color.set(text, Formatter.SUCCESSFUL_COLOR);
    }

    return text;
  };

  return self;
};
Formatter.FAILED_COLOR     = "red";
Formatter.SUCCESSFUL_COLOR = "green";
Formatter.PENDING_COLOR    = "yellow";
Formatter.UNDEFINED_COLOR  = "yellow";
Formatter.SKIPPED_COLOR    = "cyan";
module.exports = Formatter;
