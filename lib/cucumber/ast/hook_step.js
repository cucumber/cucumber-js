function HookStep(keyword) {
  var Cucumber = require('../../cucumber');
  var self = Cucumber.Ast.Step({});

  self.getKeyword = function getKeyword() {
    return keyword;
  };

  self.isHidden = function isHidden() {
    return true;
  };

  self.hasUri = function hasUri() {
    return false;
  };

  return self;
}

HookStep.BEFORE_STEP_KEYWORD = 'Before ';
HookStep.AFTER_STEP_KEYWORD = 'After ';

module.exports = HookStep;
