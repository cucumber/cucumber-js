require('../../support/spec_helper');

describe("Cucumber.Listener.ProgressFormatter", function() {
  var Cucumber = require('cucumber');
  var listener, beforeEachScenarioUserFunctions;

  beforeEach(function() {
    beforeEachScenarioUserFunctions = createSpy("User Functions to call before each scenario");
    spyOn(Cucumber.Type, 'Collection').andReturn(beforeEachScenarioUserFunctions);
    listener = Cucumber.Listener.ProgressFormatter();
  });

  describe("constructor", function() {
    it("creates a new collection to store user functions to call before each scenario", function() {
      expect(Cucumber.Type.Collection).toHaveBeenCalled();
    });
  });

  describe("beforeEachScenarioDo()", function() {
    beforeEach(function() {
      spyOnStub(beforeEachScenarioUserFunctions, 'add');
    });

    it("adds the user function to the collection of 'before each scenario' user functions", function() {
      var userFunction = createSpy("A user function to call before each scenario");
      listener.beforeEachScenarioDo(userFunction);
      expect(beforeEachScenarioUserFunctions.add).toHaveBeenCalledWith(userFunction);
    });
  });

  describe("log()", function() {
    var logged, alsoLogged, loggedBuffer;

    beforeEach(function() {
      logged       = "this was logged";
      alsoLogged   = "this was also logged";
      loggedBuffer = logged + alsoLogged;
      spyOn(process.stdout, 'write');
    });

    it("records logged strings", function() {
      listener.log(logged);
      listener.log(alsoLogged);
      expect(listener.getLogs()).toBe(loggedBuffer);
    });

    it("outputs the logged string to STDOUT by default", function() {
        listener.log(logged);
        expect(process.stdout.write).toHaveBeenCalledWith(logged);
    });

    describe("when asked to output to STDOUT", function() {
      beforeEach(function() {
        listener = Cucumber.Listener.ProgressFormatter({logToConsole: true});
      });

      it("outputs the logged string to STDOUT", function() {
        listener.log(logged);
        expect(process.stdout.write).toHaveBeenCalledWith(logged);
      });
    });

    describe("when asked to not output to STDOUT", function() {
      beforeEach(function() {
        listener = Cucumber.Listener.ProgressFormatter({logToConsole: false});
      });

      it("does not output anything to STDOUT", function() {
        listener.log(logged);
        expect(process.stdout.write).not.toHaveBeenCalledWith(logged);
      });
    });

    describe("when asked to output to a function", function() {
      var userFunction;

      beforeEach(function() {
        userFunction = createSpy("output user function");
        listener     = Cucumber.Listener.ProgressFormatter({logToFunction: userFunction});
      });

      it("calls the function with the logged string", function() {
        listener.log(logged);
        expect(userFunction).toHaveBeenCalledWith(logged);
      });
    });
  });

  describe("getLogs()", function() {
    it("returns the logged buffer", function() {
      var logged       = "this was logged";
      var alsoLogged   = "this was also logged";
      var loggedBuffer = logged + alsoLogged;
      spyOn(process.stdout, 'write'); // prevent actual output during spec execution
      listener.log(logged);
      listener.log(alsoLogged);
      expect(listener.getLogs()).toBe(loggedBuffer);
    });

    it("returns an empty string when the listener did not log anything yet", function() {
      expect(listener.getLogs()).toBe("");
    });
  });

  describe("hear()", function() {
    var event, callback;
    var eventHandler;

    beforeEach(function() {
      event    = createSpy("Event");
      callback = createSpy("Callback");
      spyOn(listener, 'hasHandlerForEvent');
      spyOn(listener, 'getHandlerForEvent');
    });

    it("checks wether there is a handler for the event", function() {
      listener.hear(event, callback);
      expect(listener.hasHandlerForEvent).toHaveBeenCalledWith(event);
    });

    describe("when there is a handler for that event", function() {
      beforeEach(function() {
        eventHandler = createSpy("Event handler (function)");
        listener.hasHandlerForEvent.andReturn(true);
        listener.getHandlerForEvent.andReturn(eventHandler);
      });

      it("gets the handler for that event", function() {
        listener.hear(event, callback);
        expect(listener.getHandlerForEvent).toHaveBeenCalledWith(event);
      });

      it("calls the handler with the event and the callback", function() {
        listener.hear(event, callback);
        expect(eventHandler).toHaveBeenCalledWith(event, callback);
      });

      it("does not callback", function() {
        listener.hear(event, callback);
        expect(callback).not.toHaveBeenCalled();
      });
    });

    describe("when there are no handlers for that event", function() {
      beforeEach(function() {
        listener.hasHandlerForEvent.andReturn(false);
      });

      it("calls back", function() {
        listener.hear(event, callback);
        expect(callback).toHaveBeenCalled();
      });

      it("does not get the handler for the event", function() {
        listener.hear(event, callback);
        expect(listener.getHandlerForEvent).not.toHaveBeenCalled();
      });
    });
  });

  describe("hasHandlerForEvent", function() {
    var event, eventHandlerName, eventHandler;

    beforeEach(function() {
      event            = createSpy("Event");
      eventHandlerName = createSpy("event handler name");
      spyOn(listener, 'buildHandlerNameForEvent').andReturn(eventHandlerName);
    });

    it("builds the name of the handler for that event", function() {
      listener.hasHandlerForEvent(event);
      expect(listener.buildHandlerNameForEvent).toHaveBeenCalledWith(event);
    });

    describe("when the handler exists", function() {
      beforeEach(function() {
        eventHandler = createSpy("event handler");
        listener[eventHandlerName] = eventHandler;
      });

      it("returns true", function() {
        expect(listener.hasHandlerForEvent(event)).toBeTruthy();
      });
    });

    describe("when the handler does not exist", function() {
      it("returns false", function() {
        expect(listener.hasHandlerForEvent(event)).toBeFalsy();
      });
    });
  });

  describe("buildHandlerNameForEvent", function() {
    var event, eventName;

    beforeEach(function() {
      eventName = "SomeEventName";
      event     = createSpyWithStubs("Event", {getName: eventName});
    });

    it("gets the name of the event", function() {
      listener.buildHandlerNameForEvent(event);
      expect(event.getName).toHaveBeenCalled();
    });

    it("returns the name of the event with prefix 'handle' and suffix 'Event'", function() {
      expect(listener.buildHandlerNameForEvent(event)).toBe("handle" + eventName + "Event");
    });
  });

  describe("getHandlerForEvent()", function() {
    var event;
    var eventHandlerName, eventHandler;

    beforeEach(function() {
      event            = createSpy("event");
      eventHandlerName = 'handleSomeEvent';
      eventHandler     = createSpy("event handler");
      spyOn(listener, 'buildHandlerNameForEvent').andReturn(eventHandlerName);
    });

    it("gets the name of the handler for the event", function() {
      listener.getHandlerForEvent(event);
      expect(listener.buildHandlerNameForEvent).toHaveBeenCalledWith(event);
    });

    describe("when an event handler exists for the event", function() {
      beforeEach(function() {
        listener[eventHandlerName] = eventHandler;
      });

      it("returns the event handler", function() {
        expect(listener.getHandlerForEvent(event)).toBe(eventHandler);
      });
    });

    describe("when no event handlers exist for the event", function() {
      it("returns nothing", function() {
        expect(listener.getHandlerForEvent(event)).toBeUndefined();
      });
    });
  });

  describe("handleStepResultEvent", function() {
    var event, callback, stepResult;

    beforeEach(function() {
      spyOn(listener, 'log');
      stepResult = createSpyWithStubs("step result", {isSuccessful: true});
      event      = createSpyWithStubs("event", {getPayloadItem: stepResult});
      callback   = createSpy("Callback");
      spyOn(listener, 'witnessPassedStep');
    });

    it("gets the step result from the event payload", function() {
      listener.handleStepResultEvent(event, callback);
      expect(event.getPayloadItem).toHaveBeenCalledWith('stepResult');
    });

    it("asks the step result if the step passed", function() {
      listener.handleStepResultEvent(event, callback);
      expect(stepResult.isSuccessful).toHaveBeenCalled();
    });

    describe("when the step passed", function() {
      it("witnesses a passed step", function() {
        listener.handleStepResultEvent(event, callback);
        expect(listener.witnessPassedStep).toHaveBeenCalled();
      });

      it("logs the passing step character", function() {
        listener.handleStepResultEvent(event, callback);
        expect(listener.log).toHaveBeenCalledWith(Cucumber.Listener.ProgressFormatter.PASSING_STEP_CHARACTER);
      });
    });

    describe("when the step did not pass", function() {
      beforeEach(function() {
        stepResult.isSuccessful.andReturn(false);
        spyOnStub(stepResult, 'isSkipped');
        spyOn(listener, 'witnessFailedStep');
        spyOn(listener, 'markCurrentScenarioAsFailing');
      });

      it("does not witness a passed step", function() {
        listener.handleStepResultEvent(event, callback);
        expect(listener.witnessPassedStep).not.toHaveBeenCalled();
      });

      it("does not log the passing step character", function() {
        listener.handleStepResultEvent(event, callback);
        expect(listener.log).not.toHaveBeenCalledWith(Cucumber.Listener.ProgressFormatter.PASSING_STEP_CHARACTER);
      });

      it("witnesses a failed step", function() {
        listener.handleStepResultEvent(event, callback);
        expect(listener.witnessFailedStep).toHaveBeenCalled();
      });

      it("marks the current scenario as failing", function() {
        listener.handleStepResultEvent(event, callback);
        expect(listener.markCurrentScenarioAsFailing).toHaveBeenCalled();
      });

      it("logs the failed step character", function() {
        listener.handleStepResultEvent(event, callback);
        expect(listener.log).toHaveBeenCalledWith(Cucumber.Listener.ProgressFormatter.FAILED_STEP_CHARACTER);
      });
    });

    it("calls back", function() {
      listener.handleStepResultEvent(event, callback);
      expect(callback).toHaveBeenCalled();
    });
  });

  describe("handleSkippedStepEvent()", function() {
    var event, callback;

    beforeEach(function() {
      event    = createSpy("event");
      callback = createSpy("callback");
      spyOn(listener, 'witnessSkippedStep');
      spyOn(listener, 'log');
    });

    it("counts one more skipped step", function() {
      listener.handleSkippedStepEvent(event, callback);
      expect(listener.witnessSkippedStep).toHaveBeenCalled();
    });

    it("logs the skipped step character", function() {
      listener.handleSkippedStepEvent(event, callback);
      expect(listener.log).toHaveBeenCalledWith(Cucumber.Listener.ProgressFormatter.SKIPPED_STEP_CHARACTER);
    });

    it("calls back", function() {
      listener.handleSkippedStepEvent(event, callback);
      expect(callback).toHaveBeenCalled();
    });
  });

  describe("handleBeforeScenarioEvent", function() {
    var event, callback;

    beforeEach(function() {
      event    = createSpy("event");
      callback = createSpy("callback");
      spyOn(listener, 'prepareBeforeScenario');
    });

    it("prepares for a new scenario", function() {
      listener.handleBeforeScenarioEvent(event, callback);
      expect(listener.prepareBeforeScenario).toHaveBeenCalled();
    });

    it("calls back", function() {
      listener.handleBeforeScenarioEvent(event, callback);
      expect(callback).toHaveBeenCalled();
    });
  });

  describe("handleAfterFeaturesEvent()", function() {
    var features, callback;

    beforeEach(function() {
      event    = createSpy("Event");
      callback = createSpy("Callback");
      spyOn(listener, "logSummary");
    });

    it("displays a summary", function() {
      listener.handleAfterFeaturesEvent(event, callback);
      expect(listener.logSummary).toHaveBeenCalled();
    });

    it("calls back", function() {
      listener.handleAfterFeaturesEvent(event, callback);
      expect(callback).toHaveBeenCalled();
    });
  });

  describe("handleAfterScenarioEvent()", function() {
    var event, callback;

    beforeEach(function() {
      event    = createSpy("event");
      callback = createSpy("callback");
      spyOn(listener, 'isCurrentScenarioFailing');
      spyOn(listener, 'witnessPassedScenario');
      spyOn(listener, 'witnessFailedScenario');
    });

    it("checks wether the current scenario failed", function() {
      listener.handleAfterScenarioEvent(event, callback);
      expect(listener.isCurrentScenarioFailing).toHaveBeenCalled();
    });

    describe("when the current scenario passed", function() {
      beforeEach(function() {
        listener.isCurrentScenarioFailing.andReturn(false);
      });

      it("witnesses a passed scenario", function() {
        listener.handleAfterScenarioEvent(event, callback);
        expect(listener.witnessPassedScenario).toHaveBeenCalled();
      });

      it("does not witness a failed scenario", function() {
        listener.handleAfterScenarioEvent(event, callback);
        expect(listener.witnessFailedScenario).not.toHaveBeenCalled();
      });
    });

    describe("when the current scenario failed", function() {
      beforeEach(function() {
        listener.isCurrentScenarioFailing.andReturn(true);
      });

      it("witnesses a failed scenario", function() {
        listener.handleAfterScenarioEvent(event, callback);
        expect(listener.witnessFailedScenario).toHaveBeenCalled();
      });

      it("does not witness a passed scenario", function() {
        listener.handleAfterScenarioEvent(event, callback);
        expect(listener.witnessPassedScenario).not.toHaveBeenCalled();
      });
    });

    it("calls back", function() {
      listener.handleAfterScenarioEvent(event, callback);
      expect(callback).toHaveBeenCalled();
    });
  });

  describe("prepareBeforeScenario()", function() {
    it("unmarks the current scenario as failing", function() {
      listener.markCurrentScenarioAsFailing();
      listener.prepareBeforeScenario();
      expect(listener.isCurrentScenarioFailing()).toBeFalsy();
    });
  });

  describe("isCurrentScenarioFailing()", function() {
    it("returns false when the current scenario did not fail yet", function() {
      expect(listener.isCurrentScenarioFailing()).toBeFalsy();
    });

    it("returns false when the current scenario did not fail yet", function() {
      listener.markCurrentScenarioAsFailing();
      expect(listener.isCurrentScenarioFailing()).toBeTruthy();
    });

    // it("returns true when a step in the current scenario failed", function() {
    //   listener.handleStepResultEvent
    //   expect(listener.isCurrentScenarioFailing()).toBeTruthy();
    // });
  });

  describe("logSummary", function() {
    var scenarioCount, passedScenarioCount, failedScenarioCount;
    var stepCount, passedStepCount;

    beforeEach(function() {
      spyOn(listener, 'log');
      spyOn(listener, 'logScenariosSummary');
      spyOn(listener, 'logStepsSummary');
    });

    it("logs two line feeds", function() {
      listener.logSummary();
      expect(listener.log).toHaveBeenCalledWith("\n\n");
    });

    it("logs the scenarios summary", function() {
      listener.logSummary();
      expect(listener.logScenariosSummary).toHaveBeenCalled();
    });

    it("logs the steps summary", function() {
      listener.logSummary();
      expect(listener.logStepsSummary).toHaveBeenCalled();
    });

    it("logs one line feed", function() {
      listener.logSummary();
      expect(listener.log).toHaveBeenCalledWith("\n");
    });
  });

  describe("logScenariosSummary()", function() {
    beforeEach(function() {
      scenarioCount       = 12;
      passedScenarioCount = 9;
      failedScenarioCount = 15;
      spyOn(listener, 'log');
      spyOn(listener, 'getScenarioCount').andReturn(scenarioCount);
      spyOn(listener, 'getPassedScenarioCount').andReturn(passedScenarioCount);
      spyOn(listener, 'getFailedScenarioCount').andReturn(failedScenarioCount);
    });

    it("gets the number of scenarios", function() {
      listener.logScenariosSummary();
      expect(listener.getScenarioCount).toHaveBeenCalled();
    });

    describe("when there are no scenarios", function() {
      beforeEach(function() {
        listener.getScenarioCount.andReturn(0);
      });

      it("logs 0 scenarios", function() {
        listener.logScenariosSummary();
        expect(listener.log).toHaveBeenCalledWithStringMatching(/0 scenarios/);
      });
    });

    describe("when there is one scenario", function() {
      beforeEach(function() {
        listener.getScenarioCount.andReturn(1);
      });

      it("logs one scenario", function() {
        listener.logScenariosSummary();
        expect(listener.log).toHaveBeenCalledWithStringMatching(/1 scenario([^s]|$)/);
      });
    });

    describe("when there are 2 or more scenarios", function() {
      beforeEach(function() {
        listener.getScenarioCount.andReturn(2);
      });

      it("logs two or more scenarios", function() {
        listener.logScenariosSummary();
        expect(listener.log).toHaveBeenCalledWithStringMatching(/2 scenarios/);
      });
    });

    it("gets the number of failed scenarios", function() {
      listener.logScenariosSummary();
      expect(listener.getFailedScenarioCount).toHaveBeenCalled();
    });

    describe("when there are no failed scenarios", function() {
      beforeEach(function() {
        listener.getFailedScenarioCount.andReturn(0);
      });

      it("does not log failed scenarios", function() {
        listener.logScenariosSummary();
        expect(listener.log).not.toHaveBeenCalledWithStringMatching(/failed/);
      });
    });

    describe("when there is one failed scenario", function() {
      beforeEach(function() {
        listener.getFailedScenarioCount.andReturn(1);
      });

      it("logs a failed scenario", function() {
        listener.logScenariosSummary();
        expect(listener.log).toHaveBeenCalledWithStringMatching(/1 failed/);
      });
    });

    describe("when there are two or more scenarios", function() {
      beforeEach(function() {
        listener.getFailedScenarioCount.andReturn(2);
      });

      it("logs the number of failed scenarios", function() {
        listener.logScenariosSummary();
        expect(listener.log).toHaveBeenCalledWithStringMatching(/2 failed/);
      });
    });

    it("gets the number of passed scenarios", function() {
      listener.logScenariosSummary();
      expect(listener.getPassedScenarioCount).toHaveBeenCalled();
    });

    describe("when there is no passed scenarios", function() {
      beforeEach(function() {
        listener.getPassedScenarioCount.andReturn(0);
      });

      it("does not log passed scenarios", function() {
        listener.logScenariosSummary();
        expect(listener.log).not.toHaveBeenCalledWithStringMatching(/passed/);
      });
    });

    describe("when there is one passed scenario", function() {
      beforeEach(function() {
        listener.getPassedScenarioCount.andReturn(1);
      });

      it("logs 1 passed scenarios", function() {
        listener.logScenariosSummary();
        expect(listener.log).toHaveBeenCalledWithStringMatching(/1 passed/);
      });
    });

    describe("when there are two or more passed scenarios", function() {
      beforeEach(function() {
        listener.getPassedScenarioCount.andReturn(2);
      });

      it("logs the number of passed scenarios", function() {
        listener.logScenariosSummary();
        expect(listener.log).toHaveBeenCalledWithStringMatching(/2 passed/);
      });
    });
  });

  describe("logStepsSummary()", function() {
    var stepCount, passedStepCount, failedStepCount, skippedStepCount;

    beforeEach(function() {
      stepCount        = 34;
      passedStepCount  = 31;
      failedStepCount  = 7;
      skippedStepCount = 5
      spyOn(listener, 'log');
      spyOn(listener, 'getStepCount').andReturn(stepCount);
      spyOn(listener, 'getPassedStepCount').andReturn(passedStepCount);
      spyOn(listener, 'getFailedStepCount').andReturn(failedStepCount);
      spyOn(listener, 'getSkippedStepCount').andReturn(skippedStepCount);
    });

    it("gets the number of steps", function() {
      listener.logStepsSummary();
      expect(listener.getStepCount).toHaveBeenCalled();
    });

    describe("when there are no steps", function() {
      beforeEach(function() {
        listener.getStepCount.andReturn(0);
      });

      it("logs 0 steps", function() {
        listener.logStepsSummary();
        expect(listener.log).toHaveBeenCalledWithStringMatching(/0 steps/);
      });
    });

    describe("when there is one step", function() {
      beforeEach(function() {
        listener.getStepCount.andReturn(1);
      });

      it("logs 1 step", function() {
        listener.logStepsSummary();
        expect(listener.log).toHaveBeenCalledWithStringMatching(/1 step/);
      });
    });

    describe("when there are two or more steps", function() {
      beforeEach(function() {
        listener.getStepCount.andReturn(2);
      });

      it("logs the number of steps", function() {
        listener.logStepsSummary();
        expect(listener.log).toHaveBeenCalledWithStringMatching(/2 steps/);
      });
    });

    it("gets the number of failed steps", function() {
      listener.logStepsSummary();
      expect(listener.getFailedStepCount).toHaveBeenCalled();
    });

    describe("when there are no failed steps", function() {
      beforeEach(function() {
        listener.getFailedStepCount.andReturn(0);
      });

      it("does not log failed steps", function() {
        listener.logStepsSummary();
        expect(listener.log).not.toHaveBeenCalledWithStringMatching(/failed/);
      });
    });

    describe("when there is one failed step", function() {
      beforeEach(function() {
        listener.getFailedStepCount.andReturn(1);
      });

      it("logs one failed step", function() {
        listener.logStepsSummary();
        expect(listener.log).toHaveBeenCalledWithStringMatching(/1 failed/);
      });
    });

    describe("when there is two or more failed steps", function() {
      beforeEach(function() {
        listener.getFailedStepCount.andReturn(2);
      });

      it("logs the number of failed steps", function() {
        listener.logStepsSummary();
        expect(listener.log).toHaveBeenCalledWithStringMatching(/2 failed/);
      });
    });

    it("gets the number of skipped steps", function() {
      listener.logStepsSummary();
      expect(listener.getSkippedStepCount).toHaveBeenCalled();
    });

    describe("when there are no skipped steps", function() {
      beforeEach(function() {
        listener.getSkippedStepCount.andReturn(0);
      });

      it("does not log skipped steps", function() {
        listener.logStepsSummary();
        expect(listener.log).not.toHaveBeenCalledWithStringMatching(/skipped/);
      });
    });

    describe("when there is one skipped step", function() {
      beforeEach(function() {
        listener.getSkippedStepCount.andReturn(1);
      });

      it("logs one skipped steps", function() {
        listener.logStepsSummary();
        expect(listener.log).toHaveBeenCalledWithStringMatching(/1 skipped/);
      });
    });

    describe("when there are two or more skipped steps", function() {
      beforeEach(function() {
        listener.getSkippedStepCount.andReturn(2);
      });

      it("logs the number of skipped steps", function() {
        listener.logStepsSummary();
        expect(listener.log).toHaveBeenCalledWithStringMatching(/2 skipped/);
      });
    });

    it("gets the number of passed steps", function() {
      listener.logStepsSummary();
      expect(listener.getPassedStepCount).toHaveBeenCalled();
    });

    describe("when there are no passed steps", function() {
      beforeEach(function() {
        listener.getPassedStepCount.andReturn(0);
      });

      it("does not log passed steps", function() {
        listener.logStepsSummary();
        expect(listener.log).not.toHaveBeenCalledWithStringMatching(/passed/);
      });
    });

    describe("when there is one passed step", function() {
      beforeEach(function() {
        listener.getPassedStepCount.andReturn(1);
      });

      it("logs one passed step", function() {
        listener.logStepsSummary();
        expect(listener.log).toHaveBeenCalledWithStringMatching(/1 passed/);
      });
    });

    describe("when there is two or more passed steps", function() {
      beforeEach(function() {
        listener.getPassedStepCount.andReturn(2);
      });

      it("logs the number of passed steps", function() {
        listener.logStepsSummary();
        expect(listener.log).toHaveBeenCalledWithStringMatching(/2 passed/);
      });
    });
  });

  describe("getScenarioCount()", function() {
    var passedScenarioCount;

    beforeEach(function() {
      passedScenarioCount = Math.floor(Math.random()*11) + 1;
      failedScenarioCount = Math.floor(Math.random()*11) + 1;
      spyOn(listener, 'getPassedScenarioCount').andReturn(passedScenarioCount);
      spyOn(listener, 'getFailedScenarioCount').andReturn(failedScenarioCount);
    });

    it("gets the number of passed scenarios", function() {
      listener.getScenarioCount();
      expect(listener.getPassedScenarioCount).toHaveBeenCalled();
    });

    it("gets the number of failed scenarios", function() {
      listener.getScenarioCount();
      expect(listener.getFailedScenarioCount).toHaveBeenCalled();
    });

    it("returns the sum of passed and failed scenarios", function() {
      expect(listener.getScenarioCount()).toBe(passedScenarioCount + failedScenarioCount);
    });
  });

  describe("getStepCount()", function() {
    var passedStepCount, skippedStepCount, failedStepCount;

    beforeEach(function() {
      passedStepCount  = Math.floor(Math.random()*11) + 1;
      skippedStepCount = Math.floor(Math.random()*11) + 1;
      failedStepCount  = Math.floor(Math.random()*11) + 1;
      spyOn(listener, 'getPassedStepCount').andReturn(passedStepCount);
      spyOn(listener, 'getSkippedStepCount').andReturn(skippedStepCount);
      spyOn(listener, 'getFailedStepCount').andReturn(failedStepCount);
    });

    it("gets the number of passed steps", function() {
      listener.getStepCount();
      expect(listener.getPassedStepCount).toHaveBeenCalled();
    });

    it("gets the number of skipped steps", function() {
      listener.getStepCount();
      expect(listener.getSkippedStepCount).toHaveBeenCalled();
    });

    it("gets the number of failed steps", function() {
      listener.getStepCount();
      expect(listener.getFailedStepCount).toHaveBeenCalled();
    });

    it("returns the sum of passed steps and failed steps", function() {
      expect(listener.getStepCount()).toBe(passedStepCount + skippedStepCount + failedStepCount);
    });
  });

  describe("passed scenario counting", function() {
    describe("witnessPassedScenario()", function() {
      it("counts one more passed scenario", function() {
        var beforeCountOne = listener.getPassedScenarioCount();
        listener.witnessPassedScenario();
        expect(listener.getPassedScenarioCount()).toBe(beforeCountOne + 1);
      });
    });

    describe("getPassedScenarioCount()", function() {
      it("returns 0 when no scenario passed", function() {
        expect(listener.getPassedScenarioCount()).toBe(0);
      });

      it("returns 1 when one scenario passed", function() {
        listener.witnessPassedScenario();
        expect(listener.getPassedScenarioCount()).toBe(1);
      });

      it("returns 2 when two scenarios passed", function() {
        listener.witnessPassedScenario();
        listener.witnessPassedScenario();
        expect(listener.getPassedScenarioCount()).toBe(2);
      });

      it("returns 3 when three scenarios passed", function() {
        listener.witnessPassedScenario();
        listener.witnessPassedScenario();
        listener.witnessPassedScenario();
        expect(listener.getPassedScenarioCount()).toBe(3);
      });
    });
  });

  describe("failed scenario counting", function() {
    describe("getFailedScenarioCount()", function() {
      it("returns 0 when no scenarios failed", function() {
        expect(listener.getFailedScenarioCount()).toBe(0);
      });

      it("returns 1 when one scenario passed", function() {
        listener.witnessFailedScenario();
        expect(listener.getFailedScenarioCount()).toBe(1);
      });

      it("returns 2 when two scenarios passed", function() {
        listener.witnessFailedScenario();
        listener.witnessFailedScenario();
        expect(listener.getFailedScenarioCount()).toBe(2);
      });

      it("returns 3 when two scenarios passed", function() {
        listener.witnessFailedScenario();
        listener.witnessFailedScenario();
        listener.witnessFailedScenario();
        expect(listener.getFailedScenarioCount()).toBe(3);
      });
    });
  });

  describe("passed step counting", function() {
    describe("witnessPassedStep()", function() {
      it("counts one more passed step", function() {
        var beforeCountOne = listener.getPassedStepCount();
        listener.witnessPassedStep();
        expect(listener.getPassedStepCount()).toBe(beforeCountOne + 1);
      });
    });

    describe("getPassedStepCount()", function() {
      it("returns 0 when no step passed", function() {
        expect(listener.getPassedStepCount()).toBe(0);
      });

      it("returns 1 when one step passed", function() {
        listener.witnessPassedStep();
        expect(listener.getPassedStepCount()).toBe(1);
      });

      it("returns 2 when two steps passed", function() {
        listener.witnessPassedStep();
        listener.witnessPassedStep();
        expect(listener.getPassedStepCount()).toBe(2);
      });

      it("returns 3 when three steps passed", function() {
        listener.witnessPassedStep();
        listener.witnessPassedStep();
        listener.witnessPassedStep();
        expect(listener.getPassedStepCount()).toBe(3);
      });
    });
  });

  describe("failed step counting", function() {
    describe("getFailedStepCount()", function() {
      it("returns 0 when no steps failed", function() {
        expect(listener.getFailedStepCount()).toBe(0);
      });

      it("returns 1 when one step passed", function() {
        listener.witnessFailedStep();
        expect(listener.getFailedStepCount()).toBe(1);
      });

      it("returns 2 when two steps passed", function() {
        listener.witnessFailedStep();
        listener.witnessFailedStep();
        expect(listener.getFailedStepCount()).toBe(2);
      });

      it("returns 3 when two steps passed", function() {
        listener.witnessFailedStep();
        listener.witnessFailedStep();
        listener.witnessFailedStep();
        expect(listener.getFailedStepCount()).toBe(3);
      });
    });
  });

  describe("skipped step counting", function() {
    describe("getSkippedStepCount()", function() {
      it("returns 0 when no steps skipped", function() {
        expect(listener.getSkippedStepCount()).toBe(0);
      });

      it("returns 1 when one step passed", function() {
        listener.witnessSkippedStep();
        expect(listener.getSkippedStepCount()).toBe(1);
      });

      it("returns 2 when two steps passed", function() {
        listener.witnessSkippedStep();
        listener.witnessSkippedStep();
        expect(listener.getSkippedStepCount()).toBe(2);
      });

      it("returns 3 when two steps passed", function() {
        listener.witnessSkippedStep();
        listener.witnessSkippedStep();
        listener.witnessSkippedStep();
        expect(listener.getSkippedStepCount()).toBe(3);
      });
    });
  });
});
