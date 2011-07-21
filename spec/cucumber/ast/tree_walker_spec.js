require('../../support/spec_helper');

describe("Cucumber.Ast.TreeWalker", function() {
  var Cucumber = require('cucumber');
  var treeWalker, features, supportCodeLibrary, listeners;

  beforeEach(function() {
    features           = createSpyWithStubs("Features AST element", {acceptVisitor: null});
    supportCodeLibrary = createSpy("Support code library");
    listeners          = [createSpy("First listener"), createSpy("Second listener")];
    spyOnStub(listeners, 'syncForEach').andCallFake(function(cb) { listeners.forEach(cb); });
    treeWalker         = Cucumber.Ast.TreeWalker(features, supportCodeLibrary, listeners);
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
      spyOn(Cucumber.Ast.TreeWalker, 'Event').andReturn(event);
      spyOn(treeWalker, 'broadcastEventAroundUserFunction');
    });

    it("creates a new event about the features' visit", function() {
      treeWalker.visitFeatures(features, callback);
      expect(Cucumber.Ast.TreeWalker.Event).toHaveBeenCalledWith(Cucumber.Ast.TreeWalker.FEATURES_EVENT_NAME);
    });

    it("broadcasts the features' visit", function() {
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
      spyOn(Cucumber.Ast.TreeWalker, 'Event').andReturn(event);
      spyOn(treeWalker, 'broadcastEventAroundUserFunction');
    });

    it("creates a new event about the feature' visit", function() {
      treeWalker.visitFeature(feature, callback);
      expect(Cucumber.Ast.TreeWalker.Event).toHaveBeenCalledWith(Cucumber.Ast.TreeWalker.FEATURE_EVENT_NAME, payload);
    });

    it("broadcasts the feature's visit", function() {
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

  describe("visitScenario()", function() {
    var scenario, callback, event, payload;

    beforeEach(function() {
      scenario = createSpyWithStubs("Scenario AST element", {acceptVisitor: null});
      callback = createSpy("Callback");
      event    = createSpy("Event");
      payload  = {scenario: scenario};
      spyOn(Cucumber.Ast.TreeWalker, 'Event').andReturn(event);
      spyOn(treeWalker, 'broadcastEventAroundUserFunction');
      spyOn(treeWalker, 'witnessNewScenario');
    });

    it("witnesses a new scenario", function() {
      treeWalker.visitScenario(scenario, callback);
      expect(treeWalker.witnessNewScenario).toHaveBeenCalled();
    });

    it("creates a new event about the scenario's visit", function() {
      treeWalker.visitScenario(scenario, callback);
      expect(Cucumber.Ast.TreeWalker.Event).toHaveBeenCalledWith(Cucumber.Ast.TreeWalker.SCENARIO_EVENT_NAME, payload);
    });

    it("broadcasts the scenario's visit", function() {
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
      spyOn(treeWalker, 'isSkippingSteps');
      spyOn(treeWalker, 'executeStep');
      spyOn(treeWalker, 'skipStep');
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

  describe("visitStepResult()", function() {
    var stepResult, callback, event, payload;

    beforeEach(function() {
      stepResult = createSpyWithStubs("Step result", {isSuccessful: undefined});
      callback   = createSpy("Callback");
      event      = createSpy("Event");
      payload    = {stepResult: stepResult};
      spyOn(treeWalker, 'broadcastEvent');
      spyOn(treeWalker, 'witnessFailedStep');
      spyOn(Cucumber.Ast.TreeWalker, 'Event').andReturn(event);
    });

    it("creates a new event about the step result's visit", function() {
      treeWalker.visitStepResult(stepResult, callback);
      expect(Cucumber.Ast.TreeWalker.Event).toHaveBeenCalledWith(Cucumber.Ast.TreeWalker.STEP_RESULT_EVENT_NAME, payload);
    });

    it("broadcasts the step result visit and the step result itself", function() {
      treeWalker.visitStepResult(stepResult, callback);
      expect(treeWalker.broadcastEvent).toHaveBeenCalledWith(event, callback);
    });

    it("checks wether the step succeeded or not", function() {
      treeWalker.visitStepResult(stepResult, callback);
      expect(stepResult.isSuccessful).toHaveBeenCalled();
    });

    describe("when the step succeeded", function() {
      beforeEach(function() {
        stepResult.isSuccessful.andReturn(true);
      });

      it("does not witness a failed step", function() {
        treeWalker.visitStepResult(stepResult, callback);
        expect(treeWalker.witnessFailedStep).not.toHaveBeenCalled();
      });
    });

    describe("when the step failed", function() {
      beforeEach(function() {
        stepResult.isSuccessful.andReturn(false);
      });

      it("witnesses a failed step", function() {
        treeWalker.visitStepResult(stepResult, callback);
        expect(treeWalker.witnessFailedStep).toHaveBeenCalled();
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
    var event, callback, preEvent;

    beforeEach(function() {
      preEvent = createSpy("Post-event (after)");
      event    = createSpyWithStubs("Event", { replicateAsPostEvent: preEvent });
      callback = createSpy("Callback");
      spyOn(treeWalker, 'broadcastEvent');
    });

    it("asks the event to replicate itself as a after event", function() {
      treeWalker.broadcastAfterEvent(event, callback);
      expect(event.replicateAsPostEvent).toHaveBeenCalled();
    });

    it("broadcasts the pre event with the call back", function() {
      treeWalker.broadcastAfterEvent(event, callback);
      expect(treeWalker.broadcastEvent).toHaveBeenCalledWith(preEvent, callback);
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

  describe("didAllFeaturesSucceed()", function() {
    it("returns true when no failure was encountered", function() {
      expect(treeWalker.didAllFeaturesSucceed()).toBeTruthy();
    });

    it("returns false when a failed step was encountered", function() {
      treeWalker.witnessFailedStep();
      expect(treeWalker.didAllFeaturesSucceed()).toBeFalsy();
    });
  });

  describe("isSkippingSteps() [witnessFailedSteps()]", function() {
    it("returns false when no failure was encountered", function() {
      expect(treeWalker.isSkippingSteps()).toBeFalsy();
    });

    it("returns true when a failed step was encountered", function() {
      treeWalker.witnessFailedStep();
      expect(treeWalker.isSkippingSteps()).toBeTruthy();
    });

    it("returns false when a failed step was encountered but not in the current scenario", function() {
      treeWalker.witnessFailedStep();
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
      spyOn(Cucumber.Ast.TreeWalker, 'Event').andReturn(event);
      spyOn(treeWalker, 'broadcastEventAroundUserFunction');
    });

    it("creates a new event about the executed step's visit", function() {
      treeWalker.executeStep(step, callback);
      expect(Cucumber.Ast.TreeWalker.Event).toHaveBeenCalledWith(Cucumber.Ast.TreeWalker.STEP_EVENT_NAME, payload);
    });

    it("broadcasts the step's visit", function() {
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
      payload  = {step: step};
      spyOn(Cucumber.Ast.TreeWalker, 'Event').andReturn(event);
      spyOn(treeWalker, 'broadcastEvent');
    });

    it("creates a new event about the skipped step visit", function() {
      treeWalker.skipStep(step, callback);
      expect(Cucumber.Ast.TreeWalker.Event).toHaveBeenCalledWith(Cucumber.Ast.TreeWalker.SKIPPED_STEP_EVENT_NAME, payload);
    });

    it("brodcasts the step's visit", function() {
      treeWalker.skipStep(step, callback);
      expect(treeWalker.broadcastEvent).toHaveBeenCalledWith(event, callback);
    });
  });
});
