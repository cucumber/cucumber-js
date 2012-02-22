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
    var aroundHook, code;

    beforeEach(function() {
      code       = createSpy("around code");
      aroundHook = createSpy("around hook");
      spyOn(Cucumber.SupportCode, "Hook").andReturn(aroundHook);
      spyOnStub(aroundHooks, "add");
    });

    it("creates an around hook with the code", function() {
      hooker.addAroundHookCode(code);
      expect(Cucumber.SupportCode.Hook).toHaveBeenCalledWith(code);
    });

    it("unshifts the around hook to the around hook collection", function() {
      hooker.addAroundHookCode(code);
      expect(aroundHooks.add).toHaveBeenCalledWith(aroundHook);
    });
  });

  describe("addBeforeHookCode", function() {
    var beforeHook, code;

    beforeEach(function() {
      code       = createSpy("before code");
      beforeHook = createSpy("before hook");
      spyOn(Cucumber.SupportCode, "Hook").andReturn(beforeHook);
      spyOnStub(beforeHooks, "add");
    });

    it("creates a before hook with the code", function() {
      hooker.addBeforeHookCode(code);
      expect(Cucumber.SupportCode.Hook).toHaveBeenCalledWith(code);
    });

    it("adds the before hook to the before hook collection", function() {
      hooker.addBeforeHookCode(code);
      expect(beforeHooks.add).toHaveBeenCalledWith(beforeHook);
    });
  });

  describe("addAfterHookCode", function() {
    var afterHook, code;

    beforeEach(function() {
      code      = createSpy("after code");
      afterHook = createSpy("after hook");
      spyOn(Cucumber.SupportCode, "Hook").andReturn(afterHook);
      spyOnStub(afterHooks, "unshift");
    });

    it("creates a after hook with the code", function() {
      hooker.addAfterHookCode(code);
      expect(Cucumber.SupportCode.Hook).toHaveBeenCalledWith(code);
    });

    it("prepends the after hook to the after hook collection", function() {
      hooker.addAfterHookCode(code);
      expect(afterHooks.unshift).toHaveBeenCalledWith(afterHook);
    });
  });

  describe("hookUpFunctionWithWorld()", function() {
    var userFunction, world;

    beforeEach(function() {
      userFunction = createSpy("user function");
      world        = createSpy("world instance");
    });

    it("returns a function", function() {
      expect(hooker.hookUpFunctionWithWorld(userFunction, world)).toBeAFunction();
    });

    describe("returned function", function() {
      var returnedFunction, callback, postScenarioAroundHookCallbacks;

      beforeEach(function() {
        returnedFunction                = hooker.hookUpFunctionWithWorld(userFunction, world);
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
          aroundHook          = createSpyWithStubs("around hook", {invoke: null});
          iterationCallback   = createSpy("iteration callback");
          returnedFunction(callback);
          aroundHookIteration = aroundHooks.forEach.mostRecentCall.args[0];
        });

        it("invokes the around hook with the world instance", function() {
          aroundHookIteration(aroundHook, iterationCallback);
          expect(aroundHook.invoke).toHaveBeenCalled();
          expect(aroundHook.invoke).toHaveBeenCalledWithValueAsNthParameter(world, 1);
          expect(aroundHook.invoke).toHaveBeenCalledWithAFunctionAsNthParameter(2);
        });

        describe("on around hook invocation completion", function() {
          var invocationCompletionCallback, postScenarioAroundHookCallback;

          beforeEach(function() {
            aroundHookIteration(aroundHook, iterationCallback);
            invocationCompletionCallback   = aroundHook.invoke.mostRecentCall.args[1];
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

      describe("on around hook look completion", function() {
        var aroundHooksLoopCallback;

        beforeEach(function() {
          returnedFunction(callback);
          aroundHooksLoopCallback = aroundHooks.forEach.mostRecentCall.args[1];
          spyOn(hooker, 'triggerBeforeHooks');
        });

        it("triggers the before hooks", function() {
          aroundHooksLoopCallback();
          expect(hooker.triggerBeforeHooks).toHaveBeenCalled();
          expect(hooker.triggerBeforeHooks).toHaveBeenCalledWithValueAsNthParameter(world, 1);
          expect(hooker.triggerBeforeHooks).toHaveBeenCalledWithAFunctionAsNthParameter(2);
        });

        describe("on before hooks completion", function() {
          var beforeHooksCompletionCallback;

          beforeEach(function() {
            aroundHooksLoopCallback();
            beforeHooksCompletionCallback = hooker.triggerBeforeHooks.mostRecentCall.args[1];
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
              expect(hooker.triggerAfterHooks).toHaveBeenCalledWithValueAsNthParameter(world, 1);
              expect(hooker.triggerAfterHooks).toHaveBeenCalledWithAFunctionAsNthParameter(2);
            });

            describe("on after hooks completion", function() {
              var afterHooksCompletionCallback;

              beforeEach(function() {
                userFunctionCallback();
                afterHooksCompletionCallback = hooker.triggerAfterHooks.mostRecentCall.args[1];
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
    var world, callback;

    beforeEach(function() {
      world      = createSpy("world");
      callback   = createSpy("callback");
      spyOnStub(beforeHooks, 'forEach');
    });

    it("iterates over the before hooks", function() {
      hooker.triggerBeforeHooks(world, callback);
      expect(beforeHooks.forEach).toHaveBeenCalled();
      expect(beforeHooks.forEach).toHaveBeenCalledWithAFunctionAsNthParameter(1);
      expect(beforeHooks.forEach).toHaveBeenCalledWithValueAsNthParameter(callback, 2);
    });

    describe("for each before hook", function() {
      var beforeHook, forEachBeforeHookFunction, forEachBeforeHookFunctionCallback;

      beforeEach(function() {
        hooker.triggerBeforeHooks(world, callback);
        forEachBeforeHookFunction = beforeHooks.forEach.mostRecentCall.args[0];
        forEachBeforeHookFunctionCallback = createSpy("for each before hook iteration callback");
        beforeHook = createSpyWithStubs("before hook", {invoke: null});
      });

      it("invokes the hook", function() {
        forEachBeforeHookFunction(beforeHook, forEachBeforeHookFunctionCallback);
        expect(beforeHook.invoke).toHaveBeenCalledWith(world, forEachBeforeHookFunctionCallback);
      });
    });
  });

  describe("triggerAfterHooks", function() {
    var world, callback;

    beforeEach(function() {
      world      = createSpy("world");
      callback   = createSpy("callback");
      spyOnStub(afterHooks, 'forEach');
    });

    it("iterates over the after hooks", function() {
      hooker.triggerAfterHooks(world, callback);
      expect(afterHooks.forEach).toHaveBeenCalled();
      expect(afterHooks.forEach).toHaveBeenCalledWithAFunctionAsNthParameter(1);
      expect(afterHooks.forEach).toHaveBeenCalledWithValueAsNthParameter(callback, 2);
    });

    describe("for each after hook", function() {
      var afterHook, forEachAfterHookFunction, forEachAfterHookFunctionCallback;

      beforeEach(function() {
        hooker.triggerAfterHooks(world, callback);
        forEachAfterHookFunction = afterHooks.forEach.mostRecentCall.args[0];
        forEachAfterHookFunctionCallback = createSpy("for each after hook iteration callback");
        afterHook = createSpyWithStubs("after hook", {invoke: null});
      });

      it("invokes the hook", function() {
        forEachAfterHookFunction(afterHook, forEachAfterHookFunctionCallback);
        expect(afterHook.invoke).toHaveBeenCalledWith(world, forEachAfterHookFunctionCallback);
      });
    });
  });
});
