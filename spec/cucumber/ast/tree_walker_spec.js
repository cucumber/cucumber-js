require('../../support/spec_helper');

describe("Cucumber.Ast.TreeWalker", function() {
  var Cucumber     = require('cucumber');
  var EventEmitter = require('events').EventEmitter;
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
    });

    beforeEach(function() {
      spyOn(treeWalker, 'visitFeatures');
    });

    it("visits all features", function() {
      treeWalker.walk(callback);
      expect(treeWalker.visitFeatures).toHaveBeenCalledWith(features, callback);
    });
  });

  describe("visitFeatures()", function() {
    var callback;
    
    beforeEach(function() {
      callback = createSpy("Callback");
      spyOn(treeWalker, 'broadcastMessagesBeforeAndAfterFunction');
    });
    
    it("broadcasts the features' visit with a callback", function() {
      treeWalker.visitFeatures(features, callback);
      expect(treeWalker.broadcastMessagesBeforeAndAfterFunction).toHaveBeenCalled();
      expect(treeWalker.broadcastMessagesBeforeAndAfterFunction).
        toHaveBeenCalledWithValueAsNthParameter(Cucumber.Ast.TreeWalker.FEATURES_MESSAGE, 1);
      expect(treeWalker.broadcastMessagesBeforeAndAfterFunction).
        toHaveBeenCalledWithAFunctionAsNthParameter(2);
    });

    describe("broadcast messages callback", function() {
      var broadcastCallback;

      beforeEach(function() {
        treeWalker.visitFeatures(features, callback);
        broadcastCallback = treeWalker.broadcastMessagesBeforeAndAfterFunction.mostRecentCall.args[1];
      });

      it("visits the features, passing it the received callback", function() {
        broadcastCallback();
        expect(features.acceptVisitor).toHaveBeenCalledWith(treeWalker, callback);
      });      
    });
  });

  describe("visitFeature()", function() {
    var feature, callback;
    
    beforeEach(function() {
      feature  = createSpyWithStubs("Feature AST element", {acceptVisitor: null});
      callback = createSpy("Callback");
      spyOn(treeWalker, 'broadcastMessagesBeforeAndAfterFunction');
    });
    
    it("broadcasts the feature's visit and the feature itself with a callback", function() {
      treeWalker.visitFeature(feature, callback);
      expect(treeWalker.broadcastMessagesBeforeAndAfterFunction).toHaveBeenCalled();
      expect(treeWalker.broadcastMessagesBeforeAndAfterFunction).
        toHaveBeenCalledWithValueAsNthParameter(Cucumber.Ast.TreeWalker.FEATURE_MESSAGE, 1);
      expect(treeWalker.broadcastMessagesBeforeAndAfterFunction).
        toHaveBeenCalledWithValueAsNthParameter(feature, 2);
      expect(treeWalker.broadcastMessagesBeforeAndAfterFunction).
        toHaveBeenCalledWithAFunctionAsNthParameter(3);
    });

    describe("broadcast messages callback", function() {
      var broadcastCallback;

      beforeEach(function() {
        treeWalker.visitFeature(feature, callback);
        broadcastCallback = treeWalker.broadcastMessagesBeforeAndAfterFunction.mostRecentCall.args[2];
      });

      it("visits the feature, passing it the received callback", function() {
        broadcastCallback();
        expect(feature.acceptVisitor).toHaveBeenCalledWith(treeWalker, callback);
      });      
    });
  });

  describe("visitScenario()", function() {
    var scenario, callback;

    beforeEach(function() {
      scenario = createSpyWithStubs("Scenario AST element", {acceptVisitor: null});
      callback = createSpy("Callback");
      spyOn(treeWalker, 'broadcastMessagesBeforeAndAfterFunction');
    });
    
    it("broadcasts the scenario's visit and the scenario itself with a callback", function() {
      treeWalker.visitScenario(scenario, callback);
      expect(treeWalker.broadcastMessagesBeforeAndAfterFunction).toHaveBeenCalled();
      expect(treeWalker.broadcastMessagesBeforeAndAfterFunction).
        toHaveBeenCalledWithValueAsNthParameter(Cucumber.Ast.TreeWalker.SCENARIO_MESSAGE, 1);
      expect(treeWalker.broadcastMessagesBeforeAndAfterFunction).
        toHaveBeenCalledWithValueAsNthParameter(scenario, 2);
      expect(treeWalker.broadcastMessagesBeforeAndAfterFunction).
        toHaveBeenCalledWithAFunctionAsNthParameter(3);
    });

    describe("broadcast messages callback", function() {
      var broadcastCallback;

      beforeEach(function() {
        treeWalker.visitScenario(scenario, callback);
        broadcastCallback = treeWalker.broadcastMessagesBeforeAndAfterFunction.mostRecentCall.args[2];
      });

      it("visits the scenario, passing it the received callback", function() {
        broadcastCallback();
        expect(scenario.acceptVisitor).toHaveBeenCalledWith(treeWalker, callback);
      });      
    });
  });

  describe("visitStep()", function() {
    var step, callback;
    
    beforeEach(function() {
      step     = createSpyWithStubs("Step", {acceptVisitor: null});
      callback = createSpy("Callback");
      spyOn(treeWalker, 'broadcastMessagesBeforeAndAfterFunction');
    });
    
    it("broadcasts the step's visit and the step itself with a callback", function() {
      treeWalker.visitStep(step, callback);
      expect(treeWalker.broadcastMessagesBeforeAndAfterFunction).toHaveBeenCalled();
      expect(treeWalker.broadcastMessagesBeforeAndAfterFunction).
        toHaveBeenCalledWithValueAsNthParameter(Cucumber.Ast.TreeWalker.STEP_MESSAGE, 1);
      expect(treeWalker.broadcastMessagesBeforeAndAfterFunction).
        toHaveBeenCalledWithValueAsNthParameter(step, 2);
      expect(treeWalker.broadcastMessagesBeforeAndAfterFunction).
        toHaveBeenCalledWithAFunctionAsNthParameter(3);
    });

    describe("broadcast messages callback", function() {
      var broadcastCallback;

      beforeEach(function() {
        treeWalker.visitStep(step, callback);
        broadcastCallback = treeWalker.broadcastMessagesBeforeAndAfterFunction.mostRecentCall.args[2];
      });

      it("visits the step, passing it the received callback", function() {
        broadcastCallback();
        expect(step.acceptVisitor).toHaveBeenCalledWith(treeWalker, callback);
      });      
    });
  });

  describe("visitStepResult()", function() {
    var stepResult, callback;

    beforeEach(function() {
      stepResult = createSpy("Step result");
      callback   = createSpy("Callback");
      spyOn(treeWalker, 'broadcastMessage');
    });
    
    it("broadcasts the step result visit and the step result itself", function() {
      treeWalker.visitStepResult(stepResult, callback);
      expect(treeWalker.broadcastMessage).toHaveBeenCalledWith(Cucumber.Ast.TreeWalker.STEP_RESULT_MESSAGE, stepResult);
    });

    it("calls back", function() {
      treeWalker.visitStepResult(stepResult, callback);
      expect(callback).toHaveBeenCalled();
    });
  });

  describe("broadcastMessagesBeforeAndAfterFunction()", function() {
    var message, callback;
    var beforeMessage, afterMessage;
    var beforeMessageBroadcasted, afterMessageBrodcasted;
    
    beforeEach(function() {
      message                  = "EventMessage";
      callback                 = createSpy("Callback");
      beforeMessage            = Cucumber.Ast.TreeWalker.BEFORE_MESSAGE_PREFIX + message;
      afterMessage             = Cucumber.Ast.TreeWalker.AFTER_MESSAGE_PREFIX  + message;
      beforeMessageBroadcasted = false;
      afterMessageBroadcasted  = false;
      spyOn(treeWalker, 'broadcastMessage').andCallFake(function(message) {
        if (message == beforeMessage)
          beforeMessageBroadcasted = true;
        if (message == afterMessage)
          afterMessageBroadcasted = true;
      });
    });

    it("sends a 'before event' message", function() {
      treeWalker.broadcastMessagesBeforeAndAfterFunction(message, callback);
      expect(treeWalker.broadcastMessage).toHaveBeenCalledWith(beforeMessage);
    });

    it("runs the callback after the before message and before the after message are sent", function() {
      callback.andCallFake(function() {
        expect(beforeMessageBroadcasted).toBeTruthy();
        expect(afterMessageBroadcasted).toBeFalsy();
      });
      treeWalker.broadcastMessagesBeforeAndAfterFunction(message, callback);
      expect(callback).toHaveBeenCalled();
    });
    
    it("sends an 'after event' message", function() {
      treeWalker.broadcastMessagesBeforeAndAfterFunction(message, callback);
      expect(treeWalker.broadcastMessage).toHaveBeenCalledWith(afterMessage);
    });

    it("broadcasts an optional parameter in both before and after events", function() {
      var parameter = createSpy("Additional parameter");
      treeWalker.broadcastMessagesBeforeAndAfterFunction(message, parameter, callback);
      expect(treeWalker.broadcastMessage).toHaveBeenCalledWith(beforeMessage, parameter);
      expect(treeWalker.broadcastMessage).toHaveBeenCalledWith(afterMessage, parameter);
    });

    it("broadcasts any optional parameter in both before and after events", function() {
      var parameter1 = createSpy("Additional parameter 1");
      var parameter2 = createSpy("Additional parameter 2");
      var parameter3 = createSpy("Additional parameter 3");
      treeWalker.broadcastMessagesBeforeAndAfterFunction(message, parameter1, parameter2, parameter3, callback);
      expect(treeWalker.broadcastMessage).toHaveBeenCalledWith(beforeMessage, parameter1, parameter2, parameter3);
      expect(treeWalker.broadcastMessage).toHaveBeenCalledWith(afterMessage, parameter1, parameter2, parameter3);
    });
  });

  describe("broadcastMessage()", function() {
    var message, hearMethod;

    beforeEach(function() {
      message     = "Message";
      hearMethod = Cucumber.Ast.TreeWalker.HEAR_METHOD_PREFIX + message;
      listeners.forEach(function(listener) {
        spyOnStub(listener, hearMethod);
      });
    });

    it("tells every listener about the message", function() {
      treeWalker.broadcastMessage(message);
      listeners.forEach(function(listener) {
        expect(listener[hearMethod]).toHaveBeenCalled();
      });
    });

    it("passes an optional additional parameter to the listeners", function() {
      var parameter = createSpy("Additional parameter");
      treeWalker.broadcastMessage(message, parameter);
      listeners.forEach(function(listener) {
        expect(listener[hearMethod]).toHaveBeenCalledWith(parameter);
      });
    });

    it("passes any additional parameter to the listeners", function() {
      var parameter1 = createSpy("Additional parameter 1");
      var parameter2 = createSpy("Additional parameter 2");
      var parameter3 = createSpy("Additional parameter 3");
      treeWalker.broadcastMessage(message, parameter1, parameter2, parameter3);
      listeners.forEach(function(listener) {
        expect(listener[hearMethod]).toHaveBeenCalledWith(parameter1, parameter2, parameter3);
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
});
