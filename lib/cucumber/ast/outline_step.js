var OutlineStep = function(keyword, name, uri, line) {
  var Cucumber = require('../../cucumber');
  var self = Cucumber.Ast.Step(keyword, name, uri, line);

  self.setOriginalStep = function setOriginalStep(originalStep){
    self.originalStep = originalStep;
  };

  self.getOriginalStep = function getOriginalStep(originalStep){
    return self.originalStep;
  };

  self.isOutlineStep = function isOutlineStep(){
    return true;
  };

  return self;
};
module.exports = OutlineStep;
