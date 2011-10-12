require('../../support/spec_helper');

describe("Cucumber.Runtime.AstTreeWalker", function() {
  var Cucumber = require('cucumber');
  var treeWalker, features, supportCodeLibrary, listeners;

  beforeEach(function() {
    features           = createSpyWithStubs("Features AST element", {acceptVisitor: null});
    supportCodeLibrary = createSpy("Support code library");
    listeners          = [createSpy("First listener"), createSpy("Second listener")];
    spyOnStub(listeners, 'syncForEach').andCallFake(function(cb) { listeners.forEach(cb); });
    treeWalker         = Cucumber.Runtime.AstTreeWalker(features, supportCodeLibrary, listeners);
  });

  describe("walk()", function() {
    var callback;

    beforeEach(function() {
      callback = createSpy("Callback");
      spyOn(treeWalker, 'visitFeatures');
    });

    it("visits all features with a callback", function() {
      treeWalker.walk(callback);
      expect(treeWalker.visitFeatures).
        toHaveBeenCalledWithValueAsNthParameter(features, 1);
      expect(treeWalker.visitFeatures).
        toHaveBeenCalledWithAFunctionAsNthParameter(2);
    });

    describe("features visit callback", function() {
      var featuresVisitCallback, featuresResult;

      beforeEach(function() {
        treeWalker.walk(callback);
        featuresVisitCallback = treeWalker.visitFeatures.mostRecentCall.args[1];
        featuresResult = createSpy("result of all features");
        spyOn(treeWalker, 'didAllFeaturesSucceed').andReturn(featuresResult);
      });

      it("checks wether all features were successful", function() {
        featuresVisitCallback();
        expect(treeWalker.didAllFeaturesSucceed).toHaveBeenCalled();
      });

      it("calls back with the result of the features", function() {
        featuresVisitCallback();
        expect(callback).toHaveBeenCalledWith(featuresResult);
      });
    });
  });

  describe("visitFeatures()", function() {
    var callback, event;

    beforeEach(function() {
      callback = createSpy("Callback");
      event    = createSpy("Event");
      spyOn(Cucumber.Runtime.AstTreeWalker, 'Event').andReturn(event);
      spyOn(treeWalker, 'broadcastEventAroundUserFunction');
    });

    it("creates a new event about the features' visit", function() {
      treeWalker.visitFeatures(features, callback);
      expect(Cucumber.Runtime.AstTreeWalker.Event).toHaveBeenCalledWith(Cucumber.Runtime.AstTreeWalker.FEATURES_EVENT_NAME);
    });

    it("broadcasts the visit of the features", function() {
      treeWalker.visitFeatures(features, callback);
      expect(treeWalker.broadcastEventAroundUserFunction).toHaveBeenCalled();
      expect(treeWalker.broadcastEventAroundUserFunction).
        toHaveBeenCalledWithValueAsNthParameter(event, 1);
      expect(treeWalker.broadcastEventAroundUserFunction).
        toHaveBeenCalledWithAFunctionAsNthParameter(2);
      expect(treeWalker.broadcastEventAroundUserFunction).
        toHaveBeenCalledWithValueAsNthParameter(callback, 3);
    });

    describe("user function", function() {
      var userFunction, userFunctionCallback;

      beforeEach(function() {
        userFunctionCallback = createSpy("User function callback");
        treeWalker.visitFeatures(features, callback);
        userFunction = treeWalker.broadcastEventAroundUserFunction.mostRecentCall.args[1];
      });


      it("visits the features, passing it the received callback", function() {
        userFunction(userFunctionCallback);
        expect(features.acceptVisitor).toHaveBeenCalledWith(treeWalker, userFunctionCallback);
      });
    });
  });

  describe("visitFeature()", function() {
    var feature, callback, event, payload;

    beforeEach(function() {
      feature  = createSpyWithStubs("Feature AST element", {acceptVisitor: null});
      callback = createSpy("Callback");
      event    = createSpy("Event");
      payload  = {feature: feature};
      spyOn(Cucumber.Runtime.AstTreeWalker, 'Event').andReturn(event);
      spyOn(treeWalker, 'broadcastEventAroundUserFunction');
    });

    it("creates a new event about the feature' visit", function() {
      treeWalker.visitFeature(feature, callback);
      expect(Cucumber.Runtime.AstTreeWalker.Event).toHaveBeenCalledWith(Cucumber.Runtime.AstTreeWalker.FEATURE_EVENT_NAME, payload);
    });

    it("broadcasts the visit of the feature", function() {
      treeWalker.visitFeature(feature, callback);
      expect(treeWalker.broadcastEventAroundUserFunction).toHaveBeenCalled();
      expect(treeWalker.broadcastEventAroundUserFunction).
        toHaveBeenCalledWithValueAsNthParameter(event, 1);
      expect(treeWalker.broadcastEventAroundUserFunction).
        toHaveBeenCalledWithAFunctionAsNthParameter(2);
      expect(treeWalker.broadcastEventAroundUserFunction).
        toHaveBeenCalledWithValueAsNthParameter(callback, 3);
    });

    describe("user function", function() {
      var userFunction, userFunctionCallback;

      beforeEach(function() {
        userFunctionCallback = createSpy("User function callback");
        treeWalker.visitFeature(feature, callback);
        userFunction = treeWalker.broadcastEventAroundUserFunction.mostRecentCall.args[1];
      });

      it("visits the feature, passing it the received callback", function() {
        userFunction(userFunctionCallback);
        expect(feature.acceptVisitor).toHaveBeenCalledWith(treeWalker, userFunctionCallback);
      });
    });
  });

  describe("visitBackground()", function() {
    var background, callback, event, payload;

    beforeEach(function() {
      scenario = createSpyWithStubs("background AST element");
      callback = createSpy("callback");
      event    = createSpy("event");
      payload  = {background: background};
      spyOn(Cucumber.Runtime.AstTreeWalker, 'Event').andReturn(event);
      spyOn(treeWalker, 'broadcastEvent');
    });

    it("creates a new event about the background", function() {
      treeWalker.visitBackground(background, callback);
      expect(Cucumber.Runtime.AstTreeWalker.Event).toHaveBeenCalledWith(Cucumber.Runtime.AstTreeWalker.BACKGROUND_EVENT_NAME, payload);
    });

    it("broadcasts the visit of the background", function() {
      treeWalker.visitBackground(background, callback);
      expect(treeWalker.broadcastEvent).toHaveBeenCalledWith(event, callback);
    });
  });

  describe("visitScenario()", function() {
    var scenario, callback, event, payload;
    var world;

    beforeEach(function() {
      scenario = createSpyWithStubs("Scenario AST element", {acceptVisitor: null});
      callback = createSpy("Callback");
      event    = createSpy("Event");
      payload  = {scenario: scenario};
      world    = createSpy("world instance");
      spyOn(Cucumber.Runtime.AstTreeWalker, 'Event').andReturn(event);
      spyOnStub(supportCodeLibrary, 'instantiateNewWorld').andReturn(world);
      spyOn(treeWalker, 'broadcastEventAroundUserFunction');
      spyOn(treeWalker, 'witnessNewScenario');
      spyOn(treeWalker, 'setWorld');
    });

    it("witnesses a new scenario", function() {
      treeWalker.visitScenario(scenario, callback);
      expect(treeWalker.witnessNewScenario).toHaveBeenCalled();
    });

    it("instantiates a new World instance", function() {
      treeWalker.visitScenario(scenario, callback);
      expect(supportCodeLibrary.instantiateNewWorld).toHaveBeenCalled();
    });

    it("sets the new World instance", function() {
      treeWalker.visitScenario(scenario, callback);
      expect(treeWalker.setWorld).toHaveBeenCalledWith(world);
    });

    it("creates a new event about the scenario", function() {
      treeWalker.visitScenario(scenario, callback);
      expect(Cucumber.Runtime.AstTreeWalker.Event).toHaveBeenCalledWith(Cucumber.Runtime.AstTreeWalker.SCENARIO_EVENT_NAME, payload);
    });

    it("broadcasts the visit of the scenario", function() {
      treeWalker.visitScenario(scenario, callback);
      expect(treeWalker.broadcastEventAroundUserFunction).toHaveBeenCalled();
      expect(treeWalker.broadcastEventAroundUserFunction).
        toHaveBeenCalledWithValueAsNthParameter(event, 1);
      expect(treeWalker.broadcastEventAroundUserFunction).
        toHaveBeenCalledWithAFunctionAsNthParameter(2);
      expect(treeWalker.broadcastEventAroundUserFunction).
        toHaveBeenCalledWithValueAsNthParameter(callback, 3);
    });

    describe("user function", function() {
      var userFunction, userFunctionCallback;

      beforeEach(function() {
        userFunctionCallback = createSpy("User function callback");
        treeWalker.visitScenario(scenario, callback);
        userFunction = treeWalker.broadcastEventAroundUserFunction.mostRecentCall.args[1];
      });

      it("visits the scenario, passing it the received callback", function() {
        userFunction(userFunctionCallback);
        expect(scenario.acceptVisitor).toHaveBeenCalledWith(treeWalker, userFunctionCallback);
      });
    });
  });

  describe("visitStep()", function() {
    var step, callback, event, payload;

    beforeEach(function() {
      step     = createSpyWithStubs("Step AST element", {acceptVisitor: null});
      callback = createSpy("Callback");
      spyOn(treeWalker, 'isStepUndefined');
      spyOn(treeWalker, 'isSkippingSteps');
      spyOn(treeWalker, 'skipUndefinedStep');
      spyOn(treeWalker, 'executeStep');
      spyOn(treeWalker, 'skipStep');
    });

    it("checks wether the step is undefined or not", function() {
      treeWalker.visitStep(step, callback);
      expect(treeWalker.isStepUndefined).toHaveBeenCalledWith(step);
    });

    describe("when the step is undefined", function() {
      beforeEach(function() {
        treeWalker.isStepUndefined.andReturn(true);
        spyOn(treeWalker, 'witnessUndefinedStep');
      });

      it("witnesses an undefined step", function() {
        treeWalker.visitStep(step, callback);
        expect(treeWalker.witnessUndefinedStep).toHaveBeenCalled();
      });

      it("skips the undefined step", function() {
        treeWalker.visitStep(step, callback);
        expect(treeWalker.skipUndefinedStep).toHaveBeenCalledWith(step, callback);
      });

      it("does not execute the step", function() {
        treeWalker.visitStep(step, callback);
        expect(treeWalker.executeStep).not.toHaveBeenCalled();
      });

      it("does not skip the step as a defined step", function() {
        treeWalker.visitStep(step, callback);
        expect(treeWalker.skipStep).not.toHaveBeenCalled();
      });
    });

    describe("when the step is defined", function() {
      beforeEach(function() {
        treeWalker.isStepUndefined.andReturn(false);
      });

      it("checks wether the step should be skipped", function() {
        treeWalker.visitStep(step, callback);
        expect(treeWalker.isSkippingSteps).toHaveBeenCalled();
      });

      describe("when the steps are not skipped", function() {
        beforeEach(function() {
          treeWalker.isSkippingSteps.andReturn(false);
        });

        it("executes the step", function() {
          treeWalker.visitStep(step, callback);
          expect(treeWalker.executeStep).toHaveBeenCalledWith(step, callback);
        });

        it("does not skip the step", function() {
          treeWalker.visitStep(step, callback);
          expect(treeWalker.skipStep).not.toHaveBeenCalled();
        });
      });

      describe("when the steps are skipped", function() {
        beforeEach(function() {
          treeWalker.isSkippingSteps.andReturn(true);
        });

        it("skips the step", function() {
          treeWalker.visitStep(step, callback);
          expect(treeWalker.skipStep).toHaveBeenCalledWith(step, callback);
        });

        it("does not execute the step", function() {
          treeWalker.visitStep(step, callback);
          expect(treeWalker.executeStep).not.toHaveBeenCalled();
        });
      });
    });
  });

  describe("visitStepResult()", function() {
    var stepResult, callback, event, payload;

    beforeEach(function() {
      stepResult = createSpyWithStubs("Step result", {isFailed: undefined, isPending: undefined});
      callback   = createSpy("Callback");
      event      = createSpy("Event");
      payload    = {stepResult: stepResult};
      spyOn(treeWalker, 'broadcastEvent');
      spyOn(treeWalker, 'witnessFailedStep');
      spyOn(Cucumber.Runtime.AstTreeWalker, 'Event').andReturn(event);
    });

    it("creates a new event about the step result", function() {
      treeWalker.visitStepResult(stepResult, callback);
      expect(Cucumber.Runtime.AstTreeWalker.Event).toHaveBeenCalledWith(Cucumber.Runtime.AstTreeWalker.STEP_RESULT_EVENT_NAME, payload);
    });

    it("broadcasts the visit of the step result and the step result itself", function() {
      treeWalker.visitStepResult(stepResult, callback);
      expect(treeWalker.broadcastEvent).toHaveBeenCalledWith(event, callback);
    });

    it("checks wether the step failed or not", function() {
      treeWalker.visitStepResult(stepResult, callback);
      expect(stepResult.isFailed).toHaveBeenCalled();
    });

    describe("when the step failed", function() {
      beforeEach(function() {
        stepResult.isFailed.andReturn(true);
      });

      it("witnesses a failed step", function() {
        treeWalker.visitStepResult(stepResult, callback);
        expect(treeWalker.witnessFailedStep).toHaveBeenCalled();
      });
    });

    describe("when the step did not fail", function() {
      beforeEach(function() {
        stepResult.isFailed.andReturn(false);
        spyOn(treeWalker, 'witnessPendingStep');
      });

      it("does not witness a failed step", function() {
        treeWalker.visitStepResult(stepResult, callback);
        expect(treeWalker.witnessFailedStep).not.toHaveBeenCalled();
      });

      it("checks wether the step was pending or not", function() {
        treeWalker.visitStepResult(stepResult, callback);
        expect(stepResult.isPending).toHaveBeenCalled();
      });

      describe("when the step was pending", function() {
        beforeEach(function() {
          stepResult.isPending.andReturn(true);
        });

        it("witnesses a pending step", function() {
          treeWalker.visitStepResult(stepResult, callback);
          expect(treeWalker.witnessPendingStep).toHaveBeenCalled();
        });
      });

      describe("when the step was not pending", function() {
        beforeEach(function() {
          stepResult.isPending.andReturn(false);
        });

        it("does not witness a pending step", function() {
          treeWalker.visitStepResult(stepResult, callback);
          expect(treeWalker.witnessPendingStep).not.toHaveBeenCalled();
        });
      });
    });

    it("does not call back by itself", function() {
      treeWalker.visitStepResult(stepResult, callback);
      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe("broadcastEventAroundUserFunction()", function() {
    var event, userFunction, callback;
    var userFunctionWrapper;

    beforeEach(function() {
      event               = createSpy("Event");
      userFunction        = createSpy("User function");
      callback            = createSpy("Callback");
      userFunctionWrapper = createSpy("User function wrapper");
      spyOn(treeWalker, 'wrapUserFunctionAndAfterEventBroadcast').andReturn(userFunctionWrapper);
      spyOn(treeWalker, 'broadcastBeforeEvent');
    });

    it("wraps the user function and after event broadcast together", function() {
      treeWalker.broadcastEventAroundUserFunction(event, userFunction, callback);
      expect(treeWalker.wrapUserFunctionAndAfterEventBroadcast).toHaveBeenCalledWith(userFunction, event, callback);
    });

    it("broadcasts a before event with the user function and after event broadcast wrapper as callback", function() {
      treeWalker.broadcastEventAroundUserFunction(event, userFunction, callback);
      expect(treeWalker.broadcastBeforeEvent).toHaveBeenCalledWith(event, userFunctionWrapper);
    });
  });

  describe("wrapUserFunctionAndAfterEventBroadcast()", function() {
    var userFunction, event, callback;
    var broadcastAfterEventWrapper;

    beforeEach(function() {
      userFunction               = createSpy("User function");
      event                      = createSpy("Event");
      callback                   = createSpy("Callback");
      broadcastAfterEventWrapper = createSpy("After event broadcast wrapper");
      spyOn(treeWalker, 'wrapAfterEventBroadcast').andReturn(broadcastAfterEventWrapper);
    });

    it("wraps the after event broadcast to use as a callback", function() {
      treeWalker.wrapUserFunctionAndAfterEventBroadcast(userFunction, event, callback);
      expect(treeWalker.wrapAfterEventBroadcast).toHaveBeenCalledWith(event, callback);
    });

    it("returns a wrapper function", function() {
      var returned = treeWalker.wrapUserFunctionAndAfterEventBroadcast(userFunction, event, callback);
      expect(returned).toBeAFunction();
    });

    describe("returned wrapper function", function() {
      var wrapper;

      beforeEach(function() {
        wrapper = treeWalker.wrapUserFunctionAndAfterEventBroadcast(userFunction, event, callback);
      });

      it("calls the user function with the after event broadcast wrapper", function() {
        wrapper();
        expect(userFunction).toHaveBeenCalledWith(broadcastAfterEventWrapper);
      });
    });
  });

  describe("wrapAfterEventBroadcast()", function() {
    var event, callback;

    beforeEach(function() {
      event    = createSpy("Event");
      callback = createSpy("Callback");
    });

    it("returns a function", function() {
      var returned = treeWalker.wrapAfterEventBroadcast(event, callback);
      expect(returned).toBeAFunction();
    });

    describe("returned wrapper function", function() {
      var wrapper;

      beforeEach(function() {
        wrapper = treeWalker.wrapAfterEventBroadcast(event, callback);
        spyOn(treeWalker, 'broadcastAfterEvent');;
      });

      it("broadcasts an after event with the received callback as callback", function() {
        wrapper();
        expect(treeWalker.broadcastAfterEvent).toHaveBeenCalledWith(event, callback);
      });
    });
  });

  describe("broadcastBeforeEvent()", function() {
    var event, callback, preEvent;

    beforeEach(function() {
      preEvent = createSpy("Pre-event (before)");
      event    = createSpyWithStubs("Event", { replicateAsPreEvent: preEvent });
      callback = createSpy("Callback");
      spyOn(treeWalker, 'broadcastEvent');
    });

    it("asks the event to replicate itself as a before event", function() {
      treeWalker.broadcastBeforeEvent(event, callback);
      expect(event.replicateAsPreEvent).toHaveBeenCalled();
    });

    it("broadcasts the pre event with the call back", function() {
      treeWalker.broadcastBeforeEvent(event, callback);
      expect(treeWalker.broadcastEvent).toHaveBeenCalledWith(preEvent, callback);
    });
  });

  describe("broadcastAfterEvent()", function() {
    var event, callback, postEvent;

    beforeEach(function() {
      postEvent = createSpy("Post-event (after)");
      event    = createSpyWithStubs("Event", { replicateAsPostEvent: postEvent });
      callback = createSpy("Callback");
      spyOn(treeWalker, 'broadcastEvent');
    });

    it("asks the event to replicate itself as a after event", function() {
      treeWalker.broadcastAfterEvent(event, callback);
      expect(event.replicateAsPostEvent).toHaveBeenCalled();
    });

    it("broadcasts the post event with the call back", function() {
      treeWalker.broadcastAfterEvent(event, callback);
      expect(treeWalker.broadcastEvent).toHaveBeenCalledWith(postEvent, callback);
    });
  });


  describe("broadcastEvent()", function() {
    var event, eventName, callback;

    beforeEach(function() {
      event    = createSpy("Event");
      callback = createSpy("Callback");
      spyOn(listeners, 'forEach');
    });

    it("iterates over the listeners", function() {
      treeWalker.broadcastEvent(event, callback);
      expect(listeners.forEach).toHaveBeenCalled();
      expect(listeners.forEach).toHaveBeenCalledWithAFunctionAsNthParameter(1);
      expect(listeners.forEach).toHaveBeenCalledWithValueAsNthParameter(callback, 2);
    });

    describe("for each listener", function() {
      var userFunction, listener, forEachCallback;

      beforeEach(function() {
        listener        = createSpyWithStubs("Listener", {hear:null});
        forEachCallback = createSpy("forEach() callback");
        treeWalker.broadcastEvent(event, callback);
        userFunction = listeners.forEach.mostRecentCall.args[0];
      });

      it("tells the listener about the event and calls back when finished", function() {
        userFunction(listener, forEachCallback);
        expect(listener.hear).toHaveBeenCalledWith(event, forEachCallback);
      });
    });
  });

  describe("getWorld() [setWorld()]", function() {
    var world;

    beforeEach(function() {
      world = createSpy("world instance");
    });

    it("returns the World instance set with setWorld()", function() {
      treeWalker.setWorld(world);
      expect(treeWalker.getWorld()).toBe(world);
    });
  });

  describe("lookupStepDefinitionByName()", function() {
    var stepName, stepDefinition;

    beforeEach(function() {
      stepName       = createSpy("Step name");
      stepDefinition = createSpy("Step definition");
      spyOnStub(supportCodeLibrary, 'lookupStepDefinitionByName').andReturn(stepDefinition);
    });

    it("asks the support code library for the step definition", function() {
      treeWalker.lookupStepDefinitionByName(stepName);
      expect(supportCodeLibrary.lookupStepDefinitionByName).toHaveBeenCalledWith(stepName);
    });

    it("returns the step definition returned by the library", function() {
      expect(treeWalker.lookupStepDefinitionByName(stepName)).toBe(stepDefinition);
    });
  });

  describe("isStepUndefined()", function() {
    var step, stepName;

    beforeEach(function() {
      stepName                = createSpy("name of the step");
      step                    = createSpyWithStubs("step", {getName: stepName});
      spyOnStub(supportCodeLibrary, 'isStepDefinitionNameDefined');
    });

    it("gets the name of the step", function() {
      treeWalker.isStepUndefined(step);
      expect(step.getName).toHaveBeenCalled();
    });

    it("asks the support code library wether a step definition is defined for that name", function() {
      treeWalker.isStepUndefined(step);
      expect(supportCodeLibrary.isStepDefinitionNameDefined).toHaveBeenCalledWith(stepName);
    });

    describe("when the step definition is defined", function() {
      beforeEach(function() {
        supportCodeLibrary.isStepDefinitionNameDefined.andReturn(true);
      });

      it("returns false", function() {
        expect(treeWalker.isStepUndefined(step)).toBeFalsy();
      });
    });

    describe("when the step definition is undefined", function() {
      beforeEach(function() {
        supportCodeLibrary.isStepDefinitionNameDefined.andReturn(false);
      });

      it("returns true", function() {
        expect(treeWalker.isStepUndefined(step)).toBeTruthy();
      });
    });
  });

  describe("didAllFeaturesSucceed()", function() {
    it("returns true when no failure was encountered", function() {
      expect(treeWalker.didAllFeaturesSucceed()).toBeTruthy();
    });

    it("returns false when a failed step was encountered", function() {
      treeWalker.witnessFailedStep();
      expect(treeWalker.didAllFeaturesSucceed()).toBeFalsy();
    });
  });

  describe("isSkippingSteps() [witnessFailedSteps(), witnessPendingSteps(), witnessUndefinedStep(), witnessNewScenario()]", function() {
    it("returns false when no failed, pending or undefined steps were encountered", function() {
      expect(treeWalker.isSkippingSteps()).toBeFalsy();
    });

    it("returns true when a failed step was encountered", function() {
      treeWalker.witnessFailedStep();
      expect(treeWalker.isSkippingSteps()).toBeTruthy();
    });

    it("returns true when a pending step was encountered", function() {
      treeWalker.witnessPendingStep();
      expect(treeWalker.isSkippingSteps()).toBeTruthy();
    });

    it("returns true when a undefined step was encountered", function() {
      treeWalker.witnessUndefinedStep();
      expect(treeWalker.isSkippingSteps()).toBeTruthy();
    });

    it("returns false when a failed step was encountered but not in the current scenario", function() {
      treeWalker.witnessFailedStep();
      treeWalker.witnessNewScenario();
      expect(treeWalker.isSkippingSteps()).toBeFalsy();
    });

    it("returns false when a pending step was encountered but not in the current scenario", function() {
      treeWalker.witnessPendingStep();
      treeWalker.witnessNewScenario();
      expect(treeWalker.isSkippingSteps()).toBeFalsy();
    });

    it("returns false when a undefined step was encountered but not in the current scenario", function() {
      treeWalker.witnessUndefinedStep();
      treeWalker.witnessNewScenario();
      expect(treeWalker.isSkippingSteps()).toBeFalsy();
    });
  });

  describe("executeStep()", function() {
    var step, callback, event, payload;

    beforeEach(function() {
      step     = createSpyWithStubs("Step AST element", {acceptVisitor: null});
      callback = createSpy("Callback");
      event    = createSpy("Event");
      payload  = {step: step};
      spyOn(Cucumber.Runtime.AstTreeWalker, 'Event').andReturn(event);
      spyOn(treeWalker, 'broadcastEventAroundUserFunction');
    });

    it("creates a new event about the executed step", function() {
      treeWalker.executeStep(step, callback);
      expect(Cucumber.Runtime.AstTreeWalker.Event).toHaveBeenCalledWith(Cucumber.Runtime.AstTreeWalker.STEP_EVENT_NAME, payload);
    });

    it("broadcasts the step", function() {
      treeWalker.executeStep(step, callback);
      expect(treeWalker.broadcastEventAroundUserFunction).toHaveBeenCalled();
      expect(treeWalker.broadcastEventAroundUserFunction).
        toHaveBeenCalledWithValueAsNthParameter(event, 1);
      expect(treeWalker.broadcastEventAroundUserFunction).
        toHaveBeenCalledWithAFunctionAsNthParameter(2);
      expect(treeWalker.broadcastEventAroundUserFunction).
        toHaveBeenCalledWithValueAsNthParameter(callback, 3);
    });

    describe("user function", function() {
      var userFunction, userFunctionCallback;

      beforeEach(function() {
        userFunctionCallback = createSpy("User function callback");
        treeWalker.executeStep(step, callback);
        userFunction = treeWalker.broadcastEventAroundUserFunction.mostRecentCall.args[1];
      });

      it("visits the step, passing it the received callback", function() {
        userFunction(userFunctionCallback);
        expect(step.acceptVisitor).toHaveBeenCalledWith(treeWalker, userFunctionCallback);
      });
    });
  });

  describe("skipStep()", function() {
    var step, callback, event, payload;

    beforeEach(function() {
      step     = createSpyWithStubs("step AST element");
      callback = createSpy("callback");
      event    = createSpy("event");
      payload  = {step: step};
      spyOn(Cucumber.Runtime.AstTreeWalker, 'Event').andReturn(event);
      spyOn(treeWalker, 'broadcastEvent');
    });

    it("creates a new event about the skipped step visit", function() {
      treeWalker.skipStep(step, callback);
      expect(Cucumber.Runtime.AstTreeWalker.Event).toHaveBeenCalledWith(Cucumber.Runtime.AstTreeWalker.SKIPPED_STEP_EVENT_NAME, payload);
    });

    it("brodcasts the skipped step", function() {
      treeWalker.skipStep(step, callback);
      expect(treeWalker.broadcastEvent).toHaveBeenCalledWith(event, callback);
    });
  });

  describe("skipUndefinedStep()", function() {
    var step, callback, event, payload;

    beforeEach(function() {
      step     = createSpyWithStubs("step AST element");
      callback = createSpy("callback");
      payload  = {step: step};
      spyOn(Cucumber.Runtime.AstTreeWalker, 'Event').andReturn(event);
      spyOn(treeWalker, 'broadcastEvent');
    });

    it("creates a new event about the undefined step visit", function() {
      treeWalker.skipUndefinedStep(step, callback);
      expect(Cucumber.Runtime.AstTreeWalker.Event).toHaveBeenCalledWith(Cucumber.Runtime.AstTreeWalker.UNDEFINED_STEP_EVENT_NAME, payload);
    });

    it("brodcasts the undefined step", function() {
      treeWalker.skipUndefinedStep(step, callback);
      expect(treeWalker.broadcastEvent).toHaveBeenCalledWith(event, callback);
    });
  });
});
