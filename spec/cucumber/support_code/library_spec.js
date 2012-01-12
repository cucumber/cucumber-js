require('../../support/spec_helper');

describe("Cucumber.SupportCode.Library", function() {
  var Cucumber = requireLib('cucumber');
  var library, rawSupportCode;
  var beforeHookCollection;
  var afterHookCollection;
  var stepDefinitionCollection;
  var worldConstructor;
  var spiesDuringSupportCodeDefinitionExecution = {};
  var worldConstructorCalled;

  beforeEach(function() {
    rawSupportCode       = createSpy("Raw support code");
    afterHookCollection  = Cucumber.Type.Collection();
    beforeHookCollection = Cucumber.Type.Collection();
    stepDefinitionCollection = [
      createSpyWithStubs("First step definition",  {matchesStepName:false}),
      createSpyWithStubs("Second step definition", {matchesStepName:false}),
      createSpyWithStubs("Third step definition",  {matchesStepName:false})
    ];
    worldConstructorCalled = false;
    worldConstructor = function() { worldConstructorCalled = true; };
    spyOnStub(stepDefinitionCollection, 'syncForEach').andCallFake(function(cb) { stepDefinitionCollection.forEach(cb); });
    spyOn(Cucumber.Type, 'Collection').andCallFake(function() {
      if (this.Collection.callCount == 1) {
        return beforeHookCollection;
      } else if (this.Collection.callCount == 2) {
        return afterHookCollection;
      } else {
        return stepDefinitionCollection;
      }
    });
    spyOn(Cucumber.SupportCode, 'WorldConstructor').andReturn(worldConstructor);
    library = Cucumber.SupportCode.Library(rawSupportCode);
  });

  describe("constructor", function() {
    it("creates a collection of step definitions", function() {
      expect(Cucumber.Type.Collection).toHaveBeenCalled();
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

      it("exposes a method to define Before methods", function() {
        expect(supportCodeHelper.Before).toBeAFunction();
        expect(supportCodeHelper.Before).toBe(library.defineBeforeHook);
      });

      it("exposes a method to define After methods", function() {
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
      library  = Cucumber.SupportCode.Library(rawSupportCode);
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
      expect(Cucumber.SupportCode.Hook).toHaveBeenCalledWith('before', code);
    });

    it("adds the before hook to the before hooks collection", function() {
      library.defineBeforeHook(code);
      expect(beforeHookCollection.add).toHaveBeenCalledWith(beforeHook);
    });
  });

  describe("triggerBeforeHooks", function() {
    var beforeHook, callback, code, invokeSpy, world;

    beforeEach(function() {
      code       = createSpy("before code");
      world      = library.instantiateNewWorld();
      callback   = createSpy("callback");
      beforeHook = createSpy("before hook");
      invokeSpy  = spyOnStub(beforeHook, "invoke");
      spyOn(Cucumber.SupportCode, "Hook").andReturn(beforeHook);
      library.defineBeforeHook(code);
    });

    it("triggers each before hook", function() {
      library.triggerBeforeHooks(world, function() {
        expect(beforeHook, "invoke").
          toHaveBeenCalledWithValueAsNthParameter(world, 1);
        expect(beforeHook, "invoke").
          toHaveBeenCalledWithAFunctionAsNthParameter(2);
      });
    });

    it("calls the callback when finished", function() {
      invokeSpy.andCallFake(function(world, callback) { callback(); });
      library.triggerBeforeHooks(world, callback);
      expect(callback).toHaveBeenCalled();
    });
  });

  describe("defineAfterHook", function() {
    var code, afterHook;

    beforeEach(function() {
      code      = createSpy("after code");
      afterHook = createSpy("after hook");
      spyOn(Cucumber.SupportCode, "Hook").andReturn(afterHook);
      spyOnStub(afterHookCollection, "unshift");
    });

    it("creates a after hook with the code", function() {
      library.defineAfterHook(code);
      expect(Cucumber.SupportCode.Hook).toHaveBeenCalledWith('after', code);
    });

    it("unshifts the after hook to the after hooks collection", function() {
      library.defineAfterHook(code);
      expect(afterHookCollection.unshift).toHaveBeenCalledWith(afterHook);
    });
  });

  describe("triggerAfterHooks", function() {
    var afterHook, callback, code, invokeSpy, world;

    beforeEach(function() {
      code      = createSpy("after code");
      world     = library.instantiateNewWorld();
      callback  = createSpy("callback");
      afterHook = createSpy("after hook");
      invokeSpy = spyOnStub(afterHook, "invoke");
      spyOn(Cucumber.SupportCode, "Hook").andReturn(afterHook);
      library.defineAfterHook(code);
    });

    it("triggers each after hook", function() {
      library.triggerAfterHooks(world, function() {
        expect(afterHook, "invoke").
          toHaveBeenCalledWithValueAsNthParameter(world, 1);
        expect(afterHook, "invoke").
          toHaveBeenCalledWithAFunctionAsNthParameter(2);
      });
    });

    it("calls the callback when finished", function() {
      invokeSpy.andCallFake(function(world, callback) { callback(); });
      library.triggerAfterHooks(world, callback);
      expect(callback).toHaveBeenCalled();
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
    it("creates a new instance of the World", function() {
      library.instantiateNewWorld();
      expect(worldConstructorCalled).toBeTruthy();
    });

    it("returns the instance of the World", function() {
      var worldInstance = library.instantiateNewWorld();
      expect(worldInstance.constructor).toBe(worldConstructor);
    });

    describe("when the default World constructor is replaced by a custom one", function() {
      it("instantiates custom Worlds", function() {
        var customWorldConstructor = function customWorldConstructor() {};
        rawSupportCode             = function() { this.World = customWorldConstructor; };
        library                    = Cucumber.SupportCode.Library(rawSupportCode);
        var worldInstance = library.instantiateNewWorld();
        expect(worldInstance.constructor).toBe(customWorldConstructor);
      });
    });
  });
});

