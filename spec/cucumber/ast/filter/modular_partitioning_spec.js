require('../../../support/spec_helper');

describe("Cucumber.Ast.Filter.ModularPartitioning", function() {
  var Cucumber = requireLib('cucumber');

  var numberPartitions = 4;
  var remainder = 3;
  var rule = Cucumber.Ast.Filter.ModularPartitioning(numberPartitions, remainder);

  describe("isSatisfiedByElement()", function() {
    it("should return true when element belongs to the requested partition", function() {
      expect(rule.isSatisfiedByElement({ "counter": 7 })).toBe(true);
    });

    it("should return false when element does not belong to the requested partition", function() {
      expect(rule.isSatisfiedByElement({ "counter": 6 })).toBe(false);
    });
  });
});
