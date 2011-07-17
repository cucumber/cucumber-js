var StepResult = function(status) {
  var self = {
    isSuccessful: function isSuccessful() {
      return !!status;
    }
  };
  return self;
};
module.exports = StepResult;