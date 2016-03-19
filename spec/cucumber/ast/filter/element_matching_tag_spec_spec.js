require('../../../support/spec_helper');

describe("Cucumber.Ast.Filter.ElementMatchingTagSpec", function () {
  var Cucumber = requireLib('cucumber');

  var spec, tagName;

  beforeEach(function () {
    tagName  = "tag";
    spec = Cucumber.Ast.Filter.ElementMatchingTagSpec(tagName);
  });

  describe("isMatching()", function () {
    var _ = require('lodash');

    var element, elementTags, matchingElement;

    beforeEach(function () {
      elementTags     = createSpy("element tags");
      element         = createSpyWithStubs("element", {getTags: elementTags});
      matchingElement = createSpy("whether the element is matching or not");
      spyOn(spec, 'isExpectingTag');
    });

    describe("when the spec tag is expected on the element", function () {
      beforeEach(function () {
        spec.isExpectingTag.and.returnValue(true);
        spyOn(_, 'some').and.returnValue(matchingElement);
      });

      it("checks whether any of the element tags match the spec tag", function () {
        spec.isMatching(element);
        expect(_.some).toHaveBeenCalledWith(elementTags, spec.isTagSatisfying);
      });

      it("returns whether the element matched or not", function () {
        expect(spec.isMatching(element)).toBe(matchingElement);
      });
    });

    describe("when the spec tag is not expected on the element", function () {
      beforeEach(function () {
        spec.isExpectingTag.and.returnValue(false);
        spyOn(_, 'every').and.returnValue(matchingElement);
      });

      it("checks whether any of the element tags match the spec tag", function () {
        spec.isMatching(element);
        expect(_.every).toHaveBeenCalledWith(elementTags, spec.isTagSatisfying);
      });

      it("returns whether the element matched or not", function () {
        expect(spec.isMatching(element)).toBe(matchingElement);
      });
    });
  });

  describe("isTagSatisfying()", function () {
    var checkedTag;

    beforeEach(function () {
      checkedTag = createSpyWithStubs("element tag", {getName: null});
      spyOn(spec, 'isExpectingTag');
    });

    it("gets the name of the tag", function () {
      spec.isTagSatisfying(checkedTag);
      expect(checkedTag.getName).toHaveBeenCalled();
    });

    it("checks whether the spec tag is expected or not on the element", function () {
      spec.isTagSatisfying(checkedTag);
      expect(spec.isExpectingTag).toHaveBeenCalled();
    });

    describe("when the spec expects the tag to be present on the element", function () {
      beforeEach(function () {
        spec.isExpectingTag.and.returnValue(true);
      });

      describe("when the tag names are identical", function () {
        beforeEach(function () {
          checkedTag.getName.and.returnValue(tagName);
        });

        it("is truthy", function () {
          expect(spec.isTagSatisfying(checkedTag)).toBeTruthy();
        });
      });

      describe("when the tag names are different", function () {
        beforeEach(function () {
          checkedTag.getName.and.returnValue("@obscure_tag");
        });

        it("is falsy", function () {
          expect(spec.isTagSatisfying(checkedTag)).toBeFalsy();
        });
      });
    });

    describe("when the spec expects the tag to be absent on the element", function () {
      beforeEach(function () {
        tagName = "tag";
        spec    = Cucumber.Ast.Filter.ElementMatchingTagSpec("~" + tagName);
        spyOn(spec, 'isExpectingTag').and.returnValue(false);
      });

      describe("when the tag names are identical", function () {
        beforeEach(function () {
          checkedTag.getName.and.returnValue(tagName);
        });

        it("returns false", function () {
          expect(spec.isTagSatisfying(checkedTag)).toBe(false);
        });
      });

      describe("when the tag names are different", function () {
        beforeEach(function () {
          checkedTag.getName.and.returnValue("@obscure_tag");
        });

        it("returns true", function () {
          expect(spec.isTagSatisfying(checkedTag)).toBe(true);
        });
      });
    });
  });

  describe("isExpectingTag()", function () {
    it("is truthy when the tag does not start with a tilde (~)", function () {
      tagName  = "tag";
      spec = Cucumber.Ast.Filter.ElementMatchingTagSpec(tagName);
      expect(spec.isExpectingTag()).toBeTruthy();
    });

    it("is falsy when the tag starts with a tilde (~)", function () {
      tagName  = "~tag";
      spec = Cucumber.Ast.Filter.ElementMatchingTagSpec(tagName);
      expect(spec.isExpectingTag()).toBeFalsy();
    });
  });
});
