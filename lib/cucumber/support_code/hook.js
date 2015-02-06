function Hook(code, options) {
  var _ = require('underscore');

  var Cucumber = require('../../cucumber');
  var self = Cucumber.SupportCode.StepDefinition(Hook.EMPTY_PATTERN, code);
  var tags = options.tags || [];

  self.matchesStepName = function matchesStepName() {
    return false;
  };

  self.buildInvocationParameters = function buildInvocationParameters(step, scenario, callback) {
    if (code.length === 1)
      return [callback];
    else
      return [scenario, callback];
  };

  self.appliesToScenario = function appliesToScenario(scenario) {
    var astFilter = self.getAstFilter();
    return astFilter.isElementEnrolled(scenario);
  };

  self.getAstFilter = function getAstFilter() {
    var tagGroups = Cucumber.TagGroupParser.getTagGroupsFromStrings(tags);
    var rules = _.map(tagGroups, function (tagGroup) {
      var rule = Cucumber.Ast.Filter.AnyOfTagsRule(tagGroup);
      return rule;
    });
    var astFilter = Cucumber.Ast.Filter(rules);
    return astFilter;
  };

  return self;
}

Hook.EMPTY_PATTERN = '';

module.exports = Hook;
