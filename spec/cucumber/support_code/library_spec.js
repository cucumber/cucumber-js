require('../../support/spec_helper');

describe("Cucumber.SupportCode.Library", function() {
  var Cucumber = requireLib('cucumber');
  var library, rawSupportCode;
  var stepDefinitionCollection;
  var worldConstructor;
  var spiesDuringSupportCodeDefinitionExecution = {};

  beforeEach(function() {
    rawSupportCode = createSpy("Raw support code");
    stepDefinitionCollection = [
      createSpyWithStubs("First step definition",  {matchesStepName:false}),
      createSpyWithStubs("Second step definition", {matchesStepName:false}),
      createSpyWithStubs("Third step definition",  {matchesStepName:false})
    ];
    worldConstructor = createSpy("world constructor");
    spyOnStub(stepDefinitionCollection, 'syncForEach').andCallFake(function(cb) { stepDefinitionCollection.forEach(cb); });
    spyOn(Cucumber.Type, 'Collection').andReturn(stepDefinitionCollection);
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
        world = createSpy("world instance");
        spyOn(process, 'nextTick');
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

