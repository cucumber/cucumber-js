require('../../support/spec_helper');

describe("Cucumber.Ast.HookStep", function () {
  var Cucumber = requireLib('cucumber');
  var keyword, step, hookStep;

  beforeEach(function () {
    keyword  = createSpy("keyword");
    step     = createSpy("step");
    spyOn(Cucumber.Ast, 'Step').and.returnValue(step);
    hookStep = Cucumber.Ast.HookStep(keyword);
  });

  describe("constructor", function () {
    it("inherits from Cucumber.Ast.Step", function () {
      expect(Cucumber.Ast.Step).toHaveBeenCalledWith({});
      expect(hookStep).toBe(step);
    });
  });

  describe("getKeyword()", function () {
    it("returns true for a hook step", function () {
      expect(hookStep.getKeyword()).toEqual(keyword);
    });
  });

  describe("isHidden()", function () {
    it("returns true for a hook step", function () {
      expect(hookStep.isHidden()).toBe(true);
    });
  });

  describe("hasUri()", function () {
    it("returns false as hook steps do not have URIs", function () {
      expect(hookStep.hasUri()).toBe(false);
    });
  });
});
