require('../../support/spec_helper');

describe("Cucumber.SupportCode.AroundHook", function () {
  var Cucumber = requireLib('cucumber');
  var aroundHook, code, options, hook, hookSpy;

  beforeEach(function () {
    code       = createSpy("hook code");
    options    = {};
    hook       = createSpy("hook");
    hookSpy    = spyOn(Cucumber.SupportCode, 'Hook').andReturn(hook);
    aroundHook = Cucumber.SupportCode.AroundHook(code, options);
  });

  describe("constructor", function () {
    it("inherits from Cucumber.SupportCode.Hook", function () {
      expect(Cucumber.SupportCode.Hook).toHaveBeenCalledWith(code, options);
      expect(aroundHook).toBe(hook);
    });
  });

  describe("buildCodeCallback() [setAfterStep()]", function () {
    var callback, error, postScenarioAroundHookCallback, afterHook, codeCallback;

    beforeEach(function () {
      callback     = createSpy("callback");
      error        = createSpy("error");
      postScenarioAroundHookCallback = createSpy("post scenario around hook callback");
      afterHook    = createSpy("after hook");
      hookSpy.andReturn(afterHook);

      codeCallback = aroundHook.buildCodeCallback(callback);
    });

    it("returns the code callback", function () {
      expect(codeCallback).toBeAFunction ();
    });

    it("does not callback straight away", function () {
      expect(callback).not.toHaveBeenCalled();
    });

    describe("when calling the code callback", function () {
      var afterStep;

      beforeEach(function () {
        afterStep = createSpyWithStubs("after step", {setHook: undefined});
        aroundHook.setAfterStep(afterStep);
      });

      describe("with the post scenario callback", function () {
        beforeEach(function () {
          codeCallback(postScenarioAroundHookCallback);
        });

        it("calls back", function () {
          expect(callback).toHaveBeenCalledWith(undefined);
        });

        it("creates an after hook", function () {
          expect(Cucumber.SupportCode.Hook).toHaveBeenCalledWith(postScenarioAroundHookCallback, {});
        });

        it("assigns the after hook to the after step", function () {
          expect(afterStep.setHook).toHaveBeenCalledWith(afterHook);
        });
      });

      describe("with no error and the post scenario callback", function () {
        beforeEach(function () {
          codeCallback(null, postScenarioAroundHookCallback);
        });

        it("calls back", function () {
          expect(callback).toHaveBeenCalledWith(null);
        });

        it("creates an after hook", function () {
          expect(Cucumber.SupportCode.Hook).toHaveBeenCalledWith(postScenarioAroundHookCallback, {});
        });

        it("assigns the after hook to the after step", function () {
          expect(afterStep.setHook).toHaveBeenCalledWith(afterHook);
        });
      });

      describe("with an error and the post scenario callback", function () {
        var error;

        beforeEach(function () {
          error = createSpy("error");
          codeCallback(error, postScenarioAroundHookCallback);
        });

        it("calls back", function () {
          expect(callback).toHaveBeenCalledWith(error);
        });

        it("creates an after hook", function () {
          expect(Cucumber.SupportCode.Hook).toHaveBeenCalledWith(postScenarioAroundHookCallback, {});
        });

        it("assigns the after hook to the after step", function () {
          expect(afterStep.setHook).toHaveBeenCalledWith(afterHook);
        });
      });
    });
  });
});
