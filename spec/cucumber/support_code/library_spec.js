require('../../support/spec_helper');

describe("Cucumber.SupportCode.Library", function() {
  var Cucumber = requireLib('cucumber');
  var library, rawSupportCode, hooker;
  var stepDefinitionCollection;
  var worldConstructor;

  beforeEach(function() {
    rawSupportCode = createSpy("Raw support code");
    stepDefinitionCollection = [
      createSpyWithStubs("First step definition",  {matchesStepName:false}),
      createSpyWithStubs("Second step definition", {matchesStepName:false}),
      createSpyWithStubs("Third step definition",  {matchesStepName:false})
    ];
    hooker           = createSpyWithStubs("hooker");
    worldConstructor = createSpy("world constructor");
    spyOnStub(stepDefinitionCollection, 'syncForEach').andCallFake(function(cb) { stepDefinitionCollection.forEach(cb); });
    spyOn(Cucumber.Type, 'Collection').andReturn(stepDefinitionCollection);
    spyOn(Cucumber.SupportCode.Library, 'Hooker').andReturn(hooker);
    spyOn(Cucumber.SupportCode, 'WorldConstructor').andReturn(worldConstructor);
    library = Cucumber.SupportCode.Library(rawSupportCode);
  });

  describe("constructor", function() {
    it("creates a collection of step definitions", function() {
      expect(Cucumber.Type.Collection).toHaveBeenCalled();
    });

    it("instantiates a hooker", function() {
      expect(Cucumber.SupportCode.Library.Hooker).toHaveBeenCalled();
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

      it("exposes a method to define Around hooks", function() {
        expect(supportCodeHelper.Around).toBeAFunction();
        expect(supportCodeHelper.Around).toBe(library.defineAroundHook);
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

  describe("hookUpFunction()", function() {
    var userFunction, scenario, world, hookedUpFunction;

    beforeEach(function() {
      userFunction     = createSpy("user function");
      hookedUpFunction = createSpy("hooked up function");
      scenario         = createSpy("scenario");
      world            = createSpy("world instance");
      spyOnStub(hooker, 'hookUpFunction').andReturn(hookedUpFunction);
    });

    it("hooks up the function with the world instance", function() {
      library.hookUpFunction(userFunction, scenario, world);
      expect(hooker.hookUpFunction).toHaveBeenCalledWith(userFunction, scenario, world);
    });

    it("returns the hooked up function", function() {
      expect(library.hookUpFunction(userFunction, scenario, world)).toBe(hookedUpFunction);
    });
  });

  describe("defineAroundHook()", function() {
    var code;

    beforeEach(function() {
      code = createSpy("hook code");
      spyOnStub(hooker, 'addAroundHookCode');
    });

    it("instructs the hooker to use the code as an around hook", function() {
      library.defineAroundHook(code);
      expect(hooker.addAroundHookCode).toHaveBeenCalledWith(code, {tags: []});
    });

    it("instructs the hooker to use the code as an around hook with a tag group", function() {
      var tagGroup = createSpy("tag group");
      library.defineAroundHook(tagGroup, code);
      expect(hooker.addAroundHookCode).toHaveBeenCalledWith(code, {tags: [tagGroup]});
    });

    it("instructs the hooker to use the code as an around hook with tag groups", function() {
      var tagGroup1 = createSpy("tag group 1");
      var tagGroup2 = createSpy("tag group 2");
      library.defineAroundHook(tagGroup1, tagGroup2, code);
      expect(hooker.addAroundHookCode).toHaveBeenCalledWith(code, {tags: [tagGroup1, tagGroup2]});
    });
  });

  describe("defineBeforeHook()", function() {
    var code;

    beforeEach(function() {
      code = createSpy("hook code");
      spyOnStub(hooker, 'addBeforeHookCode');
    });

    it("instructs the hooker to use the code as an before hook", function() {
      library.defineBeforeHook(code);
      expect(hooker.addBeforeHookCode).toHaveBeenCalledWith(code, {tags: []});
    });

    it("instructs the hooker to use the code as an before hook with a tag group", function() {
      var tagGroup = createSpy("tag group");
      library.defineBeforeHook(tagGroup, code);
      expect(hooker.addBeforeHookCode).toHaveBeenCalledWith(code, {tags: [tagGroup]});
    });

    it("instructs the hooker to use the code as an before hook with tag groups", function() {
      var tagGroup1 = createSpy("tag group 1");
      var tagGroup2 = createSpy("tag group 2");
      library.defineBeforeHook(tagGroup1, tagGroup2, code);
      expect(hooker.addBeforeHookCode).toHaveBeenCalledWith(code, {tags: [tagGroup1, tagGroup2]});
    });
  });

  describe("defineAfterHook()", function() {
    var code;

    beforeEach(function() {
      code = createSpy("hook code");
      spyOnStub(hooker, 'addAfterHookCode');
    });

    it("instructs the hooker to use the code as an after hook", function() {
      library.defineAfterHook(code);
      expect(hooker.addAfterHookCode).toHaveBeenCalledWith(code, {tags: []});
    });

    it("instructs the hooker to use the code as an after hook with a tag group", function() {
      var tagGroup = createSpy("tag group");
      library.defineAfterHook(tagGroup, code);
      expect(hooker.addAfterHookCode).toHaveBeenCalledWith(code, {tags: [tagGroup]});
    });

    it("instructs the hooker to use the code as an after hook with tag groups", function() {
      var tagGroup1 = createSpy("tag group 1");
      var tagGroup2 = createSpy("tag group 2");
      library.defineAfterHook(tagGroup1, tagGroup2, code);
      expect(hooker.addAfterHookCode).toHaveBeenCalledWith(code, {tags: [tagGroup1, tagGroup2]});
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
    var worldInstance, callback;

    beforeEach(function() {
      worldInstance = null;
      worldConstructor.andCallFake(function(callback) {
        worldInstance = this;
        if (callback)
          callback();
      });
      callback = createSpy("callback");
    });

    it("creates a new instance of the World and give it a callback", function() {
      library.instantiateNewWorld(callback);
      expect(worldConstructor).toHaveBeenCalled();
      expect(worldConstructor).toHaveBeenCalledWithAFunctionAsNthParameter(1);
      expect(worldInstance.constructor).toBe(worldConstructor);
    });

    describe("world constructor callback", function() {
      var worldConstructorCompletionCallback;

      beforeEach(function() {
        library.instantiateNewWorld(callback);
        worldConstructorCompletionCallback = worldConstructor.mostRecentCall.args[0];
        spyOn(process, 'nextTick');
      })

      it("registers a function for the next tick (to get out of the constructor call)", function() {
        worldConstructorCompletionCallback();
        expect(process.nextTick).toHaveBeenCalledWithAFunctionAsNthParameter(1);
      });

      describe("next tick registered function", function() {
        var nextTickFunction;

        describe("when the world constructor called back without any argument", function() {
          beforeEach(function() {
            worldConstructorCompletionCallback();
            nextTickFunction = process.nextTick.mostRecentCall.args[0];
          });

          it("calls back with the world instance", function() {
            nextTickFunction();
            expect(callback).toHaveBeenCalledWith(worldInstance);
          });
        });

        describe("when the world constructor called back with an explicit world object", function() {
          var explicitWorld;

          beforeEach(function() {
            explicitWorld = createSpy("explicit world object");
            worldConstructorCompletionCallback(explicitWorld);
            nextTickFunction = process.nextTick.mostRecentCall.args[0];
          });

          it("calls back with the world instance", function() {
            nextTickFunction();
            expect(callback).toHaveBeenCalledWith(explicitWorld);
          });
        });

      });
    });
  });

  describe("when the default World constructor is replaced by a custom one", function() {
    it("instantiates a custom World", function() {
      var worldInstance;
      var worldReady             = false;
      var customWorldConstructor = function(callback) {
        callback();
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
