var Hook = function(type, code) {
  var Cucumber = require('../../cucumber');

  var self = {
    invoke: function(world, callback) {
      code.apply(world, [callback]);
    }
  };
  return self;
};
module.exports = Hook;
