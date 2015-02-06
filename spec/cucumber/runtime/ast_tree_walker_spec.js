var domain = require('domain');
require('../../support/spec_helper');

describe("Cucumber.Runtime.AstTreeWalker", function () {
  var Cucumber = requireLib('cucumber');
  var beforeStepCollection, afterStepCollection, attachmentCollection, emptyHook;
  var walkDomain;
  var treeWalker, features, supportCodeLibrary, listeners, supportListeners;

  beforeEach(function () {
    features             = createSpyWithStubs("Features AST element", {acceptVisitor: null});
    supportCodeLibrary   = createSpy("Support code library");
    listeners            = [createSpy("First listener"), createSpy("Second listener")];
    supportListeners     = [createSpy("First support listener"), createSpy("Second support listener")];
    walkDomain           = createSpy("walk domain");
    spyOnStub(listeners, 'syncForEach').andCallFake(function (cb) { listeners.forEach(cb); });
    spyOnStub(supportListeners, 'syncForEach').andCallFake(function (cb) { supportListeners.forEach(cb); });
    spyOnStub(supportCodeLibrary, 'getListeners').andReturn(supportListeners);

    beforeStepCollection = createSpyWithStubs("before step collection", {add: undefined, unshift: undefined, clear: undefined, forEach: undefined});
    afterStepCollection  = createSpyWithStubs("after step collection", {add: undefined, unshift: undefined, clear: undefined, forEach: undefined});
    attachmentCollection = createSpyWithStubs("attachment collection", {add: undefined, unshift: undefined, clear: undefined, forEach: undefined});
    emptyHook            = createSpy("empty hook");
    spyOn(Cucumber.Type, 'Collection').andReturnSeveral([beforeStepCollection, afterStepCollection, attachmentCollection]);
    spyOn(Cucumber.SupportCode, "Hook").andReturn(emptyHook);
    spyOn(domain, 'create').andReturn(walkDomain);
    treeWalker           = Cucumber.Runtime.AstTreeWalker(features, supportCodeLibrary, listeners);
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
      var featuresVisitCallback, featuresResult;

      beforeEach(function () {
        treeWalker.walk(callback);
        featuresVisitCallback = treeWalker.visitFeatures.mostRecentCall.args[1];
        featuresResult = createSpy("result of all features");
        spyOn(treeWalker, 'didAllFeaturesSucceed').andReturn(featuresResult);
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

      it("checks whether all features were successful", function () {
        featuresVisitCallback();
        expect(treeWalker.didAllFeaturesSucceed).toHaveBeenCalled();
      });

      it("calls back with the result of the features", function () {
        featuresVisitCallback();
        expect(callback).toHaveBeenCalledWith(featuresResult);
      });
    });
  });

  describe("visitFeatures()", function () {
    var callback, event, payload;

    beforeEach(function () {
      callback = createSpy("Callback");
      event    = createSpy("Event");
      payload  = {features: features};
      spyOn(Cucumber.Runtime.AstTreeWalker, 'Event').andReturn(event);
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
        userFunction = treeWalker.broadcastEventAroundUserFunction.mostRecentCall.args[1];
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
      spyOn(Cucumber.Runtime.AstTreeWalker, 'Event').andReturn(event);
      spyOn(treeWalker, 'broadcastEventAroundUserFunction');
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
        userFunction = treeWalker.broadcastEventAroundUserFunction.mostRecentCall.args[1];
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
      spyOn(Cucumber.Runtime.AstTreeWalker, 'Event').andReturn(event);
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
        worldInstantiationCompletionCallback = supportCodeLibrary.instantiateNewWorld.mostRecentCall.args[0];
        world                 = createSpy("world instance");
        event                 = createSpy("scenario visit event");
        hookedUpScenarioVisit = createSpy("hooked up scenario visit");
        payload               = {scenario: scenario};
        spyOn(treeWalker, 'setWorld');
        spyOn(treeWalker, 'witnessNewScenario');
        spyOn(treeWalker, 'createBeforeAndAfterStepsForAroundHooks');
        spyOn(treeWalker, 'createBeforeStepsForBeforeHooks');
        spyOn(treeWalker, 'createAfterStepsForAfterHooks');
        spyOn(Cucumber.Runtime.AstTreeWalker, 'Event').andReturn(event);
        spyOnStub(supportCodeLibrary, 'hookUpFunction').andReturn(hookedUpScenarioVisit);
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
          userFunction         = treeWalker.broadcastEventAroundUserFunction.mostRecentCall.args[1];
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
            var visitBeforeStepsCallback = treeWalker.visitBeforeSteps.mostRecentCall.args[0];
            visitBeforeStepsCallback();
          });

          it("instructs the scenario to accept the tree walker as a visitor", function () {
            expect(scenario.acceptVisitor).toHaveBeenCalled();
            expect(scenario.acceptVisitor).toHaveBeenCalledWithValueAsNthParameter(treeWalker, 1);
          });

          describe("after visiting the scenario", function () {
            beforeEach(function () {
              spyOn(treeWalker, 'visitAfterSteps');
              var acceptVisitorCallback = scenario.acceptVisitor.mostRecentCall.args[1];
              acceptVisitorCallback();
            });

            it("visits the after steps", function () {
              expect(treeWalker.visitAfterSteps).toHaveBeenCalled();
            });

            describe("after visiting the after steps", function () {
              beforeEach(function () {
                var visitAfterStepsCallback = treeWalker.visitAfterSteps.mostRecentCall.args[0];
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
      spyOnStub(aroundHooks, "syncForEach");
      spyOnStub(supportCodeLibrary, 'lookupAroundHooksByScenario').andReturn(aroundHooks);

      treeWalker.createBeforeAndAfterStepsForAroundHooks(scenario);
    });

    it("looks up around hooks by scenario", function () {
      expect(supportCodeLibrary.lookupAroundHooksByScenario).toHaveBeenCalledWith(scenario);
    });

    it("iterates over the around hooks", function () {
      expect(aroundHooks.syncForEach).toHaveBeenCalled();
      expect(aroundHooks.syncForEach).toHaveBeenCalledWithAFunctionAsNthParameter(1);
    });

    describe("for each around hook", function () {
      var aroundHook, beforeStep, afterStep;

      beforeEach(function () {
        aroundHook = createSpyWithStubs("around hook", {setAfterStep: undefined});
        beforeStep = createSpyWithStubs("before step", {setHook: undefined});
        afterStep  = createSpyWithStubs("after step", {setHook: undefined});
        var syncForEachCallback = aroundHooks.syncForEach.mostRecentCall.args[0];
        spyOn(Cucumber.Ast, "HookStep").andReturnSeveral([beforeStep, afterStep]);

        syncForEachCallback(aroundHook);
      });

      it("creates a before step and an after step", function () {
        expect(Cucumber.Ast.HookStep).toHaveBeenCalledNTimes(2);
        expect(Cucumber.Ast.HookStep.calls[0].args).toEqual([Cucumber.Runtime.AstTreeWalker.AROUND_STEP_KEYWORD]);
        expect(Cucumber.Ast.HookStep.calls[1].args).toEqual([Cucumber.Runtime.AstTreeWalker.AROUND_STEP_KEYWORD]);
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
      spyOnStub(beforeHooks, "syncForEach");
      spyOnStub(supportCodeLibrary, 'lookupBeforeHooksByScenario').andReturn(beforeHooks);

      treeWalker.createBeforeStepsForBeforeHooks(scenario);
    });

    it("looks up before hooks by scenario", function () {
      expect(supportCodeLibrary.lookupBeforeHooksByScenario).toHaveBeenCalledWith(scenario);
    });

    it("iterates over the before hooks", function () {
      expect(beforeHooks.syncForEach).toHaveBeenCalled();
      expect(beforeHooks.syncForEach).toHaveBeenCalledWithAFunctionAsNthParameter(1);
    });

    describe("for each before hook", function () {
      var beforeHook, beforeStep;

      beforeEach(function () {
        beforeHook = createSpyWithStubs("before hook");
        beforeStep = createSpyWithStubs("before step", {setHook: undefined});
        var syncForEachCallback = beforeHooks.syncForEach.mostRecentCall.args[0];
        spyOn(Cucumber.Ast, "HookStep").andReturn(beforeStep);

        syncForEachCallback(beforeHook);
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
      spyOnStub(afterHooks, "syncForEach");
      spyOnStub(supportCodeLibrary, 'lookupAfterHooksByScenario').andReturn(afterHooks);

      treeWalker.createAfterStepsForAfterHooks(scenario);
    });

    it("looks up after hooks by scenario", function () {
      expect(supportCodeLibrary.lookupAfterHooksByScenario).toHaveBeenCalledWith(scenario);
    });

    it("iterates over the after hooks", function () {
      expect(afterHooks.syncForEach).toHaveBeenCalled();
      expect(afterHooks.syncForEach).toHaveBeenCalledWithAFunctionAsNthParameter(1);
    });

    describe("for each after hook", function () {
      var afterHook, afterStep;

      beforeEach(function () {
        afterHook = createSpyWithStubs("after hook");
        afterStep = createSpyWithStubs("after step", {setHook: undefined});
        var syncForEachCallback = afterHooks.syncForEach.mostRecentCall.args[0];
        spyOn(Cucumber.Ast, "HookStep").andReturn(afterStep);

        syncForEachCallback(afterHook);
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
      expect(beforeStepCollection.forEach).toHaveBeenCalled();
      expect(beforeStepCollection.forEach).toHaveBeenCalledWithAFunctionAsNthParameter(1);
    });

    describe("for each before step", function () {
      var beforeStep, callback;

      beforeEach(function () {
        beforeStep = createSpyWithStubs("before step", {acceptVisitor: undefined});
        callback   = createSpyWithStubs("callback");
        spyOn(treeWalker, 'witnessHook');

        var userFunction = beforeStepCollection.forEach.mostRecentCall.args[0];

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
        var forEachCallback = beforeStepCollection.forEach.mostRecentCall.args[1];
        forEachCallback();
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
      expect(afterStepCollection.forEach).toHaveBeenCalled();
      expect(afterStepCollection.forEach).toHaveBeenCalledWithAFunctionAsNthParameter(1);
    });

    describe("for each after step", function () {
      var afterStep, callback;

      beforeEach(function () {
        afterStep  = createSpyWithStubs("after step", {acceptVisitor: undefined});
        callback   = createSpyWithStubs("callback");
        spyOn(treeWalker, 'witnessHook');
        var userFunction = afterStepCollection.forEach.mostRecentCall.args[0];

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
        var forEachCallback = afterStepCollection.forEach.mostRecentCall.args[1];
        forEachCallback();
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
      spyOn(Cucumber.Runtime.AstTreeWalker, 'Event').andReturn(event);
      sequence = [];
      spyOn(treeWalker, 'witnessNewStep').andCallFake(function () {
        sequence.push('witnessNewStep');
      });
      spyOn(treeWalker, 'broadcastEventAroundUserFunction').andCallFake(function () {
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
        userFunction         = treeWalker.broadcastEventAroundUserFunction.mostRecentCall.args[1];
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
      stepResult = createSpyWithStubs("Step result", {isFailed: undefined, isPending: undefined});
      callback   = createSpy("Callback");
      event      = createSpy("Event");
      payload    = {stepResult: stepResult};
      spyOn(treeWalker, 'broadcastEvent');
      spyOn(treeWalker, 'witnessFailedStep');
      spyOn(Cucumber.Runtime.AstTreeWalker, 'Event').andReturn(event);
    });

    it("creates a new event about the step result", function () {
      treeWalker.visitStepResult(stepResult, callback);
      expect(Cucumber.Runtime.AstTreeWalker.Event).toHaveBeenCalledWith(Cucumber.Runtime.AstTreeWalker.STEP_RESULT_EVENT_NAME, payload);
    });

    it("broadcasts the visit of the step result and the step result itself", function () {
      treeWalker.visitStepResult(stepResult, callback);
      expect(treeWalker.broadcastEvent).toHaveBeenCalledWith(event, callback);
    });

    it("checks whether the step failed or not", function () {
      treeWalker.visitStepResult(stepResult, callback);
      expect(stepResult.isFailed).toHaveBeenCalled();
    });

    describe("when the step failed", function () {
      beforeEach(function () {
        stepResult.isFailed.andReturn(true);
      });

      it("witnesses a failed step", function () {
        treeWalker.visitStepResult(stepResult, callback);
        expect(treeWalker.witnessFailedStep).toHaveBeenCalled();
      });
    });

    describe("when the step did not fail", function () {
      beforeEach(function () {
        stepResult.isFailed.andReturn(false);
        spyOn(treeWalker, 'witnessPendingStep');
      });

      it("does not witness a failed step", function () {
        treeWalker.visitStepResult(stepResult, callback);
        expect(treeWalker.witnessFailedStep).not.toHaveBeenCalled();
      });

      it("checks whether the step was pending or not", function () {
        treeWalker.visitStepResult(stepResult, callback);
        expect(stepResult.isPending).toHaveBeenCalled();
      });

      describe("when the step was pending", function () {
        beforeEach(function () {
          stepResult.isPending.andReturn(true);
        });

        it("witnesses a pending step", function () {
          treeWalker.visitStepResult(stepResult, callback);
          expect(treeWalker.witnessPendingStep).toHaveBeenCalled();
        });
      });

      describe("when the step was not pending", function () {
        beforeEach(function () {
          stepResult.isPending.andReturn(false);
        });

        it("does not witness a pending step", function () {
          treeWalker.visitStepResult(stepResult, callback);
          expect(treeWalker.witnessPendingStep).not.toHaveBeenCalled();
        });
      });
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
      spyOn(treeWalker, 'wrapUserFunctionAndAfterEventBroadcast').andReturn(userFunctionWrapper);
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
      spyOn(treeWalker, 'wrapAfterEventBroadcast').andReturn(broadcastAfterEventWrapper);
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
      spyOnListeners(listeners);
      spyOnListeners(supportListeners);
    });

    function spyOnListeners(listeners) {
      spyOn(listeners, 'forEach').andCallFake(function () {
        var callback = listeners.forEach.mostRecentCall.args[1];
        callback();
      });
    }

    it("iterates over the listeners", function () {
      treeWalker.broadcastEvent(event, callback);
      assertListenerCollectionCalled(listeners.forEach);
      assertListenerCollectionCalled(supportListeners.forEach);
      expect(supportListeners.forEach).toHaveBeenCalledWithValueAsNthParameter(callback, 2);
    });

    function assertListenerCollectionCalled(forEachSpy) {
      expect(forEachSpy).toHaveBeenCalled();
      expect(forEachSpy).toHaveBeenCalledWithAFunctionAsNthParameter(1);
    }

    describe("for each listener", function () {
      var userFunction, listener, forEachCallback;

      beforeEach(function () {
        listener        = createSpyWithStubs("Listener", {hear:null});
        forEachCallback = createSpy("forEach() callback");
        treeWalker.broadcastEvent(event, callback);
        userFunction = listeners.forEach.mostRecentCall.args[0];
      });

      it("tells the listener about the event and calls back when finished", function () {
        userFunction (listener, forEachCallback);
        expect(listener.hear).toHaveBeenCalledWith(event, forEachCallback);
      });
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
      spyOnStub(supportCodeLibrary, 'lookupStepDefinitionByName').andReturn(stepDefinition);
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
        supportCodeLibrary.isStepDefinitionNameDefined.andReturn(true);
      });

      it("returns false", function () {
        expect(treeWalker.isStepUndefined(step)).toBeFalsy();
      });
    });

    describe("when the step definition is undefined", function () {
      beforeEach(function () {
        supportCodeLibrary.isStepDefinitionNameDefined.andReturn(false);
      });

      it("returns true", function () {
        expect(treeWalker.isStepUndefined(step)).toBeTruthy();
      });
    });
  });

  describe("didAllFeaturesSucceed()", function () {
    describe("when strict mode is off", function () {
      it("returns true when no failure was encountered", function () {
        expect(treeWalker.didAllFeaturesSucceed()).toBeTruthy();
      });

      it("returns false when a failed step was encountered", function () {
        treeWalker.witnessFailedStep();
        expect(treeWalker.didAllFeaturesSucceed()).toBeFalsy();
      });

      it("returns true when a pending step was encountered", function () {
        treeWalker.witnessPendingStep();
        expect(treeWalker.didAllFeaturesSucceed()).toBeTruthy();
      });

      it("returns true when an undefined step was encountered", function () {
        treeWalker.witnessUndefinedStep();
        expect(treeWalker.didAllFeaturesSucceed()).toBeTruthy();
      });
    });

    describe("when strict mode is on", function () {
      beforeEach(function () {
        var isStrictMode = true;
        treeWalker = Cucumber.Runtime.AstTreeWalker(features, supportCodeLibrary, listeners, isStrictMode);
      });

      it("returns true when no failure was encountered", function () {
        expect(treeWalker.didAllFeaturesSucceed()).toBeTruthy();
      });

      it("returns false when a failed step was encountered", function () {
        treeWalker.witnessFailedStep();
        expect(treeWalker.didAllFeaturesSucceed()).toBeFalsy();
      });

      it("returns false when a pending step was encountered", function () {
        treeWalker.witnessPendingStep();
        expect(treeWalker.didAllFeaturesSucceed()).toBeFalsy();
      });

      it("returns false when an undefined step was encountered", function () {
        treeWalker.witnessUndefinedStep();
        expect(treeWalker.didAllFeaturesSucceed()).toBeFalsy();
      });
    });
  });

  describe("isScenarioSuccessful()", function () {
    beforeEach(function () {
      var scenario = createSpy("scenario");
      treeWalker.witnessNewScenario(scenario);
    });

    it("returns true when no failed, pending or undefined step was encountered", function () {
      expect(treeWalker.isScenarioSuccessful()).toBeTruthy();
    });

    it("returns false when a pending step was encountered", function () {
      treeWalker.witnessPendingStep();
      expect(treeWalker.isScenarioSuccessful()).toBeFalsy();
    });

    it("returns false when a undefined step was encountered", function () {
      treeWalker.witnessUndefinedStep();
      expect(treeWalker.isScenarioSuccessful()).toBeFalsy();
    });

    it("returns false when a failed step was encountered", function () {
      treeWalker.witnessFailedStep();
      expect(treeWalker.isScenarioSuccessful()).toBeFalsy();
    });

    it("still returns true when a pending step was encountered but not in the current scenario", function () {
      treeWalker.witnessPendingStep();
      expect(treeWalker.isScenarioSuccessful()).toBeFalsy();
      var scenario = createSpy("scenario");
      treeWalker.witnessNewScenario(scenario);
      expect(treeWalker.isScenarioSuccessful()).toBeTruthy();
    });

    it("still returns true when a undefined step was encountered but not in the current scenario", function () {
      treeWalker.witnessUndefinedStep();
      expect(treeWalker.isScenarioSuccessful()).toBeFalsy();
      var scenario = createSpy("scenario");
      treeWalker.witnessNewScenario(scenario);
      expect(treeWalker.isScenarioSuccessful()).toBeTruthy();
    });

    it("still returns true when a failing step was encountered but not in the current scenario", function () {
      treeWalker.witnessFailedStep();
      expect(treeWalker.isScenarioSuccessful()).toBeFalsy();
      var scenario = createSpy("scenario");
      treeWalker.witnessNewScenario(scenario);
      expect(treeWalker.isScenarioSuccessful()).toBeTruthy();
    });
  });

  describe("isScenarioFailed()", function () {
    beforeEach(function () {
      var scenario = createSpy("scenario");
      treeWalker.witnessNewScenario(scenario);
    });

    it("returns false when no failed step was encountered", function () {
      expect(treeWalker.isScenarioFailed()).toBeFalsy();
    });

    it("still returns false when a pending step was encountered", function () {
      treeWalker.witnessPendingStep();
      expect(treeWalker.isScenarioFailed()).toBeFalsy();
    });

    it("still returns false when a undefined step was encountered", function () {
      treeWalker.witnessUndefinedStep();
      expect(treeWalker.isScenarioFailed()).toBeFalsy();
    });

    it("returns true when a failed step was encountered", function () {
      treeWalker.witnessFailedStep();
      expect(treeWalker.isScenarioFailed()).toBeTruthy();
    });

    it("still returns false when a failing step was encountered but not in the current scenario", function () {
      treeWalker.witnessFailedStep();
      expect(treeWalker.isScenarioFailed()).toBeTruthy();
      var scenario = createSpy("scenario");
      treeWalker.witnessNewScenario(scenario);
      expect(treeWalker.isScenarioFailed()).toBeFalsy();
    });
  });

  describe("isScenarioPending()", function () {
    beforeEach(function () {
      var scenario = createSpy("scenario");
      treeWalker.witnessNewScenario(scenario);
    });

    it("returns false when no pending step was encountered", function () {
      expect(treeWalker.isScenarioPending()).toBeFalsy();
    });

    it("returns true when a pending step was encountered", function () {
      treeWalker.witnessPendingStep();
      expect(treeWalker.isScenarioPending()).toBeTruthy();
    });

    it("still returns false when a undefined step was encountered", function () {
      treeWalker.witnessUndefinedStep();
      expect(treeWalker.isScenarioPending()).toBeFalsy();
    });

    it("still returns false when a failed step was encountered", function () {
      treeWalker.witnessFailedStep();
      expect(treeWalker.isScenarioPending()).toBeFalsy();
    });

    it("still returns false when a pending step was encountered but not in the current scenario", function () {
      treeWalker.witnessPendingStep();
      expect(treeWalker.isScenarioPending()).toBeTruthy();
      var scenario = createSpy("scenario");
      treeWalker.witnessNewScenario(scenario);
      expect(treeWalker.isScenarioPending()).toBeFalsy();
    });
  });

  describe("isScenarioUndefined()", function () {
    beforeEach(function () {
      var scenario = createSpy("scenario");
      treeWalker.witnessNewScenario(scenario);
    });

    it("returns false when no undefined step was encountered", function () {
      expect(treeWalker.isScenarioUndefined()).toBeFalsy();
    });

    it("still returns false when a pending step was encountered", function () {
      treeWalker.witnessPendingStep();
      expect(treeWalker.isScenarioUndefined()).toBeFalsy();
    });

    it("returns true when a undefined step was encountered", function () {
      treeWalker.witnessUndefinedStep();
      expect(treeWalker.isScenarioUndefined()).toBeTruthy();
    });

    it("still returns false when a failed step was encountered", function () {
      treeWalker.witnessFailedStep();
      expect(treeWalker.isScenarioUndefined()).toBeFalsy();
    });

    it("still returns false when a undefined step was encountered but not in the current scenario", function () {
      treeWalker.witnessUndefinedStep();
      expect(treeWalker.isScenarioUndefined()).toBeTruthy();
      var scenario = createSpy("scenario");
      treeWalker.witnessNewScenario(scenario);
      expect(treeWalker.isScenarioUndefined()).toBeFalsy();
    });
  });

  describe("attach()", function () {
    var data, mimeType, attachment;

    beforeEach(function () {
      data       = createSpy("data");
      mimeType   = createSpy("mimeType");
      attachment = createSpy("attachment");
      spyOn(Cucumber.Runtime, 'Attachment').andReturn(attachment);

      treeWalker.attach(data, mimeType);
    });

    it("creates an attachment", function () {
      expect(Cucumber.Runtime.Attachment).toHaveBeenCalledWith({mimeType: mimeType, data: data});
    });

    it("adds the attachment to the collection", function () {
      expect(attachmentCollection.add).toHaveBeenCalledWith(attachment);
    });
  });

  describe("getAttachments()", function () {
    var returnValue;

    beforeEach(function () {
      returnValue = treeWalker.getAttachments();
    });

    it("returns the attachments", function () {
      expect(returnValue).toBe(attachmentCollection);
    });
  });

  describe("witnessNewStep()", function () {
    beforeEach(function () {
      treeWalker.witnessNewStep();
    });

    it("clears the attachments", function () {
      expect(attachmentCollection.clear).toHaveBeenCalled();
    });
  });

  describe("witnessNewScenario()", function () {
    var scenario, apiScenario;

    beforeEach(function () {
      scenario    = createSpy("scenario");
      apiScenario = createSpy("API scenario");
      spyOn(Cucumber.Api, 'Scenario').andReturn(apiScenario);

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
        spyOn(Cucumber.Api, 'Scenario').andReturn(apiScenario);

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
      treeWalker.witnessFailedStep();
      expect(treeWalker.isSkippingSteps()).toBeTruthy();
    });

    it("returns true when a pending step was encountered", function () {
      treeWalker.witnessPendingStep();
      expect(treeWalker.isSkippingSteps()).toBeTruthy();
    });

    it("returns true when a undefined step was encountered", function () {
      treeWalker.witnessUndefinedStep();
      expect(treeWalker.isSkippingSteps()).toBeTruthy();
    });

    it("returns false when a failed step was encountered but not in the current scenario", function () {
      treeWalker.witnessFailedStep();
      var scenario = createSpy("scenario");
      treeWalker.witnessNewScenario(scenario);
      expect(treeWalker.isSkippingSteps()).toBeFalsy();
    });

    it("returns false when a pending step was encountered but not in the current scenario", function () {
      treeWalker.witnessPendingStep();
      var scenario = createSpy("scenario");
      treeWalker.witnessNewScenario(scenario);
      expect(treeWalker.isSkippingSteps()).toBeFalsy();
    });

    it("returns false when a undefined step was encountered but not in the current scenario", function () {
      treeWalker.witnessUndefinedStep();
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
        treeWalker.isStepUndefined.andReturn(true);
        spyOn(treeWalker, 'witnessUndefinedStep');
      });

      it("witnesses an undefined step", function () {
        treeWalker.processStep(step, callback);
        expect(treeWalker.witnessUndefinedStep).toHaveBeenCalled();
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
        treeWalker.isStepUndefined.andReturn(false);
      });

      it("checks whether the step should be skipped", function () {
        treeWalker.processStep(step, callback);
        expect(treeWalker.isSkippingSteps).toHaveBeenCalled();
      });

      describe("when the steps are skipped", function () {
        beforeEach(function () {
          treeWalker.isSkippingSteps.andReturn(true);
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
          treeWalker.isSkippingSteps.andReturn(false);
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
    var step, callback, event, skippedStepResult, payload;

    beforeEach(function () {
      step              = createSpyWithStubs("step AST element");
      callback          = createSpy("callback");
      event             = createSpy("event");
      skippedStepResult = createSpy("skipped step result");
      payload           = { stepResult: skippedStepResult};
      spyOn(Cucumber.Runtime, 'SkippedStepResult').andReturn(skippedStepResult);
      spyOn(Cucumber.Runtime.AstTreeWalker, 'Event').andReturn(event);
      spyOn(treeWalker, 'broadcastEvent');
    });

    it("creates a new skipped step result", function () {
      treeWalker.skipStep(step, callback);
      expect(Cucumber.Runtime.SkippedStepResult).toHaveBeenCalledWith({step: step});
    });

    it("creates a new event about the skipped step result", function () {
      treeWalker.skipStep(step, callback);
      expect(Cucumber.Runtime.AstTreeWalker.Event).toHaveBeenCalledWith(Cucumber.Runtime.AstTreeWalker.STEP_RESULT_EVENT_NAME, payload);
    });

    it("brodcasts the skipped step result event", function () {
      treeWalker.skipStep(step, callback);
      expect(treeWalker.broadcastEvent).toHaveBeenCalledWith(event, callback);
    });
  });

  describe("skipUndefinedStep()", function () {
    var step, callback, event, undefinedStepResult, payload;

    beforeEach(function () {
      step                = createSpyWithStubs("step AST element");
      callback            = createSpy("callback");
      undefinedStepResult = createSpy("undefined step result");
      payload             = {stepResult: undefinedStepResult};
      spyOn(Cucumber.Runtime, 'UndefinedStepResult').andReturn(undefinedStepResult);
      spyOn(Cucumber.Runtime.AstTreeWalker, 'Event').andReturn(event);
      spyOn(treeWalker, 'broadcastEvent');
    });

    it("creates a new undefined step result", function () {
      treeWalker.skipUndefinedStep(step, callback);
      expect(Cucumber.Runtime.UndefinedStepResult).toHaveBeenCalledWith({step: step});
    });

    it("creates a new event about the undefined step result", function () {
      treeWalker.skipUndefinedStep(step, callback);
      expect(Cucumber.Runtime.AstTreeWalker.Event).toHaveBeenCalledWith(Cucumber.Runtime.AstTreeWalker.STEP_RESULT_EVENT_NAME, payload);
    });

    it("brodcasts the undefined step result event", function () {
      treeWalker.skipUndefinedStep(step, callback);
      expect(treeWalker.broadcastEvent).toHaveBeenCalledWith(event, callback);
    });
  });
});
