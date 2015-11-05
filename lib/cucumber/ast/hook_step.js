function HookStep(keyword) {
  var Cucumber = require('../../cucumber');
  var self = Cucumber.Ast.Step(keyword, HookStep.NAME, HookStep.UNDEFINED_URI, HookStep.UNDEFINED_LINE);
  var hook;

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

HookStep.NAME           = undefined;
HookStep.UNDEFINED_URI  = undefined;
HookStep.UNDEFINED_LINE = undefined;

module.exports = HookStep;
