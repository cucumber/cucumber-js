if (typeof define !== 'function') { var define = require('amdefine')(module); }
define([
  './listener/progress_formatter',
  './listener/pretty_formatter'
], function(ProgressFormatter, PrettyFormatter) {
var Listener               = {};
Listener.ProgressFormatter = ProgressFormatter;
Listener.PrettyFormatter   = PrettyFormatter;
return Listener;
});
