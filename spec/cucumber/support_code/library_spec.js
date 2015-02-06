require('../../support/spec_helper');

describe("Cucumber.SupportCode.Library", function () {
  var Cucumber = requireLib('cucumber');
  var library, rawSupportCode;
  var worldConstructor;
  var listenerCollection, stepDefinitionCollection, aroundHookCollection, beforeHookCollection, afterHookCollection;
  var collectionSpy;

  beforeEach(function () {
    rawSupportCode           = createSpy("Raw support code");
    worldConstructor         = createSpy("world constructor");
    spyOn(Cucumber.SupportCode, 'WorldConstructor').andReturn(worldConstructor);
    listenerCollection       = createSpy("listener collection");
    stepDefinitionCollection = createSpy("step definition collection");
    aroundHookCollection     = createSpy("around hook collection");
    beforeHookCollection     = createSpy("before hook collection");
    afterHookCollection      = createSpy("after hook collection");
    collectionSpy            = spyOn(Cucumber.Type, 'Collection').andReturnSeveral([listenerCollection, stepDefinitionCollection, aroundHookCollection, beforeHookCollection, afterHookCollection]);
  });

  describe("constructor", function () {
    beforeEach(function () {
      library = Cucumber.SupportCode.Library(rawSupportCode);
    });

    it("creates a collection of step definitions", function () {
      expect(Cucumber.Type.Collection).toHaveBeenCalledNTimes(5);
    });

    it("executes the raw support code", function () {
      expect(rawSupportCode).toHaveBeenCalled();
    });

    it("creates a new World constructor", function () {
      expect(Cucumber.SupportCode.WorldConstructor).toHaveBeenCalled();
    });

    it("executes the raw support code with a support code helper as 'this'", function () {
      expect(rawSupportCode.mostRecentCall.object).toBeDefined();
    });

    describe("code support helper", function () {
      var supportCodeHelper;

      beforeEach(function () {
        supportCodeHelper = rawSupportCode.mostRecentCall.object;
      });

      it("exposes a method to define Around hooks", function () {
        expect(supportCodeHelper.Around).toBeAFunction ();
        expect(supportCodeHelper.Around).toBe(library.defineAroundHook);
      });

      it("exposes a method to define Before hooks", function () {
        expect(supportCodeHelper.Before).toBeAFunction ();
        expect(supportCodeHelper.Before).toBe(library.defineBeforeHook);
      });

      it("exposes a method to define After hooks", function () {
        expect(supportCodeHelper.After).toBeAFunction ();
        expect(supportCodeHelper.After).toBe(library.defineAfterHook);
      });

      it("exposes a method to define Given steps", function () {
        expect(supportCodeHelper.Given).toBeAFunction ();
        expect(supportCodeHelper.Given).toBe(library.defineStep);
      });

      it("exposes a method to define When steps", function () {
        expect(supportCodeHelper.When).toBeAFunction ();
        expect(supportCodeHelper.When).toBe(library.defineStep);
      });

      it("exposes a method to define Then steps", function () {
        expect(supportCodeHelper.Then).toBeAFunction ();
        expect(supportCodeHelper.Then).toBe(library.defineStep);
      });

      it("exposes a method to define any step", function () {
        expect(supportCodeHelper.defineStep).toBeAFunction ();
        expect(supportCodeHelper.defineStep).toBe(library.defineStep);
      });

      it("exposes the World constructor", function () {
        expect(supportCodeHelper.World).toBe(worldConstructor);
      });

      it("exposes a method to register a listener", function () {
        expect(supportCodeHelper.registerListener).toBeAFunction ();
      });

      it("exposes a method to register a handler", function () {
        expect(supportCodeHelper.registerHandler).toBeAFunction ();
      });

      // parameterized test
      for (var eventName in Cucumber.Listener.Events) {
        if(!Cucumber.Listener.Events.hasOwnProperty(eventName))
          continue;

        /* jshint -W083 */
        describe(eventName + ' event register handler method', function () {
          beforeEach(function () {
            spyOn(library, 'registerHandler');
          });

          it("is defined as a function", function () {
            expect(supportCodeHelper[eventName]).toBeAFunction ();
          });

          it("calls registerHandler with the eventName", function () {
            var handler = createSpy('handler');
            supportCodeHelper[eventName](handler);
            expect(library.registerHandler).toHaveBeenCalled();
            expect(library.registerHandler).toHaveBeenCalledWithValueAsNthParameter(eventName, 1);
            expect(library.registerHandler).toHaveBeenCalledWithValueAsNthParameter(handler, 2);
          });
        });
        /* jshint +W083 */
      }
    });
  });

  describe('Step Definitions', function () {
    var stepDefinitions;

    beforeEach(function () {
      stepDefinitions = [
        createSpyWithStubs("First step definition",  {matchesStepName:false}),
        createSpyWithStubs("Second step definition", {matchesStepName:false}),
        createSpyWithStubs("Third step definition",  {matchesStepName:false})
      ];
      spyOnStub(stepDefinitionCollection, 'syncForEach').andCallFake(function (cb) { stepDefinitions.forEach(cb); });
      library = Cucumber.SupportCode.Library(rawSupportCode);
    });

    describe("lookupStepDefinitionByName()", function () {
      var stepName;

      beforeEach(function () {
        stepName = createSpy("Step name");
      });

      it("asks each step definition in the library if they match the step name", function () {
        library.lookupStepDefinitionByName(stepName);
        stepDefinitions.forEach(function (stepDefinition) {
          expect(stepDefinition.matchesStepName).toHaveBeenCalledWith(stepName);
        });
      });

      it("returns the step definition that matches the name", function () {
        var matchingStepDefinition = stepDefinitions[1];
        matchingStepDefinition.matchesStepName.andReturn(true);
        expect(library.lookupStepDefinitionByName(stepName)).toBe(matchingStepDefinition);
      });
    });

    describe("isStepDefinitionNameDefined()", function () {
      var name;

      beforeEach(function () {
        name = createSpy("step name");
        spyOn(library, 'lookupStepDefinitionByName');
      });

      it("looks up the step definition by the name", function () {
        library.isStepDefinitionNameDefined(name);
        expect(library.lookupStepDefinitionByName).toHaveBeenCalledWith(name);
      });

      describe("when a step definition is found", function () {
        var stepDefinition;

        beforeEach(function () {
          stepDefinition = createSpy("step definition");
          library.lookupStepDefinitionByName.andReturn(stepDefinition);
        });

        it("returns true", function () {
          expect(library.isStepDefinitionNameDefined(name)).toBeTruthy();
        });
      });

      describe("when no step definition is found", function () {
        beforeEach(function () {
          library.lookupStepDefinitionByName.andReturn(undefined);
        });

        it("returns false", function () {
          expect(library.isStepDefinitionNameDefined(name)).toBeFalsy();
        });
      });
    });

    describe("defineStep()", function () {
      var name, code, stepDefinition;

      beforeEach(function () {
        name           = createSpy("step definition name");
        code           = createSpy("step definition code");
        stepDefinition = createSpy("step definition");
        spyOn(Cucumber.SupportCode, 'StepDefinition').andReturn(stepDefinition);
        spyOnStub(stepDefinitionCollection, 'add');
      });

      it("creates a step definition with the name and code", function () {
        library.defineStep(name, code);
        expect(Cucumber.SupportCode.StepDefinition).toHaveBeenCalledWith(name, code);
      });

      it("adds the step definition to the step collection", function () {
        library.defineStep(name, code);
        expect(stepDefinitionCollection.add).toHaveBeenCalledWith(stepDefinition);
      });
    });
  });

  describe('Listener Support', function () {
    beforeEach(function () {
      spyOnStub(listenerCollection, 'add');
      library = Cucumber.SupportCode.Library(rawSupportCode);
    });

    describe('getListeners()', function () {
      it("returns a listener collection", function () {
        var listeners = library.getListeners();
        expect(listeners).toBeDefined();
      });
    });

    describe("registerListener()", function () {
      it("adds the listener to the listener collection", function () {
        var listener = createSpy('sample listener');
        library.registerListener(listener);
        expect(listenerCollection.add).toHaveBeenCalledWith(listener);
      });
    });

    describe('registerHandler()', function () {
      var eventName, handler, listener;

      beforeEach(function () {
        eventName = 'eventName';
        handler = createSpy('sampleHandler');
        listener = createSpyWithStubs("listener",  {setHandlerForEvent: null});
        spyOn(Cucumber, 'Listener').andReturn(listener);
        library.registerHandler(eventName, handler);
      });

      it('creates a listener to the listener collection', function () {
        expect(listener.setHandlerForEvent).toHaveBeenCalledWithValueAsNthParameter(eventName, 1);
        expect(listener.setHandlerForEvent).toHaveBeenCalledWithValueAsNthParameter(handler, 2);
      });

      it("adds the listener to the listener collection", function () {
        expect(listenerCollection.add).toHaveBeenCalled();
      });
    });
  });

  describe('Hook Methods', function () {
    beforeEach(function () {
      library = Cucumber.SupportCode.Library(rawSupportCode);
    });

    describe("defineAroundHook()", function () {
      var code, aroundHook;

      beforeEach(function () {
        code       = createSpy("hook code");
        aroundHook = createSpy("around hook");
        spyOn(Cucumber.SupportCode, 'AroundHook').andReturn(aroundHook);
        spyOnStub(aroundHookCollection, 'add');
      });

      describe("define around hook", function () {
        beforeEach(function () {
          library.defineAroundHook(code);
        });

        it("creates a around hook with the code", function () {
          expect(Cucumber.SupportCode.AroundHook).toHaveBeenCalledWith(code, {tags: []});
        });

        it("adds the around hook to the around hook collection", function () {
          expect(aroundHookCollection.add).toHaveBeenCalledWith(aroundHook);
        });
      });

      describe("define around hook with a tag group", function () {
        var tagGroup;

        beforeEach(function () {
          tagGroup = createSpy("tag group");
          library.defineAroundHook(tagGroup, code);
        });

        it("creates a around hook with the code", function () {
          expect(Cucumber.SupportCode.AroundHook).toHaveBeenCalledWith(code, {tags: [tagGroup]});
        });

        it("adds the around hook to the around hook collection", function () {
          expect(aroundHookCollection.add).toHaveBeenCalledWith(aroundHook);
        });
      });

      describe("define around hook with tag groups", function () {
        var tagGroup1, tagGroup2;

        beforeEach(function () {
          tagGroup1 = createSpy("tag group 1");
          tagGroup2 = createSpy("tag group 2");
          library.defineAroundHook(tagGroup1, tagGroup2, code);
        });

        it("creates a around hook with the code", function () {
          expect(Cucumber.SupportCode.AroundHook).toHaveBeenCalledWith(code, {tags: [tagGroup1, tagGroup2]});
        });

        it("adds the around hook to the around hook collection", function () {
          expect(aroundHookCollection.add).toHaveBeenCalledWith(aroundHook);
        });
      });
    });

    describe("defineBeforeHook()", function () {
      var code, hook;

      beforeEach(function () {
        code = createSpy("hook code");
        hook = createSpy("hook");
        spyOn(Cucumber.SupportCode, 'Hook').andReturn(hook);
        spyOnStub(beforeHookCollection, 'add');
      });

      describe("define before hook", function () {
        beforeEach(function () {
          library.defineBeforeHook(code);
        });

        it("creates a before hook with the code", function () {
          expect(Cucumber.SupportCode.Hook).toHaveBeenCalledWith(code, {tags: []});
        });

        it("adds the before hook to the before hook collection", function () {
          expect(beforeHookCollection.add).toHaveBeenCalledWith(hook);
        });
      });

      describe("define before hook with a tag group", function () {
        var tagGroup;

        beforeEach(function () {
          tagGroup = createSpy("tag group");
          library.defineBeforeHook(tagGroup, code);
        });

        it("creates a before hook with the code", function () {
          expect(Cucumber.SupportCode.Hook).toHaveBeenCalledWith(code, {tags: [tagGroup]});
        });

        it("adds the before hook to the before hook collection", function () {
          expect(beforeHookCollection.add).toHaveBeenCalledWith(hook);
        });
      });

      describe("define before hook with tag groups", function () {
        var tagGroup1, tagGroup2;

        beforeEach(function () {
          tagGroup1 = createSpy("tag group 1");
          tagGroup2 = createSpy("tag group 2");
          library.defineBeforeHook(tagGroup1, tagGroup2, code);
        });

        it("creates a before hook with the code", function () {
          expect(Cucumber.SupportCode.Hook).toHaveBeenCalledWith(code, {tags: [tagGroup1, tagGroup2]});
        });

        it("adds the before hook to the before hook collection", function () {
          expect(beforeHookCollection.add).toHaveBeenCalledWith(hook);
        });
      });
    });

    describe("defineAfterHook()", function () {
      var code, hook;

      beforeEach(function () {
        code = createSpy("hook code");
        hook = createSpy("hook");
        spyOn(Cucumber.SupportCode, 'Hook').andReturn(hook);
        spyOnStub(afterHookCollection, 'add');
      });

      describe("define after hook", function () {
        beforeEach(function () {
          library.defineAfterHook(code);
        });

        it("creates a after hook with the code", function () {
          expect(Cucumber.SupportCode.Hook).toHaveBeenCalledWith(code, {tags: []});
        });

        it("adds the after hook to the after hook collection", function () {
          expect(afterHookCollection.add).toHaveBeenCalledWith(hook);
        });
      });

      describe("define after hook with a tag group", function () {
        var tagGroup;

        beforeEach(function () {
          tagGroup = createSpy("tag group");
          library.defineAfterHook(tagGroup, code);
        });

        it("creates a after hook with the code", function () {
          expect(Cucumber.SupportCode.Hook).toHaveBeenCalledWith(code, {tags: [tagGroup]});
        });

        it("adds the after hook to the after hook collection", function () {
          expect(afterHookCollection.add).toHaveBeenCalledWith(hook);
        });
      });

      describe("define after hook with tag groups", function () {
        var tagGroup1, tagGroup2;

        beforeEach(function () {
          tagGroup1 = createSpy("tag group 1");
          tagGroup2 = createSpy("tag group 2");
          library.defineAfterHook(tagGroup1, tagGroup2, code);
        });

        it("creates a after hook with the code", function () {
          expect(Cucumber.SupportCode.Hook).toHaveBeenCalledWith(code, {tags: [tagGroup1, tagGroup2]});
        });

        it("adds the after hook to the after hook collection", function () {
          expect(afterHookCollection.add).toHaveBeenCalledWith(hook);
        });
      });
    });

    describe("lookupAroundHooksByScenario()", function () {
      var returnValue, scenario, matchingHooks;

      beforeEach(function () {
        scenario      = createSpy("scenario");
        matchingHooks = createSpy("hooks");
        spyOn(library, "lookupHooksByScenario").andReturn(matchingHooks);

        returnValue = library.lookupAroundHooksByScenario(scenario);
      });

      it("looks up the around hooks by scenario", function () {
        expect(library.lookupHooksByScenario).toHaveBeenCalledWith(aroundHookCollection, scenario);
      });

      it("returns the matching hooks", function () {
        expect(returnValue).toBe(matchingHooks);
      });
    });

    describe("lookupBeforeHooksByScenario()", function () {
      var returnValue, scenario, matchingHooks;

      beforeEach(function () {
        scenario      = createSpy("scenario");
        matchingHooks = createSpy("hooks");
        spyOn(library, "lookupHooksByScenario").andReturn(matchingHooks);

        returnValue = library.lookupBeforeHooksByScenario(scenario);
      });

      it("looks up the around hooks by scenario", function () {
        expect(library.lookupHooksByScenario).toHaveBeenCalledWith(beforeHookCollection, scenario);
      });

      it("returns the matching hooks", function () {
        expect(returnValue).toBe(matchingHooks);
      });
    });

    describe("lookupAfterHooksByScenario()", function () {
      var returnValue, scenario, matchingHooks;

      beforeEach(function () {
        scenario      = createSpy("scenario");
        matchingHooks = createSpy("hooks");
        spyOn(library, "lookupHooksByScenario").andReturn(matchingHooks);

        returnValue = library.lookupAfterHooksByScenario(scenario);
      });

      it("looks up the around hooks by scenario", function () {
        expect(library.lookupHooksByScenario).toHaveBeenCalledWith(afterHookCollection, scenario);
      });

      it("returns the matching hooks", function () {
        expect(returnValue).toBe(matchingHooks);
      });
    });

    describe("lookupHooksByScenario()", function () {
      var hookCollection, scenario, matchingHookCollection, returnValue;

      beforeEach(function () {
        hookCollection         = createSpyWithStubs("hook collection", {syncForEach: undefined});
        scenario               = createSpy("scenario");
        matchingHookCollection = createSpyWithStubs("matching hook collection", {add: undefined});
        collectionSpy.andReturn(matchingHookCollection);

        returnValue = library.lookupHooksByScenario(hookCollection, scenario);
      });

      it("iterates over the hooks", function () {
        expect(hookCollection.syncForEach).toHaveBeenCalled();
        expect(hookCollection.syncForEach).toHaveBeenCalledWithAFunctionAsNthParameter(1);
      });

      it("returns the matching hooks", function () {
        expect(returnValue).toBe(matchingHookCollection);
      });

      describe("for each hook in the collection", function () {
        var hook, syncForEachUserFunction;

        beforeEach(function () {
          hook = createSpyWithStubs("hook", {appliesToScenario: undefined});
          syncForEachUserFunction = hookCollection.syncForEach.mostRecentCall.args[0];
        });

        it("checks whether the hook applies to the scenario", function () {
          syncForEachUserFunction (hook);
          expect(hook.appliesToScenario).toHaveBeenCalledWith(scenario);
        });

        describe("when the hook matches the scenario", function () {
          beforeEach(function () {
            spyOnStub(hook, "appliesToScenario").andReturn(true);
            syncForEachUserFunction (hook);
          });

          it("adds the hook to the collection of matching hooks", function () {
            expect(matchingHookCollection.add).toHaveBeenCalledWith(hook);
          });
        });

        describe("when the hook does not match the scenario", function () {
          beforeEach(function () {
            spyOnStub(hook, "appliesToScenario").andReturn(false);
            syncForEachUserFunction (hook);
          });

          it("adds the hook to the collection of matching hooks", function () {
            expect(matchingHookCollection.add).not.toHaveBeenCalledWith(hook);
          });
        });
      });
    });
  });

  describe('World construction', function () {
    beforeEach(function () {
      library = Cucumber.SupportCode.Library(rawSupportCode);
    });

    describe("instantiateNewWorld()", function () {
      var worldInstance, callback;

      beforeEach(function () {
        worldInstance = null;
        worldConstructor.andCallFake(function (callback) {
          worldInstance = this;
          if (callback)
            callback();
        });
        callback = createSpy("callback");
      });

      it("creates a new instance of the World and give it a callback", function () {
        library.instantiateNewWorld(callback);
        expect(worldConstructor).toHaveBeenCalled();
        expect(worldConstructor).toHaveBeenCalledWithAFunctionAsNthParameter(1);
        expect(worldInstance.constructor).toBe(worldConstructor);
      });

      describe("world constructor callback", function () {
        var worldConstructorCompletionCallback;

        beforeEach(function () {
          library.instantiateNewWorld(callback);
          worldConstructorCompletionCallback = worldConstructor.mostRecentCall.args[0];
          spyOn(process, 'nextTick');
        });

        it("registers a function for the next tick (to get out of the constructor call)", function () {
          worldConstructorCompletionCallback();
          expect(process.nextTick).toHaveBeenCalledWithAFunctionAsNthParameter(1);
        });

        describe("next tick registered function", function () {
          var nextTickFunction;

          describe("when the world constructor called back without any argument", function () {
            beforeEach(function () {
              worldConstructorCompletionCallback();
              nextTickFunction = process.nextTick.mostRecentCall.args[0];
            });

            it("calls back with the world instance", function () {
              nextTickFunction ();
              expect(callback).toHaveBeenCalledWith(worldInstance);
            });
          });

          describe("when the world constructor called back with an explicit world object", function () {
            var explicitWorld;

            beforeEach(function () {
              explicitWorld = createSpy("explicit world object");
              worldConstructorCompletionCallback(explicitWorld);
              nextTickFunction = process.nextTick.mostRecentCall.args[0];
            });

            it("calls back with the world instance", function () {
              nextTickFunction ();
              expect(callback).toHaveBeenCalledWith(explicitWorld);
            });
          });

        });
      });
    });

    describe("when the default World constructor is replaced by a custom one", function () {
      it("instantiates a custom World", function () {
        var worldInstance;
        var worldReady             = false;
        var customWorldConstructor = function (callback) {
          callback();
        };
        rawSupportCode             = function () { this.World = customWorldConstructor; };
        library                    = Cucumber.SupportCode.Library(rawSupportCode);

        runs(function () {
          library.instantiateNewWorld(function (world) {
            worldInstance = world;
            worldReady = true;
          });
        });
        waitsFor(function () {
          return worldReady;
        }, "world instance constructor", 300);
        runs(function () {
          expect(worldInstance.constructor).toBe(customWorldConstructor);
        });
      });
    });
  });
});
