if (typeof define !== 'function') { var define = require('amdefine')(module); }
define([], function() {
var Tag = function(name, uri, line) {

  var self = {
    getName: function getName() {
      return name;
    },

    getUri: function getUri() {
      return uri;
    },

    getLine: function getLine() {
      return line;
    }
  };
  return self;
};
return Tag;
});
