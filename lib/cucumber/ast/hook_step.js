function HookStep(keyword) {
  var Cucumber = require('../../cucumber');
  var self = Cucumber.Ast.Step({});
  var hook;

  self.getKeyword = function getKeyword() {
    return keyword;
  };

  self.isHidden = function isHidden() {
    return true;
  };

  self.hasUri = function hasUri() {
    return false;
  };

  self.getHook = function getHook() {
    return hook;
  };

  self.setHook = function setHook(newHook) {
    hook = newHook;
  };

  return self;
}

module.exports = HookStep;
