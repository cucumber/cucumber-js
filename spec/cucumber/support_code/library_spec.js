require('../../support/spec_helper');

describe("Cucumber.SupportCode.Library", function () {
  var Cucumber = requireLib('cucumber');
  var library, rawSupportCode;

  beforeEach(function () {
    rawSupportCode = createSpy("Raw support code");
  });

  describe("constructor", function () {
    beforeEach(function () {
      library = Cucumber.SupportCode.Library(rawSupportCode);
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
    describe("lookupStepDefinitionByName()", function () {
      var stepName, stepDefinition1, stepDefinition2, stepDefinition3;

      beforeEach(function () {
        stepName = 'step name';
        stepDefinition1 = createSpyWithStubs("step definition 1", {matchesStepName: false});
        stepDefinition2 = createSpyWithStubs("step definition 2", {matchesStepName: true});
        stepDefinition3 = createSpyWithStubs("step definition 3", {matchesStepName: false});
        spyOn(Cucumber.SupportCode, 'StepDefinition').and.returnValues(stepDefinition1, stepDefinition2, stepDefinition3);
        library.defineStep();
        library.defineStep();
        library.defineStep();
      });

      it("checks whether each step defintion matches the step name", function () {
        library.lookupStepDefinitionByName(stepName);
        expect(stepDefinition1.matchesStepName).toHaveBeenCalledWith(stepName);
        expect(stepDefinition2.matchesStepName).toHaveBeenCalledWith(stepName);
        expect(stepDefinition3.matchesStepName).toHaveBeenCalledWith(stepName);
      });

      it("returns the matching hooks", function () {
        var result = library.lookupStepDefinitionByName(stepName);
        expect(result).toEqual(stepDefinition2);
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
      });

      describe('without options', function () {
        beforeEach(function () {
          library.defineStep(name, code);
        });

        it("creates a step definition with the name, empty options, and code", function () {
          expect(Cucumber.SupportCode.StepDefinition).toHaveBeenCalledWith(name, {}, code);
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
      });
    });
  });

  describe('Listener Support', function () {
    beforeEach(function () {
      library = Cucumber.SupportCode.Library(rawSupportCode);
    });

    describe('getListeners()', function () {
      describe('without any listeners registered', function () {
        it("returns an empty array", function () {
          expect(library.getListeners()).toEqual([]);
        });
      });

      describe('with a listeners registered', function () {
        var listener;

        beforeEach(function () {
          listener = createSpy('sample listener');
          library.registerListener(listener);
        });

        it("returns the registered listeners", function () {
          expect(library.getListeners()).toEqual([listener]);
        });
      });
    });

    describe('registerHandler()', function () {
      var eventName, handler, listener;

      beforeEach(function () {
        eventName = 'eventName';
        handler = createSpy('sampleHandler');
        listener = createSpyWithStubs("listener",  {setHandlerForEvent: null});
        spyOn(Cucumber, 'Listener').and.returnValue(listener);
        spyOn(library, 'registerListener');
        library.registerHandler(eventName, handler);
      });

      it('creates a listener to the listener collection', function () {
        expect(listener.setHandlerForEvent).toHaveBeenCalledWithValueAsNthParameter(eventName, 1);
        expect(listener.setHandlerForEvent).toHaveBeenCalledWithValueAsNthParameter(handler, 2);
      });

      it("registers the listener", function () {
        expect(library.registerListener).toHaveBeenCalledWith(listener);
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
      });

      describe("define around hook", function () {
        beforeEach(function () {
          library.defineAroundHook(code);
        });

        it("creates a around hook with the code", function () {
          expect(Cucumber.SupportCode.AroundHook).toHaveBeenCalledWith(code, {tags: []});
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
      });
    });

    describe("defineBeforeHook()", function () {
      var code, hook;

      beforeEach(function () {
        code = createSpy("hook code");
        hook = createSpy("hook");
        spyOn(Cucumber.SupportCode, 'Hook').and.returnValue(hook);
      });

      describe("define before hook", function () {
        beforeEach(function () {
          library.defineBeforeHook(code);
        });

        it("creates a before hook with the code", function () {
          expect(Cucumber.SupportCode.Hook).toHaveBeenCalledWith(code, {tags: []});
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
      });
    });

    describe("defineAfterHook()", function () {
      var code, hook;

      beforeEach(function () {
        code = createSpy("hook code");
        hook = createSpy("hook");
        spyOn(Cucumber.SupportCode, 'Hook').and.returnValue(hook);
      });

      describe("define after hook", function () {
        beforeEach(function () {
          library.defineAfterHook(code);
        });

        it("creates a after hook with the code", function () {
          expect(Cucumber.SupportCode.Hook).toHaveBeenCalledWith(code, {tags: []});
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
      });
    });

    describe("lookupAroundHooksByScenario()", function () {
      var scenario, aroundHook1, aroundHook2, aroundHook3;

      beforeEach(function () {
        scenario = createSpy('scenario');
        aroundHook1 = createSpyWithStubs("around hook 1", {appliesToScenario: true});
        aroundHook2 = createSpyWithStubs("around hook 2", {appliesToScenario: false});
        aroundHook3 = createSpyWithStubs("around hook 3", {appliesToScenario: true});
        spyOn(Cucumber.SupportCode, 'AroundHook').and.returnValues(aroundHook1, aroundHook2, aroundHook3);
        library.defineAroundHook();
        library.defineAroundHook();
        library.defineAroundHook();
      });

      it("checks whether each around hook applies to the scenario", function () {
        library.lookupAroundHooksByScenario(scenario);
        expect(aroundHook1.appliesToScenario).toHaveBeenCalledWith(scenario);
        expect(aroundHook2.appliesToScenario).toHaveBeenCalledWith(scenario);
        expect(aroundHook3.appliesToScenario).toHaveBeenCalledWith(scenario);
      });

      it("returns the matching hooks", function () {
        var result = library.lookupAroundHooksByScenario(scenario);
        expect(result).toEqual([aroundHook1, aroundHook3]);
      });
    });

    describe("lookupBeforeHooksByScenario()", function () {
      var scenario, beforeHook1, beforeHook2, beforeHook3;

      beforeEach(function () {
        scenario = createSpy('scenario');
        beforeHook1 = createSpyWithStubs("before hook 1", {appliesToScenario: true});
        beforeHook2 = createSpyWithStubs("before hook 2", {appliesToScenario: false});
        beforeHook3 = createSpyWithStubs("before hook 3", {appliesToScenario: true});
        spyOn(Cucumber.SupportCode, 'Hook').and.returnValues(beforeHook1, beforeHook2, beforeHook3);
        library.defineBeforeHook();
        library.defineBeforeHook();
        library.defineBeforeHook();
      });

      it("checks whether each before hook applies to the scenario", function () {
        library.lookupBeforeHooksByScenario(scenario);
        expect(beforeHook1.appliesToScenario).toHaveBeenCalledWith(scenario);
        expect(beforeHook2.appliesToScenario).toHaveBeenCalledWith(scenario);
        expect(beforeHook3.appliesToScenario).toHaveBeenCalledWith(scenario);
      });

      it("returns the matching hooks", function () {
        var result = library.lookupBeforeHooksByScenario(scenario);
        expect(result).toEqual([beforeHook1, beforeHook3]);
      });
    });

    describe("lookupAfterHooksByScenario()", function () {
      var scenario, afterHook1, afterHook2, afterHook3;

      beforeEach(function () {
        scenario = createSpy('scenario');
        afterHook1 = createSpyWithStubs("after hook 1", {appliesToScenario: true});
        afterHook2 = createSpyWithStubs("after hook 2", {appliesToScenario: false});
        afterHook3 = createSpyWithStubs("after hook 3", {appliesToScenario: true});
        spyOn(Cucumber.SupportCode, 'Hook').and.returnValues(afterHook1, afterHook2, afterHook3);
        library.defineAfterHook();
        library.defineAfterHook();
        library.defineAfterHook();
      });

      it("checks whether each after hook applies to the scenario", function () {
        library.lookupAfterHooksByScenario(scenario);
        expect(afterHook1.appliesToScenario).toHaveBeenCalledWith(scenario);
        expect(afterHook2.appliesToScenario).toHaveBeenCalledWith(scenario);
        expect(afterHook3.appliesToScenario).toHaveBeenCalledWith(scenario);
      });

      it("returns the matching hooks", function () {
        var result = library.lookupAfterHooksByScenario(scenario);
        expect(result).toEqual([afterHook1, afterHook3]);
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
