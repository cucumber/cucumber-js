function Hook(code, options, uri, line) {
  var Cucumber = require('../../cucumber');
  var self = Cucumber.SupportCode.StepDefinition(Hook.EMPTY_PATTERN, options, code, uri, line);
  var tags = options.tags || [];

  self.buildInvocationParameters = function buildInvocationParameters(step, scenario) {
    return [scenario];
  };

  self.appliesToScenario = function appliesToScenario(scenario) {
    var astFilter = self.getAstFilter();
    return astFilter.isElementEnrolled(scenario);
  };

  self.getAstFilter = function getAstFilter() {
    var tagGroups = Cucumber.TagGroupParser.getTagGroupsFromStrings(tags);
    var rules = tagGroups.map(function (tagGroup) {
      var rule = Cucumber.Ast.Filter.AnyOfTagsRule(tagGroup);
      return rule;
    });
    var astFilter = Cucumber.Ast.Filter(rules);
    return astFilter;
  };

  self.validCodeLengths = function validCodeLengths () {
    return [0, 1, 2];
  };

  self.invalidCodeLengthMessage = function invalidCodeLengthMessage() {
    return self.buildInvalidCodeLengthMessage('0 or 1', '2');
  };

  return self;
}

Hook.EMPTY_PATTERN = '';

module.exports = Hook;
