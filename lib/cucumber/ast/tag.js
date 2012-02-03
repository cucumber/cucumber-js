var Tag = function(name, line) {
  var Cucumber = require('../../cucumber');

  var self = {
    getName: function getName() {
      return name;
    }
  };
  return self;
};
module.exports = Tag;