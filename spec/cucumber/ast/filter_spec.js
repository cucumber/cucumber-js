require('../../support/spec_helper');

describe("Cucumber.Ast.Filter", function() {
  var Cucumber = requireLib('cucumber');

  var filter, rules;

  beforeEach(function() {
    rules  = createSpy("rules");
    filter = Cucumber.Ast.Filter(rules);
  });

  describe("isScenarioEnrolled()", function() {
    var _ = require('underscore');

    var scenario, scenarioEnrolled;

    beforeEach(function() {
      scenario         = createSpy("scenario");
      scenarioEnrolled = createSpy("wether the scenario is enrolled or not");
      spyOn(_, 'all').andReturn(scenarioEnrolled);
    });

    it("checks all the rules for a condition", function() {
      filter.isScenarioEnrolled(scenario);
      expect(_.all).toHaveBeenCalled();
      expect(_.all).toHaveBeenCalledWithValueAsNthParameter(rules, 1);
      expect(_.all).toHaveBeenCalledWithAFunctionAsNthParameter(2);
    });

    describe("every rule condition", function() {
      var ruleConditionFunc, rule, ruleSatisfied;

      beforeEach(function() {
        ruleSatisfied = createSpy("wether the rule was satisfied or not");
        rule          = createSpyWithStubs("rule", {isSatisfiedByElement: ruleSatisfied});
        filter.isScenarioEnrolled(scenario);
        ruleConditionFunc = _.all.mostRecentCall.args[1];
      });

      it("checks wether the rule is satisfied by the scenario", function() {
        ruleConditionFunc(rule);
        expect(rule.isSatisfiedByElement).toHaveBeenCalledWith(scenario);
      });

      it("returns wether the rule wa satisfied or not", function() {
        expect(ruleConditionFunc(rule)).toBe(ruleSatisfied);
      });
    });

    it("returns wether the scenario was enrolled or not", function() {
      expect(filter.isScenarioEnrolled(scenario)).toBe(scenarioEnrolled);
    })
  });
});