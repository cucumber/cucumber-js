require('../../../support/spec_helper');

describe("Cucumber.Ast.Filter.AnyOfTagsRule", function() {
  var Cucumber = requireLib('cucumber');

  var rule, tags;

  beforeEach(function() {
    tags = createSpy("tags");
    rule = Cucumber.Ast.Filter.AnyOfTagsRule(tags);
  });

  describe("isSatisfiedByElement()", function() {
    var _ = require('underscore');

    var element, satisfyingElement;

    beforeEach(function() {
      element           = createSpy("element");
      satisfyingElement = createSpy("whether the element is satisfying");
      spyOn(_, 'any').andReturn(satisfyingElement);
    });

    it("looks for a tag matching some condition", function() {
      rule.isSatisfiedByElement(element);
      expect(_.any).toHaveBeenCalled();
      expect(_.any).toHaveBeenCalledWithValueAsNthParameter(tags, 1);
      expect(_.any).toHaveBeenCalledWithAFunctionAsNthParameter(2);
    });

    describe("every tag condition", function() {
      var spec, everyTagConditionFunc, tag, matchingSpec;

      beforeEach(function() {
        matchingSpec = createSpy("whether the spec is satisfied or not");
        tag          = createSpy("tag");
        spec         = createSpyWithStubs("element matching tag spec", {isMatching: matchingSpec});
        rule.isSatisfiedByElement(element);
        everyTagConditionFunc = _.any.mostRecentCall.args[1];
        spyOn(Cucumber.Ast.Filter, 'ElementMatchingTagSpec').andReturn(spec);
      });

      it("instantiates an element matching tag spec", function() {
        everyTagConditionFunc(tag);
        expect(Cucumber.Ast.Filter.ElementMatchingTagSpec).toHaveBeenCalledWith(tag);
      });

      it("checks whether the element is matching the spec", function() {
        everyTagConditionFunc(tag);
        expect(spec.isMatching).toHaveBeenCalledWith(element);
      });

      it("returns match result", function() {
        expect(everyTagConditionFunc(tag)).toBe(matchingSpec);
      });
    });

    it("returns whether it found a matching tag or not", function() {
      expect(rule.isSatisfiedByElement(element)).toBe(satisfyingElement);
    });
  });
});
