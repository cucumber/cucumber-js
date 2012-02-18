require('../../support/spec_helper');

describe("Cucumber.SupportCode.Library", function() {
  var Cucumber = requireLib('cucumber');
  var library, rawSupportCode;
  var beforeHookCollection;
  var afterHookCollection;
  var stepDefinitionCollection;
  var worldConstructor;
  var spiesDuringSupportCodeDefinitionExecution = {};

  beforeEach(function() {
    rawSupportCode       = createSpy("Raw support code");
    beforeHookCollection = createSpy("before hook collection");
    afterHookCollection  = createSpy("after hook collection");
    stepDefinitionCollection = [
      createSpyWithStubs("First step definition",  {matchesStepName:false}),
      createSpyWithStubs("Second step definition", {matchesStepName:false}),
      createSpyWithStubs("Third step definition",  {matchesStepName:false})
    ];
    worldConstructor = createSpy("world constructor");
    spyOnStub(stepDefinitionCollection, 'syncForEach').andCallFake(function(cb) { stepDefinitionCollection.forEach(cb); });
    spyOn(Cucumber.Type, 'Collection').andReturnSeveral([beforeHookCollection, afterHookCollection, stepDefinitionCollection]);
    spyOn(Cucumber.SupportCode, 'WorldConstructor').andReturn(worldConstructor);
    library = Cucumber.SupportCode.Library(rawSupportCode);
  });

  describe("constructor", function() {
    it("creates collecitons of before hooks, after hooks and step definitions", function() {
      expect(Cucumber.Type.Collection).toHaveBeenCalled();
      expect(Cucumber.Type.Collection.callCount).toBe(3);
    });

    it("executes the raw support code", function() {
      expect(rawSupportCode).toHaveBeenCalled();
    });

    it("creates a new World constructor", function() {
      expect(Cucumber.SupportCode.WorldConstructor).toHaveBeenCalled();
    });

    it("executes the raw support code with a support code helper as 'this'", function() {
      expect(rawSupportCode.mostRecentCall.object).toBeDefined();
    });

    describe("code support helper", function() {
      var supportCodeHelper;

      beforeEach(function() {
        supportCodeHelper = rawSupportCode.mostRecentCall.object;
      });

      it("exposes a method to define Before hooks", function() {
        expect(supportCodeHelper.Before).toBeAFunction();
        expect(supportCodeHelper.Before).toBe(library.defineBeforeHook);
      });

      it("exposes a method to define After hooks", function() {
        expect(supportCodeHelper.After).toBeAFunction();
        expect(supportCodeHelper.After).toBe(library.defineAfterHook);
      });

      it("exposes a method to define Given steps", function() {
        expect(supportCodeHelper.Given).toBeAFunction();
        expect(supportCodeHelper.Given).toBe(library.defineStep);
      });

      it("exposes a method to define When steps", function() {
        expect(supportCodeHelper.When).toBeAFunction();
        expect(supportCodeHelper.When).toBe(library.defineStep);
      });

      it("exposes a method to define Then steps", function() {
        expect(supportCodeHelper.Then).toBeAFunction();
        expect(supportCodeHelper.Then).toBe(library.defineStep);
      });

      it("exposes a method to define any step", function() {
        expect(supportCodeHelper.defineStep).toBeAFunction();
        expect(supportCodeHelper.defineStep).toBe(library.defineStep);
      });

      it("exposes the World constructor", function() {
        expect(supportCodeHelper.World).toBe(worldConstructor);
      });
    });
  });

  describe("lookupStepDefinitionByName()", function() {
    var stepName;

    beforeEach(function() {
      stepName = createSpy("Step name");
    });

    it("asks each step definition in the library if they match the step name", function() {
      library.lookupStepDefinitionByName(stepName);
      stepDefinitionCollection.forEach(function(stepDefinition) {
        expect(stepDefinition.matchesStepName).toHaveBeenCalledWith(stepName);
      });
    });

    it("returns the step definition that matches the name", function() {
      var matchingStepDefinition = stepDefinitionCollection[1];
      matchingStepDefinition.matchesStepName.andReturn(true);
      expect(library.lookupStepDefinitionByName(stepName)).toBe(matchingStepDefinition);
    });
  });

  describe("isStepDefinitionNameDefined()", function() {
    var name;

    beforeEach(function() {
      name = createSpy("step name");
      spyOn(library, 'lookupStepDefinitionByName');
    });

    it("looks up the step definition by the name", function() {
      library.isStepDefinitionNameDefined(name);
      expect(library.lookupStepDefinitionByName).toHaveBeenCalledWith(name);
    });

    describe("when a step definition is found", function() {
      var stepDefinition;

      beforeEach(function() {
        stepDefinition = createSpy("step definition");
        library.lookupStepDefinitionByName.andReturn(stepDefinition);
      });

      it("returns true", function() {
        expect(library.isStepDefinitionNameDefined(name)).toBeTruthy();
      });
    });

    describe("when no step definition is found", function() {
      beforeEach(function() {
        library.lookupStepDefinitionByName.andReturn(undefined);
      });

      it("returns false", function() {
        expect(library.isStepDefinitionNameDefined(name)).toBeFalsy();
      });
    });
  });

  describe("defineBeforeHook", function() {
    var beforeHook, code;

    beforeEach(function() {
      code       = createSpy("before code");
      beforeHook = createSpy("before hook");
      spyOn(Cucumber.SupportCode, "Hook").andReturn(beforeHook);
      spyOnStub(beforeHookCollection, "add");
    });

    it("creates a before hook with the code", function() {
      library.defineBeforeHook(code);
      expect(Cucumber.SupportCode.Hook).toHaveBeenCalledWith(code);
    });

    it("adds the before hook to the before hooks collection", function() {
      library.defineBeforeHook(code);
      expect(beforeHookCollection.add).toHaveBeenCalledWith(beforeHook);
    });
  });

  describe("triggerBeforeHooks", function() {
    var world, callback;

    beforeEach(function() {
      world      = createSpy("world");
      callback   = createSpy("callback");
      spyOnStub(beforeHookCollection, 'forEach');
    });

    it("iterates over the before hooks", function() {
      library.triggerBeforeHooks(world, callback);
      expect(beforeHookCollection.forEach).toHaveBeenCalled();
      expect(beforeHookCollection.forEach).toHaveBeenCalledWithAFunctionAsNthParameter(1);
      expect(beforeHookCollection.forEach).toHaveBeenCalledWithValueAsNthParameter(callback, 2);
    });

    describe("for each before hook", function() {
      var beforeHook, forEachBeforeHookFunction, forEachBeforeHookFunctionCallback;

      beforeEach(function() {
        library.triggerBeforeHooks(world, callback);
        forEachBeforeHookFunction = beforeHookCollection.forEach.mostRecentCall.args[0];
        forEachBeforeHookFunctionCallback = createSpy("for each before hook iteration callback");
        beforeHook = createSpyWithStubs("before hook", {invoke: null});
      });

      it("invokes the hook", function() {
        forEachBeforeHookFunction(beforeHook, forEachBeforeHookFunctionCallback);
        expect(beforeHook.invoke).toHaveBeenCalledWith(world, forEachBeforeHookFunctionCallback);
      });
    });
  });

  describe("defineAfterHook", function() {
    var afterHook, code;

    beforeEach(function() {
      code      = createSpy("after code");
      afterHook = createSpy("after hook");
      spyOn(Cucumber.SupportCode, "Hook").andReturn(afterHook);
      spyOnStub(afterHookCollection, "unshift");
    });

    it("creates a after hook with the code", function() {
      library.defineAfterHook(code);
      expect(Cucumber.SupportCode.Hook).toHaveBeenCalledWith(code);
    });

    it("adds the after hook to the after hooks collection", function() {
      library.defineAfterHook(code);
      expect(afterHookCollection.unshift).toHaveBeenCalledWith(afterHook);
    });
  });

  describe("triggerAfterHooks", function() {
    var world, callback;

    beforeEach(function() {
      world      = createSpy("world");
      callback   = createSpy("callback");
      spyOnStub(afterHookCollection, 'forEach');
    });

    it("iterates over the after hooks", function() {
      library.triggerAfterHooks(world, callback);
      expect(afterHookCollection.forEach).toHaveBeenCalled();
      expect(afterHookCollection.forEach).toHaveBeenCalledWithAFunctionAsNthParameter(1);
      expect(afterHookCollection.forEach).toHaveBeenCalledWithValueAsNthParameter(callback, 2);
    });

    describe("for each after hook", function() {
      var afterHook, forEachAfterHookFunction, forEachAfterHookFunctionCallback;

      beforeEach(function() {
        library.triggerAfterHooks(world, callback);
        forEachAfterHookFunction = afterHookCollection.forEach.mostRecentCall.args[0];
        forEachAfterHookFunctionCallback = createSpy("for each after hook iteration callback");
        afterHook = createSpyWithStubs("after hook", {invoke: null});
      });

      it("invokes the hook", function() {
        forEachAfterHookFunction(afterHook, forEachAfterHookFunctionCallback);
        expect(afterHook.invoke).toHaveBeenCalledWith(world, forEachAfterHookFunctionCallback);
      });
    });
  });

  describe("defineStep()", function() {
    var name, code, stepDefinition;

    beforeEach(function() {
      name           = createSpy("step definition name");
      code           = createSpy("step definition code");
      stepDefinition = createSpy("step definition");
      spyOn(Cucumber.SupportCode, 'StepDefinition').andReturn(stepDefinition);
      spyOnStub(stepDefinitionCollection, 'add');
    });

    it("creates a step definition with the name and code", function() {
      library.defineStep(name, code);
      expect(Cucumber.SupportCode.StepDefinition).toHaveBeenCalledWith(name, code);
    });

    it("adds the step definition to the step collection", function() {
      library.defineStep(name, code);
      expect(stepDefinitionCollection.add).toHaveBeenCalledWith(stepDefinition);
    });
  });

  describe("instantiateNewWorld()", function() {
    var worldConstructorThis, callback;

    beforeEach(function() {
      worldConstructorThis = null;
      worldConstructor.andCallFake(function(callback) {
        worldConstructorThis = this;
        if (callback)
          callback(this);
      });
      callback = createSpy("callback");
    });

    it("creates a new instance of the World and give it a callback", function() {
      library.instantiateNewWorld(callback);
      expect(worldConstructor).toHaveBeenCalled();
      expect(worldConstructor).toHaveBeenCalledWithAFunctionAsNthParameter(1);
      expect(worldConstructorThis.constructor).toBe(worldConstructor);
    });

    describe("world constructor callback", function() {
      var worldConstructorCompletionCallback, world;

      beforeEach(function() {
        library.instantiateNewWorld(callback);
        worldConstructorCompletionCallback = worldConstructor.mostRecentCall.args[0];
        spyOn(process, 'nextTick');
      })

      describe("when the constructor called back with a world instance", function() {
        beforeEach(function() {
          world = createSpy("world instance");
        });

        it("registers a function for the next tick (to get out of the constructor call)", function() {
          worldConstructorCompletionCallback(world);
          expect(process.nextTick).toHaveBeenCalledWithAFunctionAsNthParameter(1);
        });

        describe("next tick registered function", function() {
          var nextTickFunction;

          beforeEach(function() {
            worldConstructorCompletionCallback(world);
            nextTickFunction = process.nextTick.mostRecentCall.args[0];
          });

          it("calls back with the world instance", function() {
            nextTickFunction();
            expect(callback).toHaveBeenCalledWith(world);
          });
        });
      });

      describe("when the constructor called back without a world instance", function() {
        it("does not register a function for the next tick", function() {
          try { worldConstructorCompletionCallback(null); } catch (e) {};
          expect(process.nextTick).not.toHaveBeenCalled();
        });

        it("throws an exception", function() {
          var expectedError = new Error("World constructor called back without World instance.");
          expect(function() { worldConstructorCompletionCallback(null); }).toThrow(expectedError);
        });
      });
    });

    describe("when the default World constructor is replaced by a custom one", function() {
      it("instantiates a custom World", function() {
        var worldInstance;
        var worldReady             = false;
        var customWorldConstructor = function(callback) {
          callback(this);
        };
        rawSupportCode             = function() { this.World = customWorldConstructor; };
        library                    = Cucumber.SupportCode.Library(rawSupportCode);

        runs(function() {
          library.instantiateNewWorld(function(world) {
            worldInstance = world;
            worldReady = true;
          });
        });
        waitsFor(function() {
          return worldReady;
        }, "world instance constructor", 300);
        runs(function() {
          expect(worldInstance.constructor).toBe(customWorldConstructor);
        });
      });
    });
  });
});
