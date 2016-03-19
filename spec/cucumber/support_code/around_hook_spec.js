require('../../support/spec_helper');

describe("Cucumber.SupportCode.AroundHook", function () {
  var Cucumber = requireLib('cucumber');
  var aroundHook, code, options, uri, line, hook, hookSpy;

  beforeEach(function () {
    code = createSpy("hook code");
    options = {};
    uri = 'uri';
    line = 1;
    hook = createSpy("hook");
    hookSpy = spyOn(Cucumber.SupportCode, 'Hook').and.returnValue(hook);
    aroundHook = Cucumber.SupportCode.AroundHook(code, options, uri, line);
  });

  describe("constructor", function () {
    it("inherits from Cucumber.SupportCode.Hook", function () {
      expect(Cucumber.SupportCode.Hook).toHaveBeenCalledWith(code, options, uri, line);
      expect(aroundHook).toBe(hook);
    });
  });

  describe("buildCodeCallback() [setAfterStep()]", function () {
    var callback, error, postScenarioCallback, afterHook, codeCallback;

    beforeEach(function () {
      callback     = createSpy("callback");
      error        = createSpy("error");
      postScenarioCallback = createSpy("post scenario callback");
      afterHook    = createSpy("after hook");
      hookSpy.and.returnValue(afterHook);

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

      describe("with no error and the post scenario callback", function () {
        beforeEach(function () {
          codeCallback(null, postScenarioCallback);
        });

        it("calls back", function () {
          expect(callback).toHaveBeenCalledWith(null);
        });

        it("creates an after hook", function () {
          expect(Cucumber.SupportCode.Hook).toHaveBeenCalledWith(postScenarioCallback, {noScenario: true}, uri, line);
        });

        it("assigns the after hook to the after step", function () {
          expect(afterStep.setHook).toHaveBeenCalledWith(afterHook);
        });
      });

      describe("with an error and no post scenario callback", function () {
        var error;

        beforeEach(function () {
          error = createSpy("error");
          codeCallback(error);
        });

        it("calls back", function () {
          expect(callback).toHaveBeenCalledWith(error);
        });

        it("does not assign an after hook to the after step", function () {
          expect(afterStep.setHook).not.toHaveBeenCalled();
        });
      });

      describe("with an error and the post scenario callback", function () {
        var error;

        beforeEach(function () {
          error = createSpy("error");
          codeCallback(error, postScenarioCallback);
        });

        it("calls back", function () {
          expect(callback).toHaveBeenCalledWith(error);
        });

        it("creates an after hook", function () {
          expect(Cucumber.SupportCode.Hook).toHaveBeenCalledWith(postScenarioCallback, {noScenario: true}, uri, line);
        });

        it("assigns the after hook to the after step", function () {
          expect(afterStep.setHook).toHaveBeenCalledWith(afterHook);
        });
      });
    });
  });
});
