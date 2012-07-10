if (typeof define !== 'function') { var define = require('amdefine')(module); }
define([
  './util/arguments',
  './util/exception',
  './util/reg_exp',
  './util/string',
  './util/array'
], function(Arguments, Exception, RegExp, String, Array) {
var Util       = {};
Util.Arguments = Arguments;
Util.Exception = Exception;
Util.RegExp    = RegExp;
Util.String    = String;
Util.Array     = Array;
return Util;
});
