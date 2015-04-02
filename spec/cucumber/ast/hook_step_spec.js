require('../../support/spec_helper');

describe("Cucumber.Ast.HookStep", function () {
  var Cucumber = requireLib('cucumber');
  var keyword, step, hookStep;

  beforeEach(function () {
    keyword  = createSpy("keyword");
    step     = createSpy("step");
    spyOn(Cucumber.Ast, 'Step').andReturn(step);
    hookStep = Cucumber.Ast.HookStep(keyword);
  });

  describe("constructor", function () {
    it("inherits from Cucumber.Ast.Step", function () {
      expect(Cucumber.Ast.Step).toHaveBeenCalledWith(keyword, undefined, undefined, undefined);
      expect(hookStep).toBe(step);
    });
  });

  describe("isHidden()", function () {
    it("returns true for a hook step", function () {
      expect(hookStep.isHidden()).toBeTruthy();
    });
  });

  describe("hasUri()", function () {
    it("returns false as hook steps do not have URIs", function () {
      expect(hookStep.hasUri()).toBeFalsy();
    });
  });

  describe("getStepDefinition() [setHook()]", function () {
    var hook;

    beforeEach(function () {
      hook = createSpy("hook");
    });

    it("returns the hook instance set with setHook()", function () {
      hookStep.setHook(hook);
      expect(hookStep.getStepDefinition()).toBe(hook);
    });
  });
});
