require('../../../support/spec_helper');

describe("Cucumber.Ast.Filter.ElementMatchingTagSpec", function() {
  var Cucumber = requireLib('cucumber');

  var spec, tagName;

  beforeEach(function() {
    tagName  = "tag";
    spec = Cucumber.Ast.Filter.ElementMatchingTagSpec(tagName);
  });

  describe("isMatching()", function() {
    var _ = require('underscore');

    var element, elementTags, matchingElement;

    beforeEach(function() {
      elementTags     = createSpy("element tags");
      element         = createSpyWithStubs("element", {getTags: elementTags});
      matchingElement = createSpy("whether the element is matching or not");
      spyOn(spec, 'isExpectingTag');
    });

    it("gets the element tags", function() {
      spec.isMatching(element);
      expect(element.getTags).toHaveBeenCalled();
    });

    it("checks whether the spec tag is expected or not", function() {
      spec.isMatching(element);
      expect(spec.isExpectingTag).toHaveBeenCalled();
    });

    describe("when the spec tag is expected on the element", function() {
      beforeEach(function() {
        spec.isExpectingTag.andReturn(true);
        spyOn(_, 'any').andReturn(matchingElement);
      });

      it("checks whether any of the element tags match the spec tag", function() {
        spec.isMatching(element);
        expect(_.any).toHaveBeenCalledWith(elementTags, spec.isTagSatisfying);
      });

      it("returns whether the element matched or not", function() {
        expect(spec.isMatching(element)).toBe(matchingElement);
      });
    });

    describe("when the spec tag is not expected on the element", function() {
      beforeEach(function() {
        spec.isExpectingTag.andReturn(false);
        spyOn(_, 'all').andReturn(matchingElement);
      });

      it("checks whether any of the element tags match the spec tag", function() {
        spec.isMatching(element);
        expect(_.all).toHaveBeenCalledWith(elementTags, spec.isTagSatisfying);
      });

      it("returns whether the element matched or not", function() {
        expect(spec.isMatching(element)).toBe(matchingElement);
      });
    });
  });

  describe("isTagSatisfying()", function() {
    var checkedTag;

    beforeEach(function() {
      checkedTag = createSpyWithStubs("element tag", {getName: null});
      spyOn(spec, 'isExpectingTag');
    });

    it("gets the name of the tag", function() {
      spec.isTagSatisfying(checkedTag);
      expect(checkedTag.getName).toHaveBeenCalled();
    });

    it("checks whether the spec tag is expected or not on the element", function() {
      spec.isTagSatisfying(checkedTag);
      expect(spec.isExpectingTag).toHaveBeenCalled();
    });

    describe("when the spec expects the tag to be present on the element", function() {
      beforeEach(function() {
        spec.isExpectingTag.andReturn(true);
      });

      describe("when the tag names are identical", function() {
        beforeEach(function() {
          checkedTag.getName.andReturn(tagName);
        });

        it("is truthy", function() {
          expect(spec.isTagSatisfying(checkedTag)).toBeTruthy();
        });
      });

      describe("when the tag names are different", function() {
        beforeEach(function() {
          checkedTag.getName.andReturn("@obscure_tag");
        });

        it("is falsy", function() {
          expect(spec.isTagSatisfying(checkedTag)).toBeFalsy();
        });
      });
    });

    describe("when the spec expects the tag to be absent on the element", function() {
      beforeEach(function() {
        tagName = "tag";
        spec    = Cucumber.Ast.Filter.ElementMatchingTagSpec("~" + tagName);
        spyOn(spec, 'isExpectingTag').andReturn(false);
      });

      describe("when the tag names are identical", function() {
        beforeEach(function() {
          checkedTag.getName.andReturn(tagName);
        });

        it("is truthy", function() {
          expect(spec.isTagSatisfying(checkedTag)).toBeFalsy();
        });
      });

      describe("when the tag names are different", function() {
        beforeEach(function() {
          checkedTag.getName.andReturn("@obscure_tag");
        });

        it("is falsy", function() {
          expect(spec.isTagSatisfying(checkedTag)).toBeTruthy();
        });
      });
    });
  });

  describe("isExpectingTag()", function() {
    it("is truthy when the tag does not start with a tilde (~)", function() {
      tagName  = "tag";
      spec = Cucumber.Ast.Filter.ElementMatchingTagSpec(tagName);
      expect(spec.isExpectingTag()).toBeTruthy();
    });

    it("is falsy when the tag starts with a tilde (~)", function() {
      tagName  = "~tag";
      spec = Cucumber.Ast.Filter.ElementMatchingTagSpec(tagName);
      expect(spec.isExpectingTag()).toBeFalsy();
    });
  });
});
