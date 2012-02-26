require('../../../support/spec_helper');

describe("Cucumber.SupportCode.Library.Hooker", function() {
  var Cucumber = requireLib('cucumber');
  var hooker, aroundHooks, beforeHooks, afterHooks;

  beforeEach(function() {
    aroundHooks = createSpy("around hook collection");
    beforeHooks = createSpy("before hook collection");
    afterHooks  = createSpy("after hook collection");
    spyOn(Cucumber.Type, 'Collection').andReturnSeveral([aroundHooks, beforeHooks, afterHooks]);
    hooker = Cucumber.SupportCode.Library.Hooker();
  });

  describe("constructor", function() {
    it("creates collections of around, before and after hooks", function() {
      expect(Cucumber.Type.Collection).toHaveBeenCalled();
      expect(Cucumber.Type.Collection.callCount).toBe(3);
    });
  });

  describe("addAroundHookCode", function() {
    var aroundHook, code, options;

    beforeEach(function() {
      code       = createSpy("around code");
      options    = createSpy("options");
      aroundHook = createSpy("around hook");
      spyOn(Cucumber.SupportCode, "Hook").andReturn(aroundHook);
      spyOnStub(aroundHooks, "add");
    });

    it("creates an around hook with the code and options", function() {
      hooker.addAroundHookCode(code, options);
      expect(Cucumber.SupportCode.Hook).toHaveBeenCalledWith(code, options);
    });

    it("unshifts the around hook to the around hook collection", function() {
      hooker.addAroundHookCode(code, options);
      expect(aroundHooks.add).toHaveBeenCalledWith(aroundHook);
    });
  });

  describe("addBeforeHookCode", function() {
    var beforeHook, code, options;

    beforeEach(function() {
      code       = createSpy("before code");
      options    = createSpy("options");
      beforeHook = createSpy("before hook");
      spyOn(Cucumber.SupportCode, "Hook").andReturn(beforeHook);
      spyOnStub(beforeHooks, "add");
    });

    it("creates a before hook with the code and options", function() {
      hooker.addBeforeHookCode(code, options);
      expect(Cucumber.SupportCode.Hook).toHaveBeenCalledWith(code, options);
    });

    it("adds the before hook to the before hook collection", function() {
      hooker.addBeforeHookCode(code, options);
      expect(beforeHooks.add).toHaveBeenCalledWith(beforeHook);
    });
  });

  describe("addAfterHookCode", function() {
    var afterHook, code, options;

    beforeEach(function() {
      code      = createSpy("after code");
      options   = createSpy("options");
      afterHook = createSpy("after hook");
      spyOn(Cucumber.SupportCode, "Hook").andReturn(afterHook);
      spyOnStub(afterHooks, "unshift");
    });

    it("creates a after hook with the code", function() {
      hooker.addAfterHookCode(code, options);
      expect(Cucumber.SupportCode.Hook).toHaveBeenCalledWith(code, options);
    });

    it("prepends the after hook to the after hook collection", function() {
      hooker.addAfterHookCode(code, options);
      expect(afterHooks.unshift).toHaveBeenCalledWith(afterHook);
    });
  });

  describe("hookUpFunction()", function() {
    var userFunction, world, scenario;

    beforeEach(function() {
      userFunction = createSpy("user function");
      scenario     = createSpy("scenario");
      world        = createSpy("world instance");
    });

    it("returns a function", function() {
      expect(hooker.hookUpFunction(userFunction, scenario, world)).toBeAFunction();
    });

    describe("returned function", function() {
      var returnedFunction, callback, postScenarioAroundHookCallbacks;

      beforeEach(function() {
        returnedFunction                = hooker.hookUpFunction(userFunction, scenario, world);
        callback                        = createSpy("callback");
        postScenarioAroundHookCallbacks = createSpy("post-scenario around hook callbacks");
        spyOnStub(aroundHooks, 'forEach');
        Cucumber.Type.Collection.reset();
        Cucumber.Type.Collection.andReturn(postScenarioAroundHookCallbacks);
      });

      it("instantiates a collection for the post-scenario around hook callbacks", function() {
        returnedFunction(callback);
        expect(Cucumber.Type.Collection).toHaveBeenCalled();
      });

      it("iterates over the around hooks", function() {
        returnedFunction(callback);
        expect(aroundHooks.forEach).toHaveBeenCalledWithAFunctionAsNthParameter(1);
        expect(aroundHooks.forEach).toHaveBeenCalledWithAFunctionAsNthParameter(2);
      });

      describe("for each around hook", function() {
        var aroundHookIteration, aroundHook, iterationCallback;

        beforeEach(function() {
          aroundHook          = createSpyWithStubs("around hook", {invokeBesideScenario: null});
          iterationCallback   = createSpy("iteration callback");
          returnedFunction(callback);
          aroundHookIteration = aroundHooks.forEach.mostRecentCall.args[0];
        });

        it("invokes the around hook beside the scenario with the world instance", function() {
          aroundHookIteration(aroundHook, iterationCallback);
          expect(aroundHook.invokeBesideScenario).toHaveBeenCalled();
          expect(aroundHook.invokeBesideScenario).toHaveBeenCalledWithValueAsNthParameter(scenario, 1);
          expect(aroundHook.invokeBesideScenario).toHaveBeenCalledWithValueAsNthParameter(world, 2);
          expect(aroundHook.invokeBesideScenario).toHaveBeenCalledWithAFunctionAsNthParameter(3);
        });

        describe("on around hook invocation completion", function() {
          var invocationCompletionCallback, postScenarioAroundHookCallback;

          beforeEach(function() {
            aroundHookIteration(aroundHook, iterationCallback);
            invocationCompletionCallback   = aroundHook.invokeBesideScenario.mostRecentCall.args[2];
            postScenarioAroundHookCallback = createSpy("post-scenario around hook callback");
            spyOnStub(postScenarioAroundHookCallbacks, 'unshift');
          });

          it("prepends the returned post-scenario hook callback to the post-scenario hook callback collection", function() {
            invocationCompletionCallback(postScenarioAroundHookCallback);
            expect(postScenarioAroundHookCallbacks.unshift).toHaveBeenCalledWith(postScenarioAroundHookCallback);
          });

          it("calls back", function() {
            invocationCompletionCallback(postScenarioAroundHookCallback);
            expect(iterationCallback).toHaveBeenCalled();
          });
        });
      });

      describe("on around hook loop completion", function() {
        var aroundHooksLoopCallback;

        beforeEach(function() {
          returnedFunction(callback);
          aroundHooksLoopCallback = aroundHooks.forEach.mostRecentCall.args[1];
          spyOn(hooker, 'triggerBeforeHooks');
        });

        it("triggers the before hooks", function() {
          aroundHooksLoopCallback();
          expect(hooker.triggerBeforeHooks).toHaveBeenCalled();
          expect(hooker.triggerBeforeHooks).toHaveBeenCalledWithValueAsNthParameter(scenario, 1);
          expect(hooker.triggerBeforeHooks).toHaveBeenCalledWithValueAsNthParameter(world, 2);
          expect(hooker.triggerBeforeHooks).toHaveBeenCalledWithAFunctionAsNthParameter(3);
        });

        describe("on before hooks completion", function() {
          var beforeHooksCompletionCallback;

          beforeEach(function() {
            aroundHooksLoopCallback();
            beforeHooksCompletionCallback = hooker.triggerBeforeHooks.mostRecentCall.args[2];
          });

          it("calls the user function", function() {
            beforeHooksCompletionCallback();
            expect(userFunction).toHaveBeenCalled();
            expect(userFunction).toHaveBeenCalledWithAFunctionAsNthParameter(1);
          });

          describe("on user function completion", function() {
            var userFunctionCallback;

            beforeEach(function() {
              beforeHooksCompletionCallback();
              userFunctionCallback = userFunction.mostRecentCall.args[0];
              spyOn(hooker, 'triggerAfterHooks');
            });

            it("triggers the after hooks", function() {
              userFunctionCallback();
              expect(hooker.triggerAfterHooks).toHaveBeenCalled();
              expect(hooker.triggerAfterHooks).toHaveBeenCalledWithValueAsNthParameter(scenario, 1);
              expect(hooker.triggerAfterHooks).toHaveBeenCalledWithValueAsNthParameter(world, 2);
              expect(hooker.triggerAfterHooks).toHaveBeenCalledWithAFunctionAsNthParameter(3);
            });

            describe("on after hooks completion", function() {
              var afterHooksCompletionCallback;

              beforeEach(function() {
                userFunctionCallback();
                afterHooksCompletionCallback = hooker.triggerAfterHooks.mostRecentCall.args[2];
                spyOnStub(postScenarioAroundHookCallbacks, 'forEach');
              });

              it("iterates over the post-scenario around hook callbacks", function() {
                afterHooksCompletionCallback();
                expect(postScenarioAroundHookCallbacks.forEach).toHaveBeenCalled();
                expect(postScenarioAroundHookCallbacks.forEach).toHaveBeenCalledWithAFunctionAsNthParameter(1);
                expect(postScenarioAroundHookCallbacks.forEach).toHaveBeenCalledWithValueAsNthParameter(callback, 2);
              });

              describe("for each post-scenario around hook", function() {
                var postScenarioAroundHookIteration, postScenarioAroundHookCallback, postScenarioAroundHookIterationCallback;

                beforeEach(function() {
                  afterHooksCompletionCallback();
                  postScenarioAroundHookIteration         = postScenarioAroundHookCallbacks.forEach.mostRecentCall.args[0];
                  postScenarioAroundHookCallback          = createSpy("post-scenario around hook callback");
                  postScenarioAroundHookIterationCallback = createSpy("post-scenario around hook iteration callback");
                });

                it("calls the post-scenario around hook callback", function() {
                  postScenarioAroundHookIteration(postScenarioAroundHookCallback, postScenarioAroundHookIterationCallback);
                  expect(postScenarioAroundHookCallback).toHaveBeenCalledWith(postScenarioAroundHookIterationCallback);
                  expect(postScenarioAroundHookCallback.mostRecentCall.object).toBe(world);
                });
              });
            });
          });
        });
      });
    });
  });

  describe("triggerBeforeHooks", function() {
    var scenario, world, callback;

    beforeEach(function() {
      scenario = createSpy("scenario");
      world    = createSpy("world");
      callback = createSpy("callback");
      spyOnStub(beforeHooks, 'forEach');
    });

    it("iterates over the before hooks", function() {
      hooker.triggerBeforeHooks(scenario, world, callback);
      expect(beforeHooks.forEach).toHaveBeenCalled();
      expect(beforeHooks.forEach).toHaveBeenCalledWithAFunctionAsNthParameter(1);
      expect(beforeHooks.forEach).toHaveBeenCalledWithValueAsNthParameter(callback, 2);
    });

    describe("for each before hook", function() {
      var beforeHook, forEachBeforeHookFunction, forEachBeforeHookFunctionCallback;

      beforeEach(function() {
        hooker.triggerBeforeHooks(scenario, world, callback);
        forEachBeforeHookFunction = beforeHooks.forEach.mostRecentCall.args[0];
        forEachBeforeHookFunctionCallback = createSpy("for each before hook iteration callback");
        beforeHook = createSpyWithStubs("before hook", {invokeBesideScenario: null});
      });

      it("invokes the hook beside the scenario", function() {
        forEachBeforeHookFunction(beforeHook, forEachBeforeHookFunctionCallback);
        expect(beforeHook.invokeBesideScenario).toHaveBeenCalledWith(scenario, world, forEachBeforeHookFunctionCallback);
      });
    });
  });

  describe("triggerAfterHooks", function() {
    var scenario, world, callback;

    beforeEach(function() {
      scenario = createSpy("scenario");
      world    = createSpy("world");
      callback = createSpy("callback");
      spyOnStub(afterHooks, 'forEach');
    });

    it("iterates over the after hooks", function() {
      hooker.triggerAfterHooks(scenario, world, callback);
      expect(afterHooks.forEach).toHaveBeenCalled();
      expect(afterHooks.forEach).toHaveBeenCalledWithAFunctionAsNthParameter(1);
      expect(afterHooks.forEach).toHaveBeenCalledWithValueAsNthParameter(callback, 2);
    });

    describe("for each after hook", function() {
      var afterHook, forEachAfterHookFunction, forEachAfterHookFunctionCallback;

      beforeEach(function() {
        hooker.triggerAfterHooks(scenario, world, callback);
        forEachAfterHookFunction = afterHooks.forEach.mostRecentCall.args[0];
        forEachAfterHookFunctionCallback = createSpy("for each after hook iteration callback");
        afterHook = createSpyWithStubs("after hook", {invokeBesideScenario: null});
      });

      it("invokes the hook beside the scenario", function() {
        forEachAfterHookFunction(afterHook, forEachAfterHookFunctionCallback);
        expect(afterHook.invokeBesideScenario).toHaveBeenCalledWith(scenario, world, forEachAfterHookFunctionCallback);
      });
    });
  });
});
