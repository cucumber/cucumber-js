var Hook = function(code) {
  var Cucumber = require('../../cucumber');

  var self = {
    invoke: function(world, callback) {
      code.call(world, callback);
    }
  };
  return self;
};
module.exports = Hook;
