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

    it("checks if there is a handler for the event", function() {
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
      spyOn(listener, 'countOnePassedStep');
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
      it("counts one more passed step", function() {
        listener.handleStepResultEvent(event, callback);
        expect(listener.countOnePassedStep).toHaveBeenCalled();
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
        spyOn(listener, 'countOneFailedStep');
      });

      it("does not count one more passed step", function() {
        listener.handleStepResultEvent(event, callback);
        expect(listener.countOnePassedStep).not.toHaveBeenCalled();
      });

      it("does not log the passing step character", function() {
        listener.handleStepResultEvent(event, callback);
        expect(listener.log).not.toHaveBeenCalledWith(Cucumber.Listener.ProgressFormatter.PASSING_STEP_CHARACTER);
      });

      it("counts one more failed step", function() {
        listener.handleStepResultEvent(event, callback);
        expect(listener.countOneFailedStep).toHaveBeenCalled();
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
      spyOn(listener, 'countOnePassedScenario');
    });

    it("counts one more passed scenario", function() {
      listener.handleAfterScenarioEvent(event, callback);
      expect(listener.countOnePassedScenario).toHaveBeenCalled();
    });

    it("calls back", function() {
      listener.handleAfterScenarioEvent(event, callback);
      expect(callback).toHaveBeenCalled();
    });
  });

  describe("logSummary", function() {
    var scenarioCount, passedScenarioCount;
    var stepCount;

    beforeEach(function() {
      scenarioCount       = 12;
      passedScenarioCount = 9;
      stepCount           = 27;
      passedStepCount     = 24;
      spyOn(listener, 'log');
      spyOn(listener, 'getScenarioCount').andReturn(scenarioCount);
      spyOn(listener, 'getPassedScenarioCount').andReturn(passedScenarioCount);
      spyOn(listener, 'getStepCount').andReturn(stepCount);
      spyOn(listener, 'getPassedStepCount').andReturn(passedStepCount);
    });

    it("logs two line feeds", function() {
      listener.logSummary();
      expect(listener.log).toHaveBeenCalledWith("\n\n");
    });

    it("gets the number of scenarios", function() {
      listener.logSummary();
      expect(listener.getScenarioCount).toHaveBeenCalled();
    });

    it("gets the number of passed scenarios", function() {
      listener.logSummary();
      expect(listener.getPassedScenarioCount).toHaveBeenCalled();
    });

    it ("logs the number of scenarios and the number of passed scenarios", function() {
      var string = scenarioCount + " scenario(s) (" + passedScenarioCount + " passed)\n";
      listener.logSummary();
      expect(listener.log).toHaveBeenCalledWith(string);
    });

    it("gets the number of steps", function() {
      listener.logSummary();
      expect(listener.getStepCount).toHaveBeenCalled();
    });

    it("gets the number of passed steps", function() {
      listener.logSummary();
      expect(listener.getPassedStepCount).toHaveBeenCalled();
    });

    it ("logs the number of steps and the number of passed steps", function() {
      var string = stepCount + " step(s) (" + passedStepCount + " passed)";
      listener.logSummary();
      expect(listener.log).toHaveBeenCalledWith(string);
    });

    it("logs one line feed", function() {
      listener.logSummary();
      expect(listener.log).toHaveBeenCalledWith("\n");
    });
  });

  describe("getScenarioCount()", function() {
    var passedScenarioCount;

    beforeEach(function() {
      passedScenarioCount = 23;
      spyOn(listener, 'getPassedScenarioCount').andReturn(passedScenarioCount);
    });

    it("gets the number of passed scenarios", function() {
      listener.getScenarioCount();
      expect(listener.getPassedScenarioCount).toHaveBeenCalled();
    });

    it("returns the number of passed scenarios", function() {
      expect(listener.getScenarioCount()).toBe(passedScenarioCount);
    });
  });

  describe("getStepCount()", function() {
    var passedStepCount;

    beforeEach(function() {
      passedStepCount = 23;
      spyOn(listener, 'getPassedStepCount').andReturn(passedStepCount);
    });

    it("gets the number of passed steps", function() {
      listener.getStepCount();
      expect(listener.getPassedStepCount).toHaveBeenCalled();
    });

    it("returns the number of passed steps", function() {
      expect(listener.getStepCount()).toBe(passedStepCount);
    });
  });

  describe("passed scenario counting", function() {
    describe("countOnePassedScenario()", function() {
      it("counts one more passed scenario", function() {
        var beforeCountOne = listener.getPassedScenarioCount();
        listener.countOnePassedScenario();
        expect(listener.getPassedScenarioCount()).toBe(beforeCountOne + 1);
      });
    });

    describe("getPassedScenarioCount()", function() {
      it("returns 0 when no scenario passed", function() {
        expect(listener.getPassedScenarioCount()).toBe(0);
      });

      it("returns 1 when one scenario passed", function() {
        listener.countOnePassedScenario();
        expect(listener.getPassedScenarioCount()).toBe(1);
      });

      it("returns 2 when two scenarios passed", function() {
        listener.countOnePassedScenario();
        listener.countOnePassedScenario();
        expect(listener.getPassedScenarioCount()).toBe(2);
      });

      it("returns 3 when three scenarios passed", function() {
        listener.countOnePassedScenario();
        listener.countOnePassedScenario();
        listener.countOnePassedScenario();
        expect(listener.getPassedScenarioCount()).toBe(3);
      });
    });
  });

  describe("passed step counting", function() {
    describe("countOnePassedStep()", function() {
      it("counts one more passed step", function() {
        var beforeCountOne = listener.getPassedStepCount();
        listener.countOnePassedStep();
        expect(listener.getPassedStepCount()).toBe(beforeCountOne + 1);
      });
    });

    describe("getPassedStepCount()", function() {
      it("returns 0 when no step passed", function() {
        expect(listener.getPassedStepCount()).toBe(0);
      });

      it("returns 1 when one step passed", function() {
        listener.countOnePassedStep();
        expect(listener.getPassedStepCount()).toBe(1);
      });

      it("returns 2 when two steps passed", function() {
        listener.countOnePassedStep();
        listener.countOnePassedStep();
        expect(listener.getPassedStepCount()).toBe(2);
      });

      it("returns 3 when three steps passed", function() {
        listener.countOnePassedStep();
        listener.countOnePassedStep();
        listener.countOnePassedStep();
        expect(listener.getPassedStepCount()).toBe(3);
      });
    });
  });
});
