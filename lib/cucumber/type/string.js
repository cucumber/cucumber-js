if (typeof define !== 'function') { var define = require('amdefine')(module); }
define([], function() {
if(!String.prototype.trim) {
  String.prototype.trim = function () {
    return this.replace(/^\s+|\s+$/g,'');
  };
}
return String;
});
