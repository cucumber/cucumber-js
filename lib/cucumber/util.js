if (typeof define !== 'function') { var define = require('amdefine')(module); }
define([
    './util/arguments',
    './util/reg_exp',
    './util/string',
    './util/array'
], function(Arguments, RegExp, String) {
var Util       = {};
Util.Arguments = Arguments;
Util.RegExp    = RegExp;
Util.String    = String;
Util.Array     = Array;
return Util;
});
