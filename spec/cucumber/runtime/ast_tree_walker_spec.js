var domain = require('domain');
require('../../support/spec_helper');

describe("Cucumber.Runtime.AstTreeWalker", function () {
  var Cucumber = requireLib('cucumber');
  var beforeStepCollection, afterStepCollection, emptyHook;
  var walkDomain;
  var treeWalker, features, supportCodeLibrary, listeners, supportListeners, options;

  var createListener = function createListener(name) {
    var listener = createSpy(name);
    spyOnStub(listener, 'hear').and.callFake(function (event, cb) { cb(); });
    return listener;
  };

  beforeEach(function () {
    features             = createSpyWithStubs("Features AST element", {acceptVisitor: null});
    supportCodeLibrary   = createSpy("Support code library");
    listeners            = [createListener("First listener"), createListener("Second listener")];
    supportListeners     = [createListener("First support listener"), createListener("Second support listener")];
    walkDomain           = createSpy("walk domain");
    options              = {};
    spyOnStub(supportCodeLibrary, 'getListeners').and.returnValue(supportListeners);

    beforeStepCollection = createSpyWithStubs("before step collection", {add: undefined, unshift: undefined, clear: undefined, asyncForEach: undefined});
    afterStepCollection  = createSpyWithStubs("after step collection", {add: undefined, unshift: undefined, clear: undefined, asyncForEach: undefined});
    spyOn(Cucumber.Type, 'Collection').and.returnValues(beforeStepCollection, afterStepCollection);
    spyOn(Cucumber.SupportCode, "Hook").and.returnValue(emptyHook);
    spyOn(domain, 'create').and.returnValue(walkDomain);
    treeWalker           = Cucumber.Runtime.AstTreeWalker(features, supportCodeLibrary, listeners, options);
  });

  it("creates a domain", function () {
    expect(domain.create).toHaveBeenCalled();
  });

  describe("walk()", function () {
    var callback;

    beforeEach(function () {
      callback = createSpy("Callback");
      spyOn(treeWalker, 'visitFeatures');
    });

    describe("when the walk domain can be entered", function () {
      beforeEach(function () {
        spyOnStub(walkDomain, 'enter');
      });

      it("enters the domain", function () {
        treeWalker.walk(callback);
        expect(walkDomain.enter).toHaveBeenCalled();
      });
    });

    it("visits all features with a callback", function () {
      treeWalker.walk(callback);
      expect(treeWalker.visitFeatures).
        toHaveBeenCalledWithValueAsNthParameter(features, 1);
      expect(treeWalker.visitFeatures).
        toHaveBeenCalledWithAFunctionAsNthParameter(2);
    });

    describe("features visit callback", function () {
      var featuresVisitCallback;

      beforeEach(function () {
        treeWalker.walk(callback);
        featuresVisitCallback = treeWalker.visitFeatures.calls.mostRecent().args[1];
      });

      describe("when the walk domain can be exited", function () {
        beforeEach(function () {
          spyOnStub(walkDomain, 'exit');
        });

        it("exits the domain", function () {
          featuresVisitCallback();
          expect(walkDomain.exit).toHaveBeenCalled();
        });
      });

      describe("features are successful", function () {
        beforeEach(function () {
          featuresVisitCallback();
        });

        it("calls back with true", function () {
          expect(callback).toHaveBeenCalledWith(true);
        });
      });

      describe("features are unsuccessful", function () {
        beforeEach(function () {
          treeWalker.witnessNewScenario();
          var stepResult = createSpyWithStubs('stepResult', {getFailureException: null, getStatus: Cucumber.Status.FAILED});
          treeWalker.visitStepResult(stepResult, function () {});
          featuresVisitCallback();
        });

        it("calls back with false", function () {
          expect(callback).toHaveBeenCalledWith(false);
        });
      });
    });
  });

  describe("visitFeatures()", function () {
    var callback, event, payload;

    beforeEach(function () {
      callback = createSpy("Callback");
      event    = createSpy("Event");
      payload  = {features: features};
      spyOn(Cucumber.Runtime.AstTreeWalker, 'Event').and.returnValue(event);
      spyOn(treeWalker, 'broadcastEventAroundUserFunction');
    });

    it("creates a new event about the features' visit", function () {
      treeWalker.visitFeatures(features, callback);
      expect(Cucumber.Runtime.AstTreeWalker.Event).toHaveBeenCalledWith(Cucumber.Runtime.AstTreeWalker.FEATURES_EVENT_NAME, payload);
    });

    it("broadcasts the visit of the features", function () {
      treeWalker.visitFeatures(features, callback);
      expect(treeWalker.broadcastEventAroundUserFunction).toHaveBeenCalled();
      expect(treeWalker.broadcastEventAroundUserFunction).
        toHaveBeenCalledWithValueAsNthParameter(event, 1);
      expect(treeWalker.broadcastEventAroundUserFunction).
        toHaveBeenCalledWithAFunctionAsNthParameter(2);
      expect(treeWalker.broadcastEventAroundUserFunction).
        toHaveBeenCalledWithValueAsNthParameter(callback, 3);
    });

    describe("user function", function () {
      var userFunction, userFunctionCallback;

      beforeEach(function () {
        userFunctionCallback = createSpy("User function callback");
        treeWalker.visitFeatures(features, callback);
        userFunction = treeWalker.broadcastEventAroundUserFunction.calls.mostRecent().args[1];
      });


      it("visits the features, passing it the received callback", function () {
        userFunction (userFunctionCallback);
        expect(features.acceptVisitor).toHaveBeenCalledWith(treeWalker, userFunctionCallback);
      });
    });
  });

  describe("visitFeature()", function () {
    var feature, callback, event, payload;

    beforeEach(function () {
      feature     = createSpyWithStubs("Feature AST element", {acceptVisitor: null});
      callback    = createSpy("Callback");
      event       = createSpy("Event");
      payload     = {feature: feature};
      spyOn(Cucumber.Runtime.AstTreeWalker, 'Event').and.returnValue(event);
      spyOn(treeWalker, 'broadcastEventAroundUserFunction');
    });

    describe("when failing fast and a failure has already been encountered", function () {
      beforeEach(function() {
        options.failFast = true;
        treeWalker.witnessNewScenario();
        var stepResult = createSpyWithStubs('stepResult', {getFailureException: null, getStatus: Cucumber.Status.FAILED});
        treeWalker.visitStepResult(stepResult, function () {});
        treeWalker.visitFeature(feature, callback);
      });

      it('calls back', function () {
        expect(callback).toHaveBeenCalled();
      });

      it('does not broadcast the visit of the feature', function () {
        expect(treeWalker.broadcastEventAroundUserFunction).not.toHaveBeenCalled();
      });
    });

    it("creates a new event about the feature' visit", function () {
      treeWalker.visitFeature(feature, callback);
      expect(Cucumber.Runtime.AstTreeWalker.Event).toHaveBeenCalledWith(Cucumber.Runtime.AstTreeWalker.FEATURE_EVENT_NAME, payload);
    });

    it("broadcasts the visit of the feature", function () {
      treeWalker.visitFeature(feature, callback);
      expect(treeWalker.broadcastEventAroundUserFunction).toHaveBeenCalled();
      expect(treeWalker.broadcastEventAroundUserFunction).
        toHaveBeenCalledWithValueAsNthParameter(event, 1);
      expect(treeWalker.broadcastEventAroundUserFunction).
        toHaveBeenCalledWithAFunctionAsNthParameter(2);
      expect(treeWalker.broadcastEventAroundUserFunction).
        toHaveBeenCalledWithValueAsNthParameter(callback, 3);
    });

    describe("user function", function () {
      var userFunction, userFunctionCallback;

      beforeEach(function () {
        userFunctionCallback = createSpy("User function callback");
        treeWalker.visitFeature(feature, callback);
        userFunction = treeWalker.broadcastEventAroundUserFunction.calls.mostRecent().args[1];
      });

      it("visits the feature, passing it the received callback", function () {
        userFunction (userFunctionCallback);
        expect(feature.acceptVisitor).toHaveBeenCalledWith(treeWalker, userFunctionCallback);
      });
    });
  });

  describe("visitBackground()", function () {
    var background, scenario, callback, event, payload;

    beforeEach(function () {
      scenario = createSpyWithStubs('background AST element');
      callback = createSpy('callback');
      event    = createSpy('event');
      payload  = {background: background};
      spyOn(Cucumber.Runtime.AstTreeWalker, 'Event').and.returnValue(event);
      spyOn(treeWalker, 'broadcastEvent');
    });

    it("creates a new event about the background", function () {
      treeWalker.visitBackground(background, callback);
      expect(Cucumber.Runtime.AstTreeWalker.Event).toHaveBeenCalledWith(Cucumber.Runtime.AstTreeWalker.BACKGROUND_EVENT_NAME, payload);
    });

    it("broadcasts the visit of the background", function () {
      treeWalker.visitBackground(background, callback);
      expect(treeWalker.broadcastEvent).toHaveBeenCalledWith(event, callback);
    });
  });

  describe("visitScenario()", function () {
    var scenario, callback;

    beforeEach(function () {
      scenario = createSpyObj("scenario",['mock']);
      callback = createSpy("Callback");
      spyOnStub(supportCodeLibrary, 'instantiateNewWorld');
    });

    describe("when failing fast and a failure has already been encountered", function () {
      beforeEach(function() {
        options.failFast = true;
        treeWalker.witnessNewScenario();
        var stepResult = createSpyWithStubs('stepResult', {getFailureException: null, getStatus: Cucumber.Status.FAILED});
        treeWalker.visitStepResult(stepResult, function () {});
        treeWalker.visitScenario(scenario, callback);
      });

      it('calls back', function () {
        expect(callback).toHaveBeenCalled();
      });

      it('does not instantiate a new World instance', function () {
        expect(supportCodeLibrary.instantiateNewWorld).not.toHaveBeenCalled();
      });
    });

    it("instantiates a new World instance asynchronously", function () {
      treeWalker.visitScenario(scenario, callback);
      expect(supportCodeLibrary.instantiateNewWorld).toHaveBeenCalled();
      expect(supportCodeLibrary.instantiateNewWorld).toHaveBeenCalledWithAFunctionAsNthParameter(1);
    });

    describe("on world instantiation completion", function () {
      var worldInstantiationCompletionCallback;
      var world, event, payload;
      var hookedUpScenarioVisit;

      beforeEach(function () {
        treeWalker.visitScenario(scenario, callback);
        worldInstantiationCompletionCallback = supportCodeLibrary.instantiateNewWorld.calls.mostRecent().args[0];
        world                 = createSpy("world instance");
        event                 = createSpy("scenario visit event");
        hookedUpScenarioVisit = createSpy("hooked up scenario visit");
        payload               = {scenario: scenario};
        spyOn(treeWalker, 'setWorld');
        spyOn(treeWalker, 'witnessNewScenario');
        spyOn(treeWalker, 'createBeforeAndAfterStepsForAroundHooks');
        spyOn(treeWalker, 'createBeforeStepsForBeforeHooks');
        spyOn(treeWalker, 'createAfterStepsForAfterHooks');
        spyOn(Cucumber.Runtime.AstTreeWalker, 'Event').and.returnValue(event);
        spyOnStub(supportCodeLibrary, 'hookUpFunction').and.returnValue(hookedUpScenarioVisit);
        spyOn(treeWalker, 'broadcastEventAroundUserFunction');
      });

      it("sets the new World instance", function () {
        worldInstantiationCompletionCallback(world);
        expect(treeWalker.setWorld).toHaveBeenCalledWith(world);
      });

      it("witnesses a new scenario", function () {
        worldInstantiationCompletionCallback(world);
        expect(treeWalker.witnessNewScenario).toHaveBeenCalledWith(scenario);
      });

      it("creates before and after steps for around hooks", function () {
        worldInstantiationCompletionCallback(world);
        expect(treeWalker.createBeforeAndAfterStepsForAroundHooks).toHaveBeenCalledWith(scenario);
      });

      it("creates before steps for before hooks", function () {
        worldInstantiationCompletionCallback(world);
        expect(treeWalker.createBeforeStepsForBeforeHooks).toHaveBeenCalledWith(scenario);
      });

      it("creates after steps for after hooks", function () {
        worldInstantiationCompletionCallback(world);
        expect(treeWalker.createAfterStepsForAfterHooks).toHaveBeenCalledWith(scenario);
      });

      it("creates a new event about the scenario", function () {
        worldInstantiationCompletionCallback(world);
        expect(Cucumber.Runtime.AstTreeWalker.Event).toHaveBeenCalledWith(Cucumber.Runtime.AstTreeWalker.SCENARIO_EVENT_NAME, payload);
      });

      it("broadcasts the visit of the scenario", function () {
        worldInstantiationCompletionCallback(world);
        expect(treeWalker.broadcastEventAroundUserFunction).toHaveBeenCalled();
        expect(treeWalker.broadcastEventAroundUserFunction).toHaveBeenCalledWithValueAsNthParameter(event, 1);
        expect(treeWalker.broadcastEventAroundUserFunction).toHaveBeenCalledWithAFunctionAsNthParameter(2);
        expect(treeWalker.broadcastEventAroundUserFunction).toHaveBeenCalledWithValueAsNthParameter(callback, 3);
      });

      describe("on broadcast of the visit of the scenario", function () {
        var userFunction, userFunctionCallback;

        beforeEach(function () {
          worldInstantiationCompletionCallback(world);
          userFunction         = treeWalker.broadcastEventAroundUserFunction.calls.mostRecent().args[1];
          userFunctionCallback = createSpy("user function callback");
          spyOn(treeWalker, 'visitBeforeSteps');
          userFunction (userFunctionCallback);
        });

        it("visits the before steps", function () {
          expect(treeWalker.visitBeforeSteps).toHaveBeenCalled();
        });

        describe("after visiting the before steps", function () {
          beforeEach(function () {
            spyOnStub(scenario, 'acceptVisitor');
            var visitBeforeStepsCallback = treeWalker.visitBeforeSteps.calls.mostRecent().args[0];
            visitBeforeStepsCallback();
          });

          it("instructs the scenario to accept the tree walker as a visitor", function () {
            expect(scenario.acceptVisitor).toHaveBeenCalled();
            expect(scenario.acceptVisitor).toHaveBeenCalledWithValueAsNthParameter(treeWalker, 1);
          });

          describe("after visiting the scenario", function () {
            beforeEach(function () {
              spyOn(treeWalker, 'visitAfterSteps');
              var acceptVisitorCallback = scenario.acceptVisitor.calls.mostRecent().args[1];
              acceptVisitorCallback();
            });

            it("visits the after steps", function () {
              expect(treeWalker.visitAfterSteps).toHaveBeenCalled();
            });

            describe("after visiting the after steps", function () {
              beforeEach(function () {
                var visitAfterStepsCallback = treeWalker.visitAfterSteps.calls.mostRecent().args[0];
                visitAfterStepsCallback();
              });

              it("calls back", function () {
                expect(userFunctionCallback).toHaveBeenCalled();
              });
            });
          });
        });
      });
    });
  });

  describe("createBeforeAndAfterStepsForAroundHooks()", function () {
    var scenario, aroundHooks;

    beforeEach(function () {
      scenario    = createSpy("scenario");
      aroundHooks = createSpy("around hooks");
      spyOnStub(aroundHooks, "forEach");
      spyOnStub(supportCodeLibrary, 'lookupAroundHooksByScenario').and.returnValue(aroundHooks);

      treeWalker.createBeforeAndAfterStepsForAroundHooks(scenario);
    });

    it("looks up around hooks by scenario", function () {
      expect(supportCodeLibrary.lookupAroundHooksByScenario).toHaveBeenCalledWith(scenario);
    });

    it("iterates over the around hooks", function () {
      expect(aroundHooks.forEach).toHaveBeenCalled();
      expect(aroundHooks.forEach).toHaveBeenCalledWithAFunctionAsNthParameter(1);
    });

    describe("for each around hook", function () {
      var aroundHook, beforeStep, afterStep;

      beforeEach(function () {
        aroundHook = createSpyWithStubs("around hook", {setAfterStep: undefined});
        beforeStep = createSpyWithStubs("before step", {setHook: undefined});
        afterStep  = createSpyWithStubs("after step", {setHook: undefined});
        var forEachCallback = aroundHooks.forEach.calls.mostRecent().args[0];
        spyOn(Cucumber.Ast, "HookStep").and.returnValues.apply(null, [beforeStep, afterStep]);

        forEachCallback(aroundHook);
      });

      it("creates a before step and an after step", function () {
        expect(Cucumber.Ast.HookStep).toHaveBeenCalledTimes(2);
        expect(Cucumber.Ast.HookStep.calls.argsFor(0)).toEqual([Cucumber.Runtime.AstTreeWalker.AROUND_STEP_KEYWORD]);
        expect(Cucumber.Ast.HookStep.calls.argsFor(1)).toEqual([Cucumber.Runtime.AstTreeWalker.AROUND_STEP_KEYWORD]);
      });

      it("sets the around hook as the before step's hook", function () {
        expect(beforeStep.setHook).toHaveBeenCalledWith(aroundHook);
      });

      it("adds the before step to the before step collection", function () {
        expect(beforeStepCollection.add).toHaveBeenCalledWith(beforeStep);
      });

      it("sets the empty hook as the after step's hook", function () {
        expect(afterStep.setHook).toHaveBeenCalledWith(emptyHook);
      });

      it("adds the after step to the end of the after step collection", function () {
        expect(afterStepCollection.unshift).toHaveBeenCalledWith(afterStep);
      });

      it("sets the after step as the around hook's after step", function () {
        expect(aroundHook.setAfterStep).toHaveBeenCalledWith(afterStep);
      });
    });
  });

  describe("createBeforeStepsForBeforeHooks()", function () {
    var scenario, beforeHooks;

    beforeEach(function () {
      scenario    = createSpy("scenario");
      beforeHooks = createSpy("before hooks");
      spyOnStub(beforeHooks, "forEach");
      spyOnStub(supportCodeLibrary, 'lookupBeforeHooksByScenario').and.returnValue(beforeHooks);

      treeWalker.createBeforeStepsForBeforeHooks(scenario);
    });

    it("looks up before hooks by scenario", function () {
      expect(supportCodeLibrary.lookupBeforeHooksByScenario).toHaveBeenCalledWith(scenario);
    });

    it("iterates over the before hooks", function () {
      expect(beforeHooks.forEach).toHaveBeenCalled();
      expect(beforeHooks.forEach).toHaveBeenCalledWithAFunctionAsNthParameter(1);
    });

    describe("for each before hook", function () {
      var beforeHook, beforeStep;

      beforeEach(function () {
        beforeHook = createSpyWithStubs("before hook");
        beforeStep = createSpyWithStubs("before step", {setHook: undefined});
        var forEachCallback = beforeHooks.forEach.calls.mostRecent().args[0];
        spyOn(Cucumber.Ast, "HookStep").and.returnValue(beforeStep);

        forEachCallback(beforeHook);
      });

      it("creates a before step", function () {
        expect(Cucumber.Ast.HookStep).toHaveBeenCalledWith(Cucumber.Runtime.AstTreeWalker.BEFORE_STEP_KEYWORD);
      });

      it("sets the before hook as the before step's hook", function () {
        expect(beforeStep.setHook).toHaveBeenCalledWith(beforeHook);
      });

      it("adds the before step to the before step collection", function () {
        expect(beforeStepCollection.add).toHaveBeenCalledWith(beforeStep);
      });
    });
  });

  describe("createAfterStepsForAfterHooks()", function () {
    var scenario, afterHooks;

    beforeEach(function () {
      scenario   = createSpy("scenario");
      afterHooks = createSpy("after hooks");
      spyOnStub(afterHooks, "forEach");
      spyOnStub(supportCodeLibrary, 'lookupAfterHooksByScenario').and.returnValue(afterHooks);

      treeWalker.createAfterStepsForAfterHooks(scenario);
    });

    it("looks up after hooks by scenario", function () {
      expect(supportCodeLibrary.lookupAfterHooksByScenario).toHaveBeenCalledWith(scenario);
    });

    it("iterates over the after hooks", function () {
      expect(afterHooks.forEach).toHaveBeenCalled();
      expect(afterHooks.forEach).toHaveBeenCalledWithAFunctionAsNthParameter(1);
    });

    describe("for each after hook", function () {
      var afterHook, afterStep;

      beforeEach(function () {
        afterHook = createSpyWithStubs("after hook");
        afterStep = createSpyWithStubs("after step", {setHook: undefined});
        var forEachCallback = afterHooks.forEach.calls.mostRecent().args[0];
        spyOn(Cucumber.Ast, "HookStep").and.returnValue(afterStep);

        forEachCallback(afterHook);
      });

      it("creates a after step", function () {
        expect(Cucumber.Ast.HookStep).toHaveBeenCalledWith(Cucumber.Runtime.AstTreeWalker.AFTER_STEP_KEYWORD);
      });

      it("sets the after hook as the after step's hook", function () {
        expect(afterStep.setHook).toHaveBeenCalledWith(afterHook);
      });

      it("adds the after step to the end of the after step collection", function () {
        expect(afterStepCollection.unshift).toHaveBeenCalledWith(afterStep);
      });
    });
  });

  describe("visitBeforeSteps()", function () {
    var callback;

    beforeEach(function () {
      callback = createSpy("callback");

      treeWalker.visitBeforeSteps(callback);
    });

    it("iterates over the before steps", function () {
      expect(beforeStepCollection.asyncForEach).toHaveBeenCalled();
      expect(beforeStepCollection.asyncForEach).toHaveBeenCalledWithAFunctionAsNthParameter(1);
    });

    describe("for each before step", function () {
      var beforeStep, callback;

      beforeEach(function () {
        beforeStep = createSpyWithStubs("before step", {acceptVisitor: undefined});
        callback   = createSpyWithStubs("callback");
        spyOn(treeWalker, 'witnessHook');

        var userFunction = beforeStepCollection.asyncForEach.calls.mostRecent().args[0];

        userFunction (beforeStep, callback);
      });

      it("witnesses a hook", function () {
        expect(treeWalker.witnessHook).toHaveBeenCalled();
      });

      it("instructs the before step to accept the tree walker as a visitor", function () {
        expect(beforeStep.acceptVisitor).toHaveBeenCalled();
        expect(beforeStep.acceptVisitor).toHaveBeenCalledWithValueAsNthParameter(treeWalker, 1);
        expect(beforeStep.acceptVisitor).toHaveBeenCalledWithAFunctionAsNthParameter(2);
      });
    });

    describe("when it has finished iterating over the before steps", function () {
      beforeEach(function () {
        var asyncForEachCallback = beforeStepCollection.asyncForEach.calls.mostRecent().args[1];
        asyncForEachCallback();
      });

      it("calls back", function () {
        expect(callback).toHaveBeenCalled();
      });
    });
  });

  describe("visitAfterSteps()", function () {
    var callback;

    beforeEach(function () {
      callback = createSpy("callback");

      treeWalker.visitAfterSteps(callback);
    });

    it("iterates over the after steps", function () {
      expect(afterStepCollection.asyncForEach).toHaveBeenCalled();
      expect(afterStepCollection.asyncForEach).toHaveBeenCalledWithAFunctionAsNthParameter(1);
    });

    describe("for each after step", function () {
      var afterStep, callback;

      beforeEach(function () {
        afterStep  = createSpyWithStubs("after step", {acceptVisitor: undefined});
        callback   = createSpyWithStubs("callback");
        spyOn(treeWalker, 'witnessHook');
        var userFunction = afterStepCollection.asyncForEach.calls.mostRecent().args[0];

        userFunction (afterStep, callback);
      });

      it("witnesses a hook", function () {
        expect(treeWalker.witnessHook).toHaveBeenCalled();
      });

      it("instructs the before step to accept the tree walker as a visitor", function () {
        expect(afterStep.acceptVisitor).toHaveBeenCalled();
        expect(afterStep.acceptVisitor).toHaveBeenCalledWithValueAsNthParameter(treeWalker, 1);
        expect(afterStep.acceptVisitor).toHaveBeenCalledWithAFunctionAsNthParameter(2);
      });
    });

    describe("when it has finished iterating over the after steps", function () {
      beforeEach(function () {
        var asyncForEachCallback = afterStepCollection.asyncForEach.calls.mostRecent().args[1];
        asyncForEachCallback();
      });

      it("calls back", function () {
        expect(callback).toHaveBeenCalled();
      });
    });
  });

  describe("visitStep()", function () {
    var step, callback, event, payload, sequence;

    beforeEach(function () {
      step     = createSpy("step");
      callback = createSpy("callback");
      event    = createSpy("Event");
      payload  = {step: step};
      spyOn(Cucumber.Runtime.AstTreeWalker, 'Event').and.returnValue(event);
      sequence = [];
      spyOn(treeWalker, 'witnessNewStep').and.callFake(function () {
        sequence.push('witnessNewStep');
      });
      spyOn(treeWalker, 'broadcastEventAroundUserFunction').and.callFake(function () {
        sequence.push('broadcastEventAroundUserFunction');
      });
    });

    it("witnesses a new step", function () {
      treeWalker.visitStep(step, callback);
      expect(treeWalker.witnessNewStep).toHaveBeenCalled();
    });

    it("witnesses a new step before broadcasting the step", function () {
      treeWalker.visitStep(step, callback);
      expect(sequence).toEqual(['witnessNewStep', 'broadcastEventAroundUserFunction']);
    });

    it("creates a new event about the step to be processed", function () {
      treeWalker.visitStep(step, callback);
      expect(Cucumber.Runtime.AstTreeWalker.Event).toHaveBeenCalledWith(Cucumber.Runtime.AstTreeWalker.STEP_EVENT_NAME, payload);
    });

    it("broadcasts the step", function () {
      treeWalker.visitStep(step, callback);
      expect(treeWalker.broadcastEventAroundUserFunction).toHaveBeenCalled();
      expect(treeWalker.broadcastEventAroundUserFunction).
        toHaveBeenCalledWithValueAsNthParameter(event, 1);
      expect(treeWalker.broadcastEventAroundUserFunction).
        toHaveBeenCalledWithAFunctionAsNthParameter(2);
      expect(treeWalker.broadcastEventAroundUserFunction).
        toHaveBeenCalledWithValueAsNthParameter(callback, 3);
    });

    describe("user function", function () {
      var userFunction, userFunctionCallback;

      beforeEach(function () {
        treeWalker.visitStep(step, callback);
        userFunction         = treeWalker.broadcastEventAroundUserFunction.calls.mostRecent().args[1];
        userFunctionCallback = createSpy("user function callback");
        spyOn(treeWalker, 'processStep');
      });

      it("processes the step", function () {
        userFunction (userFunctionCallback);
        expect(treeWalker.processStep).toHaveBeenCalledWith(step, userFunctionCallback);
      });
    });
  });

  describe("visitStepResult()", function () {
    var stepResult, callback, event, payload;

    beforeEach(function () {
      stepResult = createSpyWithStubs("Step result", {getStatus: undefined, getFailureException: null});
      callback   = createSpy("Callback");
      event      = createSpy("Event");
      payload    = {stepResult: stepResult};
      spyOn(treeWalker, 'broadcastEvent');
      spyOn(Cucumber.Runtime.AstTreeWalker, 'Event').and.returnValue(event);
      treeWalker.witnessNewScenario();
    });

    it("creates a new event about the step result", function () {
      treeWalker.visitStepResult(stepResult, callback);
      expect(Cucumber.Runtime.AstTreeWalker.Event).toHaveBeenCalledWith(Cucumber.Runtime.AstTreeWalker.STEP_RESULT_EVENT_NAME, payload);
    });

    it("broadcasts the visit of the step result and the step result itself", function () {
      treeWalker.visitStepResult(stepResult, callback);
      expect(treeWalker.broadcastEvent).toHaveBeenCalledWith(event, callback);
    });

    it("does not call back by itself", function () {
      treeWalker.visitStepResult(stepResult, callback);
      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe("broadcastEventAroundUserFunction ()", function () {
    var event, userFunction, callback;
    var userFunctionWrapper;

    beforeEach(function () {
      event               = createSpy("Event");
      userFunction        = createSpy("User function");
      callback            = createSpy("Callback");
      userFunctionWrapper = createSpy("User function wrapper");
      spyOn(treeWalker, 'wrapUserFunctionAndAfterEventBroadcast').and.returnValue(userFunctionWrapper);
      spyOn(treeWalker, 'broadcastBeforeEvent');
    });

    it("wraps the user function and after event broadcast together", function () {
      treeWalker.broadcastEventAroundUserFunction (event, userFunction, callback);
      expect(treeWalker.wrapUserFunctionAndAfterEventBroadcast).toHaveBeenCalledWith(userFunction, event, callback);
    });

    it("broadcasts a before event with the user function and after event broadcast wrapper as callback", function () {
      treeWalker.broadcastEventAroundUserFunction (event, userFunction, callback);
      expect(treeWalker.broadcastBeforeEvent).toHaveBeenCalledWith(event, userFunctionWrapper);
    });
  });

  describe("wrapUserFunctionAndAfterEventBroadcast()", function () {
    var userFunction, event, callback;
    var broadcastAfterEventWrapper;

    beforeEach(function () {
      userFunction               = createSpy("User function");
      event                      = createSpy("Event");
      callback                   = createSpy("Callback");
      broadcastAfterEventWrapper = createSpy("After event broadcast wrapper");
      spyOn(treeWalker, 'wrapAfterEventBroadcast').and.returnValue(broadcastAfterEventWrapper);
    });

    it("wraps the after event broadcast to use as a callback", function () {
      treeWalker.wrapUserFunctionAndAfterEventBroadcast(userFunction, event, callback);
      expect(treeWalker.wrapAfterEventBroadcast).toHaveBeenCalledWith(event, callback);
    });

    it("returns a wrapper function", function () {
      var returned = treeWalker.wrapUserFunctionAndAfterEventBroadcast(userFunction, event, callback);
      expect(returned).toBeAFunction ();
    });

    describe("returned wrapper function", function () {
      var wrapper;

      beforeEach(function () {
        wrapper = treeWalker.wrapUserFunctionAndAfterEventBroadcast(userFunction, event, callback);
      });

      it("calls the user function with the after event broadcast wrapper", function () {
        wrapper();
        expect(userFunction).toHaveBeenCalledWith(broadcastAfterEventWrapper);
      });
    });
  });

  describe("wrapAfterEventBroadcast()", function () {
    var event, callback;

    beforeEach(function () {
      event    = createSpy("Event");
      callback = createSpy("Callback");
    });

    it("returns a function", function () {
      var returned = treeWalker.wrapAfterEventBroadcast(event, callback);
      expect(returned).toBeAFunction ();
    });

    describe("returned wrapper function", function () {
      var wrapper;

      beforeEach(function () {
        wrapper = treeWalker.wrapAfterEventBroadcast(event, callback);
        spyOn(treeWalker, 'broadcastAfterEvent');
      });

      it("broadcasts an after event with the received callback as callback", function () {
        wrapper();
        expect(treeWalker.broadcastAfterEvent).toHaveBeenCalledWith(event, callback);
      });
    });
  });

  describe("broadcastBeforeEvent()", function () {
    var event, callback, preEvent;

    beforeEach(function () {
      preEvent = createSpy("Pre-event (before)");
      event    = createSpyWithStubs("Event", { replicateAsPreEvent: preEvent });
      callback = createSpy("Callback");
      spyOn(treeWalker, 'broadcastEvent');
    });

    it("asks the event to replicate itself as a before event", function () {
      treeWalker.broadcastBeforeEvent(event, callback);
      expect(event.replicateAsPreEvent).toHaveBeenCalled();
    });

    it("broadcasts the pre event with the call back", function () {
      treeWalker.broadcastBeforeEvent(event, callback);
      expect(treeWalker.broadcastEvent).toHaveBeenCalledWith(preEvent, callback);
    });
  });

  describe("broadcastAfterEvent()", function () {
    var event, callback, postEvent;

    beforeEach(function () {
      postEvent = createSpy("Post-event (after)");
      event    = createSpyWithStubs("Event", { replicateAsPostEvent: postEvent });
      callback = createSpy("Callback");
      spyOn(treeWalker, 'broadcastEvent');
    });

    it("asks the event to replicate itself as a after event", function () {
      treeWalker.broadcastAfterEvent(event, callback);
      expect(event.replicateAsPostEvent).toHaveBeenCalled();
    });

    it("broadcasts the post event with the call back", function () {
      treeWalker.broadcastAfterEvent(event, callback);
      expect(treeWalker.broadcastEvent).toHaveBeenCalledWith(postEvent, callback);
    });
  });

  describe("broadcastEvent()", function () {
    var event, callback;

    beforeEach(function () {
      event    = createSpy("Event");
      callback = createSpy("Callback");
      treeWalker.broadcastEvent(event, callback);
    });

    it("tells each listener about the event and calls back when finished", function () {
      expect(listeners[0].hear).toHaveBeenCalledWith(event, jasmine.any(Function));
      expect(listeners[1].hear).toHaveBeenCalledWith(event, jasmine.any(Function));
      expect(supportListeners[0].hear).toHaveBeenCalledWith(event, jasmine.any(Function));
      expect(supportListeners[1].hear).toHaveBeenCalledWith(event, jasmine.any(Function));
      expect(callback).toHaveBeenCalled();
    });
  });

  describe("getWorld() [setWorld()]", function () {
    var world;

    beforeEach(function () {
      world = createSpy("world instance");
    });

    it("returns the World instance set with setWorld()", function () {
      treeWalker.setWorld(world);
      expect(treeWalker.getWorld()).toBe(world);
    });
  });

  describe("lookupStepDefinitionByName()", function () {
    var stepName, stepDefinition;

    beforeEach(function () {
      stepName       = createSpy("Step name");
      stepDefinition = createSpy("Step definition");
      spyOnStub(supportCodeLibrary, 'lookupStepDefinitionByName').and.returnValue(stepDefinition);
    });

    it("asks the support code library for the step definition", function () {
      treeWalker.lookupStepDefinitionByName(stepName);
      expect(supportCodeLibrary.lookupStepDefinitionByName).toHaveBeenCalledWith(stepName);
    });

    it("returns the step definition returned by the library", function () {
      expect(treeWalker.lookupStepDefinitionByName(stepName)).toBe(stepDefinition);
    });
  });

  describe("isStepUndefined()", function () {
    var step, stepName;

    beforeEach(function () {
      stepName                = createSpy("name of the step");
      step                    = createSpyWithStubs("step", {getName: stepName});
      spyOnStub(supportCodeLibrary, 'isStepDefinitionNameDefined');
    });

    it("gets the name of the step", function () {
      treeWalker.isStepUndefined(step);
      expect(step.getName).toHaveBeenCalled();
    });

    it("asks the support code library whether a step definition is defined for that name", function () {
      treeWalker.isStepUndefined(step);
      expect(supportCodeLibrary.isStepDefinitionNameDefined).toHaveBeenCalledWith(stepName);
    });

    describe("when the step definition is defined", function () {
      beforeEach(function () {
        supportCodeLibrary.isStepDefinitionNameDefined.and.returnValue(true);
      });

      it("returns false", function () {
        expect(treeWalker.isStepUndefined(step)).toBeFalsy();
      });
    });

    describe("when the step definition is undefined", function () {
      beforeEach(function () {
        supportCodeLibrary.isStepDefinitionNameDefined.and.returnValue(false);
      });

      it("returns true", function () {
        expect(treeWalker.isStepUndefined(step)).toBeTruthy();
      });
    });
  });

  describe("attach()", function () {
    var data, mimeType, attachment;

    beforeEach(function () {
      data       = createSpy("data");
      mimeType   = createSpy("mimeType");
      attachment = createSpy("attachment");
      spyOn(Cucumber.Runtime, 'Attachment').and.returnValue(attachment);

      treeWalker.attach(data, mimeType);
    });

    it("creates an attachment", function () {
      expect(Cucumber.Runtime.Attachment).toHaveBeenCalledWith({mimeType: mimeType, data: data});
    });

    it("adds the attachment to the collection", function () {
      expect(treeWalker.getAttachments()).toEqual([attachment]);
    });
  });

  describe("witnessNewStep()", function () {
    beforeEach(function () {
      treeWalker.attach('123');
      treeWalker.witnessNewStep();
    });

    it("clears the attachments", function () {
      expect(treeWalker.getAttachments()).toEqual([]);
    });
  });

  describe("witnessNewScenario()", function () {
    var scenario, apiScenario;

    beforeEach(function () {
      scenario    = createSpy("scenario");
      apiScenario = createSpy("API scenario");
      spyOn(Cucumber.Api, 'Scenario').and.returnValue(apiScenario);

      treeWalker.witnessNewScenario(scenario);
    });

    it("creates an API scenario", function () {
      expect(Cucumber.Api.Scenario).toHaveBeenCalledWith(treeWalker, scenario);
    });

    it("clears the before step collection", function () {
      expect(beforeStepCollection.clear).toHaveBeenCalled();
    });

    it("clears the after step collection", function () {
      expect(afterStepCollection.clear).toHaveBeenCalled();
    });
  });

  describe("getScenario()", function () {
    var scenario, apiScenario, returnValue;

    describe("when a new scenario is visited", function () {
      beforeEach(function () {
        scenario    = createSpy("scenario");
        apiScenario = createSpy("API scenario");
        spyOn(Cucumber.Api, 'Scenario').and.returnValue(apiScenario);

        treeWalker.witnessNewScenario(scenario);
        returnValue = treeWalker.getScenario();
      });

      it("returns the API scenario", function () {
        expect(returnValue).toBe(apiScenario);
      });
    });
  });

  describe("getDomain()", function () {
    it("returns the walk domain", function () {
      expect(treeWalker.getDomain()).toBe(walkDomain);
    });
  });

  describe("isSkippingSteps() [witnessFailedSteps(), witnessPendingSteps(), witnessUndefinedStep(), witnessNewScenario()]", function () {
    beforeEach(function () {
      var scenario = createSpy("scenario");
      treeWalker.witnessNewScenario(scenario);
    });

    it("returns false when no failed, pending or undefined steps were encountered", function () {
      expect(treeWalker.isSkippingSteps()).toBeFalsy();
    });

    it("returns true when a failed step was encountered", function () {
      var stepResult = createSpyWithStubs('stepResult', {getFailureException: null, getStatus: Cucumber.Status.FAILED});
      treeWalker.visitStepResult(stepResult, function () {});
      expect(treeWalker.isSkippingSteps()).toBeTruthy();
    });

    it("returns true when a pending step was encountered", function () {
      var stepResult = createSpyWithStubs('stepResult', {getStatus: Cucumber.Status.PENDING});
      treeWalker.visitStepResult(stepResult, function () {});
      expect(treeWalker.isSkippingSteps()).toBeTruthy();
    });

    it("returns true when a undefined step was encountered", function () {
      var stepResult = createSpyWithStubs('stepResult', {getStatus: Cucumber.Status.UNDEFINED});
      treeWalker.visitStepResult(stepResult, function () {});
      expect(treeWalker.isSkippingSteps()).toBeTruthy();
    });

    it("returns false when a failed step was encountered but not in the current scenario", function () {
      var stepResult = createSpyWithStubs('stepResult', {getFailureException: null, getStatus: Cucumber.Status.FAILED});
      treeWalker.visitStepResult(stepResult, function () {});
      var scenario = createSpy("scenario");
      treeWalker.witnessNewScenario(scenario);
      expect(treeWalker.isSkippingSteps()).toBeFalsy();
    });

    it("returns false when a pending step was encountered but not in the current scenario", function () {
      var stepResult = createSpyWithStubs('stepResult', {getStatus: Cucumber.Status.PENDING});
      treeWalker.visitStepResult(stepResult, function () {});
      var scenario = createSpy("scenario");
      treeWalker.witnessNewScenario(scenario);
      expect(treeWalker.isSkippingSteps()).toBeFalsy();
    });

    it("returns false when a undefined step was encountered but not in the current scenario", function () {
      var stepResult = createSpyWithStubs('stepResult', {getStatus: Cucumber.Status.UNDEFINED});
      treeWalker.visitStepResult(stepResult, function () {});
      var scenario = createSpy("scenario");
      treeWalker.witnessNewScenario(scenario);
      expect(treeWalker.isSkippingSteps()).toBeFalsy();
    });
  });

  describe("processStep()", function () {
    var step, callback;

    beforeEach(function () {
      step     = createSpy("step");
      callback = createSpy("callback");
      spyOn(treeWalker, 'isStepUndefined');
      spyOn(treeWalker, 'skipUndefinedStep');
      spyOn(treeWalker, 'isSkippingSteps');
      spyOn(treeWalker, 'executeStep');
      spyOn(treeWalker, 'skipStep');
    });

    it("checks whether the step is undefined or not", function () {
      treeWalker.processStep(step, callback);
      expect(treeWalker.isStepUndefined).toHaveBeenCalledWith(step);
    });

    describe("when the step is undefined", function () {
      beforeEach(function () {
        treeWalker.isStepUndefined.and.returnValue(true);
      });

      it("skips the undefined step", function () {
        treeWalker.processStep(step, callback);
        expect(treeWalker.skipUndefinedStep).toHaveBeenCalledWith(step, callback);
      });

      it("does not skip a defined step", function () {
        treeWalker.processStep(step, callback);
        expect(treeWalker.skipStep).not.toHaveBeenCalled();
      });

      it("does not execute the step", function () {
        treeWalker.processStep(step, callback);
        expect(treeWalker.executeStep).not.toHaveBeenCalled();
      });
    });

    describe("when the step is defined", function () {
      beforeEach(function () {
        treeWalker.isStepUndefined.and.returnValue(false);
      });

      it("checks whether the step should be skipped", function () {
        treeWalker.processStep(step, callback);
        expect(treeWalker.isSkippingSteps).toHaveBeenCalled();
      });

      describe("when the steps are skipped", function () {
        beforeEach(function () {
          treeWalker.isSkippingSteps.and.returnValue(true);
        });

        it("skips the step", function () {
          treeWalker.processStep(step, callback);
          expect(treeWalker.skipStep).toHaveBeenCalledWith(step, callback);
        });

        it("does not skip an undefined step", function () {
          treeWalker.processStep(step, callback);
          expect(treeWalker.skipUndefinedStep).not.toHaveBeenCalled();
        });

        it("does not execute the step", function () {
          treeWalker.processStep(step, callback);
          expect(treeWalker.executeStep).not.toHaveBeenCalled();
        });
      });

      describe("when the steps are not skipped", function () {
        beforeEach(function () {
          treeWalker.isSkippingSteps.and.returnValue(false);
        });

        it("executes the step", function () {
          treeWalker.processStep(step, callback);
          expect(treeWalker.executeStep).toHaveBeenCalledWith(step, callback);
        });

        it("does not skip the step", function () {
          treeWalker.processStep(step, callback);
          expect(treeWalker.skipStep).not.toHaveBeenCalled();
        });

        it("does not skip an undefined step", function () {
          treeWalker.processStep(step, callback);
          expect(treeWalker.skipUndefinedStep).not.toHaveBeenCalled();
        });
      });

      describe("when the steps are skipped in dry Run mode", function () {
        beforeEach(function () {
          options.dryRun = true;
        });

        it("skips the step", function () {
          treeWalker.processStep(step, callback);
          expect(treeWalker.skipStep).toHaveBeenCalledWith(step, callback);
        });

        it("does not skip an undefined step", function () {
          treeWalker.processStep(step, callback);
          expect(treeWalker.skipUndefinedStep).not.toHaveBeenCalled();
        });

        it("does not execute the step", function () {
          treeWalker.processStep(step, callback);
          expect(treeWalker.executeStep).not.toHaveBeenCalled();
        });
      });
    });
  });

  describe("executeStep()", function () {
    var step, callback;

    beforeEach(function () {
      step     = createSpyWithStubs("step", {acceptVisitor: null});
      callback = createSpy("callback");
    });

    it("visits the step, passing it the received callback", function () {
      treeWalker.executeStep(step, callback);
      expect(step.acceptVisitor).toHaveBeenCalledWith(treeWalker, callback);
    });
  });

  describe("skipStep()", function () {
    var step, callback, skippedStepResult;

    beforeEach(function () {
      step              = createSpyWithStubs("step AST element");
      callback          = createSpy("callback");
      skippedStepResult = createSpy("skipped step result");
      spyOn(Cucumber.Runtime, 'StepResult').and.returnValue(skippedStepResult);
      spyOn(treeWalker, 'visitStepResult');
    });

    it("creates a new skipped step result", function () {
      treeWalker.skipStep(step, callback);
      expect(Cucumber.Runtime.StepResult).toHaveBeenCalledWith({step: step, status: Cucumber.Status.SKIPPED});
    });

    it("visits the skipped step result", function () {
      treeWalker.skipStep(step, callback);
      expect(treeWalker.visitStepResult).toHaveBeenCalledWith(skippedStepResult, callback);
    });
  });

  describe("skipUndefinedStep()", function () {
    var step, callback, undefinedStepResult;

    beforeEach(function () {
      step                = createSpyWithStubs("step AST element");
      callback            = createSpy("callback");
      undefinedStepResult = createSpy("undefined step result");
      spyOn(Cucumber.Runtime, 'StepResult').and.returnValue(undefinedStepResult);
      spyOn(treeWalker, 'visitStepResult');
    });

    it("creates a new undefined step result", function () {
      treeWalker.skipUndefinedStep(step, callback);
      expect(Cucumber.Runtime.StepResult).toHaveBeenCalledWith({step: step, status: Cucumber.Status.UNDEFINED});
    });

    it("visits the undefined step result", function () {
      treeWalker.skipUndefinedStep(step, callback);
      expect(treeWalker.visitStepResult).toHaveBeenCalledWith(undefinedStepResult, callback);
    });
  });
});
