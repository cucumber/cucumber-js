var DocString = function(string, line) {
  var self = {
    getString: function getString() {
      return string;
    }
  };
  return self;
};
module.exports = DocString;