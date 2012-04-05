if (typeof define !== 'function') { var define = require('amdefine')(module); }
define([
  'require',
  '../../cucumber'
], function(require) {
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

  return self;
};
return Formatter;
});
