require('../../support/spec_helper');

describe("Cucumber.SupportCode.Library", function () {
  var Cucumber = requireLib('cucumber');
  var library, rawSupportCode;
  var listenerCollection, stepDefinitionCollection, aroundHookCollection, beforeHookCollection, afterHookCollection;
  var collectionSpy;

  beforeEach(function () {
    rawSupportCode           = createSpy("Raw support code");
    listenerCollection       = createSpy("listener collection");
    stepDefinitionCollection = createSpy("step definition collection");
    aroundHookCollection     = createSpy("around hook collection");
    beforeHookCollection     = createSpy("before hook collection");
    afterHookCollection      = createSpy("after hook collection");
    collectionSpy            = spyOn(Cucumber.Type, 'Collection').and.returnValues.apply(null, [listenerCollection, stepDefinitionCollection, aroundHookCollection, beforeHookCollection, afterHookCollection]);
  });

  describe("constructor", function () {
    beforeEach(function () {
      library = Cucumber.SupportCode.Library(rawSupportCode);
    });

    it("creates a collection of step definitions", function () {
      expect(Cucumber.Type.Collection).toHaveBeenCalledTimes(5);
    });

    it("executes the raw support code", function () {
      expect(rawSupportCode).toHaveBeenCalled();
    });

    it("executes the raw support code with a support code helper as 'this'", function () {
      expect(rawSupportCode.calls.mostRecent().object).toBeDefined();
    });

    describe("code support helper", function () {
      var supportCodeHelper;

      beforeEach(function () {
        supportCodeHelper = rawSupportCode.calls.mostRecent().object;
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
        expect(supportCodeHelper.World).toBeAFunction();
      });

      it("exposes a method to register a listener", function () {
        expect(supportCodeHelper.registerListener).toBeAFunction();
      });

      it("exposes a method to register a handler", function () {
        expect(supportCodeHelper.registerHandler).toBeAFunction();
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
      spyOnStub(stepDefinitionCollection, 'forEach').and.callFake(function (cb) { stepDefinitions.forEach(cb); });
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
        matchingStepDefinition.matchesStepName.and.returnValue(true);
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
          library.lookupStepDefinitionByName.and.returnValue(stepDefinition);
        });

        it("returns true", function () {
          expect(library.isStepDefinitionNameDefined(name)).toBeTruthy();
        });
      });

      describe("when no step definition is found", function () {
        beforeEach(function () {
          library.lookupStepDefinitionByName.and.returnValue(undefined);
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
        spyOn(Cucumber.SupportCode, 'StepDefinition').and.returnValue(stepDefinition);
        spyOnStub(stepDefinitionCollection, 'add');
      });

      describe('without options', function () {
        beforeEach(function () {
          library.defineStep(name, code);
        });

        it("creates a step definition with the name, empty options, and code", function () {
          expect(Cucumber.SupportCode.StepDefinition).toHaveBeenCalledWith(name, {}, code);
        });

        it("adds the step definition to the step collection", function () {
          expect(stepDefinitionCollection.add).toHaveBeenCalledWith(stepDefinition);
        });
      });

      describe('with options', function () {
        var options;

        beforeEach(function () {
          options = {some: 'data'};
          library.defineStep(name, options, code);
        });

        it("creates a step definition with the name, options, and code", function () {
          expect(Cucumber.SupportCode.StepDefinition).toHaveBeenCalledWith(name, options, code);
        });

        it("adds the step definition to the step collection", function () {
          expect(stepDefinitionCollection.add).toHaveBeenCalledWith(stepDefinition);
        });
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
        spyOn(Cucumber, 'Listener').and.returnValue(listener);
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
        spyOn(Cucumber.SupportCode, 'AroundHook').and.returnValue(aroundHook);
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
        spyOn(Cucumber.SupportCode, 'Hook').and.returnValue(hook);
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
        spyOn(Cucumber.SupportCode, 'Hook').and.returnValue(hook);
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
        spyOn(library, "lookupHooksByScenario").and.returnValue(matchingHooks);

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
        spyOn(library, "lookupHooksByScenario").and.returnValue(matchingHooks);

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
        spyOn(library, "lookupHooksByScenario").and.returnValue(matchingHooks);

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
        hookCollection         = createSpyWithStubs("hook collection", {forEach: undefined});
        scenario               = createSpy("scenario");
        matchingHookCollection = createSpyWithStubs("matching hook collection", {add: undefined});
        collectionSpy.and.returnValue(matchingHookCollection);

        returnValue = library.lookupHooksByScenario(hookCollection, scenario);
      });

      it("iterates over the hooks", function () {
        expect(hookCollection.forEach).toHaveBeenCalled();
        expect(hookCollection.forEach).toHaveBeenCalledWithAFunctionAsNthParameter(1);
      });

      it("returns the matching hooks", function () {
        expect(returnValue).toBe(matchingHookCollection);
      });

      describe("for each hook in the collection", function () {
        var hook, forEachUserFunction;

        beforeEach(function () {
          hook = createSpyWithStubs("hook", {appliesToScenario: undefined});
          forEachUserFunction = hookCollection.forEach.calls.mostRecent().args[0];
        });

        it("checks whether the hook applies to the scenario", function () {
          forEachUserFunction (hook);
          expect(hook.appliesToScenario).toHaveBeenCalledWith(scenario);
        });

        describe("when the hook matches the scenario", function () {
          beforeEach(function () {
            spyOnStub(hook, "appliesToScenario").and.returnValue(true);
            forEachUserFunction (hook);
          });

          it("adds the hook to the collection of matching hooks", function () {
            expect(matchingHookCollection.add).toHaveBeenCalledWith(hook);
          });
        });

        describe("when the hook does not match the scenario", function () {
          beforeEach(function () {
            spyOnStub(hook, "appliesToScenario").and.returnValue(false);
            forEachUserFunction (hook);
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
      it("creates a new instance of the World", function () {
        library.instantiateNewWorld(function (world) {
          expect(typeof world).toBe('object');
        });
      });
    });

    describe("when the default World constructor is replaced by a custom one", function () {
      it("instantiates a custom World", function (done) {
        var customWorldConstructor = function () {};
        rawSupportCode             = function () { this.World = customWorldConstructor; };
        library                    = Cucumber.SupportCode.Library(rawSupportCode);

        library.instantiateNewWorld(function (world) {
          expect(world.constructor).toBe(customWorldConstructor);
          done();
        });
      });
    });
  });
});
