require('../../support/spec_helper');

describe("Cucumber.Listener.ProgressFormatter", function() {
  var Cucumber = requireLib('cucumber');
  var listener, failedStepResults;

  beforeEach(function() {
    failedStepResults = createSpy("Failed steps");
    spyOn(Cucumber.Type, 'Collection').andReturn(failedStepResults);
    listener = Cucumber.Listener.ProgressFormatter();
  });

  describe("constructor", function() {
    it("creates a collection to store the failed steps", function() {
      expect(Cucumber.Type.Collection).toHaveBeenCalled();
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

  describe("handleStepResultEvent()", function() {
    var event, callback, stepResult;

    beforeEach(function() {
      stepResult = createSpyWithStubs("step result", {
        isSuccessful: undefined,
        isPending:    undefined,
        isFailed:     undefined,
        isSkipped:    undefined,
        isUndefined:  undefined
      });
      event      = createSpyWithStubs("event", {getPayloadItem: stepResult});
      callback   = createSpy("Callback");
      spyOn(listener, 'handleFailedStepResult');
    });

    it("gets the step result from the event payload", function() {
      listener.handleStepResultEvent(event, callback);
      expect(event.getPayloadItem).toHaveBeenCalledWith('stepResult');
    });

    it("checks wether the step was successful or not", function() {
      listener.handleStepResultEvent(event, callback);
      expect(stepResult.isSuccessful).toHaveBeenCalled();
    });

    describe("when the step passed", function() {
      beforeEach(function() {
        stepResult.isSuccessful.andReturn(true);
        spyOn(listener, 'handleSuccessfulStepResult');
      });

      it("handles the successful step result", function() {
        listener.handleStepResultEvent(event, callback);
        expect(listener.handleSuccessfulStepResult).toHaveBeenCalled();
      });
    });

    describe("when the step did not pass", function() {
      beforeEach(function() {
        stepResult.isSuccessful.andReturn(false);
        spyOn(listener, 'handleSuccessfulStepResult');
      });

      it("does not handle a successful step result", function() {
        listener.handleStepResultEvent(event, callback);
        expect(listener.handleSuccessfulStepResult).not.toHaveBeenCalled();
      });

      it("checks wether the step is pending", function() {
        listener.handleStepResultEvent(event, callback);
        expect(stepResult.isPending).toHaveBeenCalled();
      });

      describe("when the step was pending", function() {
        beforeEach(function() {
          stepResult.isPending.andReturn(true);
          spyOn(listener, 'handlePendingStepResult');
        });

        it("handles the pending step result", function() {
          listener.handleStepResultEvent(event, callback);
          expect(listener.handlePendingStepResult).toHaveBeenCalled();
        });
      });

      describe("when the step was not pending", function() {
        beforeEach(function() {
          stepResult.isPending.andReturn(false);
          spyOn(listener, 'handlePendingStepResult');
        });

        it("does not handle a pending step result", function() {
          listener.handleStepResultEvent(event, callback);
          expect(listener.handlePendingStepResult).not.toHaveBeenCalled();
        });

        it("checks wether the step was skipped", function() {
          listener.handleStepResultEvent(event, callback);
          expect(stepResult.isSkipped).toHaveBeenCalled();
        });

        describe("when the step was skipped", function() {
          beforeEach(function() {
            stepResult.isSkipped.andReturn(true);
            spyOn(listener, 'handleSkippedStepResult');
          });

          it("handles the skipped step result", function() {
            listener.handleStepResultEvent(event, callback);
            expect(listener.handleSkippedStepResult).toHaveBeenCalled();
          });
        });

        describe("when the step was not skipped", function() {
          beforeEach(function() {
            stepResult.isSkipped.andReturn(false);
            spyOn(listener, 'handleSkippedStepResult');
          });

          it("does not handle a skipped step result", function() {
            listener.handleStepResultEvent(event, callback);
            expect(listener.handleSkippedStepResult).not.toHaveBeenCalled();
          });

          it("checks wether the step was undefined", function() {
            listener.handleStepResultEvent(event, callback);
            expect(stepResult.isUndefined).toHaveBeenCalled();
          });

          describe("when the step was undefined", function() {
            beforeEach(function() {
              stepResult.isUndefined.andReturn(true);
              spyOn(listener, 'handleUndefinedStepResult');
            });

            it("handles the undefined step result", function() {
              listener.handleStepResultEvent(event, callback);
              expect(listener.handleUndefinedStepResult).toHaveBeenCalledWith(stepResult);
            });
          });

          describe("when the step was not undefined", function() {
            beforeEach(function() {
              stepResult.isUndefined.andReturn(false);
              spyOn(listener, 'handleUndefinedStepResult');
            });

            it("does not handle a skipped step result", function() {
              listener.handleStepResultEvent(event, callback);
              expect(listener.handleSkippedStepResult).not.toHaveBeenCalled();
            });

            it("handles a failed step result", function() {
              listener.handleStepResultEvent(event, callback);
              expect(listener.handleFailedStepResult).toHaveBeenCalledWith(stepResult);
            });
          });
        });
      });
    });

    it("calls back", function() {
      listener.handleStepResultEvent(event, callback);
      expect(callback).toHaveBeenCalled();
    });
  });

  describe("handleSuccessfulStepResult()", function() {
    beforeEach(function() {
      spyOn(listener, 'witnessPassedStep');
      spyOn(listener, 'log');
    });

    it("witnesses a passed step", function() {
      listener.handleSuccessfulStepResult();
      expect(listener.witnessPassedStep).toHaveBeenCalled();
    });

    it("logs the passing step character", function() {
      listener.handleSuccessfulStepResult();
      expect(listener.log).toHaveBeenCalledWith(Cucumber.Listener.ProgressFormatter.PASSED_STEP_CHARACTER);
    });
  });

  describe("handlePendingStepResult()", function() {
    beforeEach(function() {
      spyOn(listener, 'witnessPendingStep');
      spyOn(listener, 'markCurrentScenarioAsPending');
      spyOn(listener, 'log')
    });

    it("witnesses a pending step", function() {
      listener.handlePendingStepResult();
      expect(listener.witnessPendingStep).toHaveBeenCalled();
    });

    it("marks the current scenario as pending", function() {
      listener.handlePendingStepResult();
      expect(listener.markCurrentScenarioAsPending).toHaveBeenCalled();
    });

    it("logs the pending step character", function() {
      listener.handlePendingStepResult();
      expect(listener.log).toHaveBeenCalledWith(Cucumber.Listener.ProgressFormatter.PENDING_STEP_CHARACTER);
    });
  });

  describe("handleSkippedStepResult()", function() {
    beforeEach(function() {
      spyOn(listener, 'witnessSkippedStep');
      spyOn(listener, 'log');
    });

    it("counts one more skipped step", function() {
      listener.handleSkippedStepResult();
      expect(listener.witnessSkippedStep).toHaveBeenCalled();
    });

    it("logs the skipped step character", function() {
      listener.handleSkippedStepResult();
      expect(listener.log).toHaveBeenCalledWith(Cucumber.Listener.ProgressFormatter.SKIPPED_STEP_CHARACTER);
    });
  });

  describe("handleUndefinedStepResult()", function() {
    var stepResult, step;

    beforeEach(function() {
      step       = createSpy("step");
      stepResult = createSpyWithStubs("step result", {getStep: step});
      spyOn(listener, 'storeUndefinedStep');
      spyOn(listener, 'witnessUndefinedStep');
      spyOn(listener, 'markCurrentScenarioAsUndefined');
      spyOn(listener, 'log');
    });

    it("gets the step from the step result", function() {
      listener.handleUndefinedStepResult(stepResult);
      expect(stepResult.getStep).toHaveBeenCalled();
    });

    it("stores the undefined step", function() {
      listener.handleUndefinedStepResult(stepResult);
      expect(listener.storeUndefinedStep).toHaveBeenCalledWith(step);
    });

    it("witnesses an undefined step", function() {
      listener.handleUndefinedStepResult(stepResult);
      expect(listener.witnessUndefinedStep).toHaveBeenCalled();
    });

    it("marks the current scenario as undefined", function() {
      listener.handleUndefinedStepResult(stepResult);
      expect(listener.markCurrentScenarioAsUndefined).toHaveBeenCalled();
    });

    it("logs the undefined step character", function() {
      listener.handleUndefinedStepResult(stepResult);
      expect(listener.log).toHaveBeenCalledWith(Cucumber.Listener.ProgressFormatter.UNDEFINED_STEP_CHARACTER);
    });
  });

  describe("handleFailedStepResult()", function() {
    var stepResult;

    beforeEach(function() {
      stepResult = createSpy("failed step result");
      spyOn(listener, 'storeFailedStepResult');
      spyOn(listener, 'witnessFailedStep');
      spyOn(listener, 'markCurrentScenarioAsFailing');
      spyOn(listener, 'log');
    });

    it("stores the failed step result", function() {
      listener.handleFailedStepResult(stepResult);
      expect(listener.storeFailedStepResult).toHaveBeenCalledWith(stepResult);
    });

    it("witnesses a failed step", function() {
      listener.handleFailedStepResult(stepResult);
      expect(listener.witnessFailedStep).toHaveBeenCalled();
    });

    it("marks the current scenario as failing", function() {
      listener.handleFailedStepResult(stepResult);
      expect(listener.markCurrentScenarioAsFailing).toHaveBeenCalled();
    });

    it("logs the failed step character", function() {
      listener.handleFailedStepResult(stepResult);
      expect(listener.log).toHaveBeenCalledWith(Cucumber.Listener.ProgressFormatter.FAILED_STEP_CHARACTER);
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
      spyOn(listener, 'witnessUndefinedScenario');
      spyOn(listener, 'witnessPendingScenario');
      spyOn(listener, 'witnessFailedScenario');
    });

    it("checks wether the current scenario failed", function() {
      listener.handleAfterScenarioEvent(event, callback);
      expect(listener.isCurrentScenarioFailing).toHaveBeenCalled();
    });

    describe("when the current scenario failed", function() {
      var scenario;

      beforeEach(function() {
        scenario = createSpy("scenario");
        listener.isCurrentScenarioFailing.andReturn(true);
        spyOn(listener, 'storeFailedScenario');
        spyOnStub(event, 'getPayloadItem').andReturn(scenario);
      });

      it("witnesses a failed scenario", function() {
        listener.handleAfterScenarioEvent(event, callback);
        expect(listener.witnessFailedScenario).toHaveBeenCalled();
      });

      it("gets the scenario from the payload", function() {
        listener.handleAfterScenarioEvent(event, callback);
        expect(event.getPayloadItem).toHaveBeenCalledWith('scenario');
      });

      it("stores the failed scenario", function() {
        listener.handleAfterScenarioEvent(event, callback);
        expect(listener.storeFailedScenario).toHaveBeenCalledWith(scenario);
      });
    });

    describe("when the current scenario did not fail", function() {
      beforeEach(function() {
        listener.isCurrentScenarioFailing.andReturn(false);
        spyOn(listener, 'isCurrentScenarioUndefined');
      });

      it("checks wether the current scenario is undefined", function() {
        listener.handleAfterScenarioEvent(event, callback);
        expect(listener.isCurrentScenarioUndefined).toHaveBeenCalled();
      });

      describe("when the current scenario is undefined", function() {
        beforeEach(function() {
          listener.isCurrentScenarioUndefined.andReturn(true);
        });

        it("witnesses an undefined scenario", function() {
          listener.handleAfterScenarioEvent(event, callback);
          expect(listener.witnessUndefinedScenario).toHaveBeenCalled();
        });
      });

      describe("when the current scenario is not undefined", function() {
        beforeEach(function() {
          listener.isCurrentScenarioUndefined.andReturn(false);
          spyOn(listener, 'isCurrentScenarioPending');
        });

        it("checks wether the current scenario is pending", function() {
          listener.handleAfterScenarioEvent(event, callback);
          expect(listener.isCurrentScenarioPending).toHaveBeenCalled();
        });

        describe("when the current scenario is pending", function() {
          beforeEach(function() {
            listener.isCurrentScenarioPending.andReturn(true);
          });

          it("witnesses a pending scenario", function() {
            listener.handleAfterScenarioEvent(event, callback);
            expect(listener.witnessPendingScenario).toHaveBeenCalled();
          });
        });

        describe("when the current scenario is not pending (passed)", function() {
          beforeEach(function() {
            listener.isCurrentScenarioPending.andReturn(false);
          });

          it("witnesses a passed scenario", function() {
            listener.handleAfterScenarioEvent(event, callback);
            expect(listener.witnessPassedScenario).toHaveBeenCalled();
          });
        });
      });
    });
    it("calls back", function() {
      listener.handleAfterScenarioEvent(event, callback);
      expect(callback).toHaveBeenCalled();
    });
  });

  describe("isCurrentScenarioFailing()", function() {
    it("returns false when the current scenario did not fail yet", function() {
      expect(listener.isCurrentScenarioFailing()).toBeFalsy();
    });

    it("returns true when a step in the current scenario failed", function() {
      listener.markCurrentScenarioAsFailing();
      expect(listener.isCurrentScenarioFailing()).toBeTruthy();
    });
  });

  describe("isCurrentScenarioPending()", function() {
    it("returns false when the current scenario was not set pending yet", function() {
      expect(listener.isCurrentScenarioPending()).toBeFalsy();
    });

    it("returns true when the current scenario was set pending", function() {
      listener.markCurrentScenarioAsPending();
      expect(listener.isCurrentScenarioPending()).toBeTruthy();
    });
  });

  describe("isCurrentScenarioUndefined()", function() {
    it("returns false when the current scenario was not set undefined yet", function() {
      expect(listener.isCurrentScenarioUndefined()).toBeFalsy();
    });

    it("returns true when the current scenario was set undefined", function() {
      listener.markCurrentScenarioAsUndefined();
      expect(listener.isCurrentScenarioUndefined()).toBeTruthy();
    });
  });

  describe("prepareBeforeScenario()", function() {
    it("unmarks the current scenario as pending", function() {
      listener.markCurrentScenarioAsPending();
      listener.prepareBeforeScenario();
      expect(listener.isCurrentScenarioPending()).toBeFalsy();
    });

    it("unmarks the current scenario as failing", function() {
      listener.markCurrentScenarioAsFailing();
      listener.prepareBeforeScenario();
      expect(listener.isCurrentScenarioFailing()).toBeFalsy();
    });

    it("unmarks the current scenario as undefined", function() {
      listener.markCurrentScenarioAsUndefined();
      listener.prepareBeforeScenario();
      expect(listener.isCurrentScenarioUndefined()).toBeFalsy();
    });
  });

  describe("storeFailedStepResult()", function() {
    var failedStepResult;

    beforeEach(function() {
      failedStepResult = createSpy("failed step result");
      spyOnStub(failedStepResults, 'add');
    });

    it("adds the result to the failed step result collection", function() {
      listener.storeFailedStepResult(failedStepResult);
      expect(failedStepResults.add).toHaveBeenCalledWith(failedStepResult);
    });
  });

  describe("storeFailedScenario()", function() {
    var failedScenario, name, line;

    beforeEach(function() {
      name           = "some failed scenario";
      line           = "123";
      string         = ":" + line + " # Scenario: " + name;
      failedScenario = createSpyWithStubs("failedScenario", {getName: name, getLine: line});
      spyOn(listener, 'appendStringToFailedScenarioLogBuffer');
    });

    it("gets the name of the scenario", function() {
      listener.storeFailedScenario(failedScenario);
      expect(failedScenario.getName).toHaveBeenCalled();
    });

    it("gets the line of the scenario", function() {
      listener.storeFailedScenario(failedScenario);
      expect(failedScenario.getLine).toHaveBeenCalled();
    });

    it("appends the scenario details to the failed scenario log buffer", function() {
      listener.storeFailedScenario(failedScenario);
      expect(listener.appendStringToFailedScenarioLogBuffer).toHaveBeenCalledWith(string);
    });
  });

  describe("storeUndefinedStep()", function() {
    var snippetBuilder, snippet, step;

    beforeEach(function() {
      stpe           = createSpy("step");
      snippet        = createSpy("step definition snippet");
      snippetBuilder = createSpyWithStubs("snippet builder", {buildSnippet: snippet});
      spyOn(Cucumber.SupportCode, 'StepDefinitionSnippetBuilder').andReturn(snippetBuilder);
      spyOn(listener, 'appendStringToUndefinedStepLogBuffer');
    });

    it("creates a new step definition snippet builder", function() {
      listener.storeUndefinedStep(step);
      expect(Cucumber.SupportCode.StepDefinitionSnippetBuilder).toHaveBeenCalledWith(step);
    });

    it("builds the step definition", function() {
      listener.storeUndefinedStep(step);
      expect(snippetBuilder.buildSnippet).toHaveBeenCalled();
    });

    it("appends the snippet to the undefined step log buffer", function() {
      listener.storeUndefinedStep(step);
      expect(listener.appendStringToUndefinedStepLogBuffer).toHaveBeenCalledWith(snippet);
    });
  });

  describe("getFailedScenarioLogBuffer() [appendStringToFailedScenarioLogBuffer()]", function() {
    it("returns the logged failed scenario details", function() {
      listener.appendStringToFailedScenarioLogBuffer("abc");
      expect(listener.getFailedScenarioLogBuffer()).toBe("abc\n");
    });

    it("returns all logged failed scenario lines joined with a line break", function() {
      listener.appendStringToFailedScenarioLogBuffer("abc");
      listener.appendStringToFailedScenarioLogBuffer("def");
      expect(listener.getFailedScenarioLogBuffer()).toBe("abc\ndef\n");
    });
  });

  describe("getUndefinedStepLogBuffer() [appendStringToUndefinedStepLogBuffer()]", function() {
    it("returns the logged undefined step details", function() {
      listener.appendStringToUndefinedStepLogBuffer("abc");
      expect(listener.getUndefinedStepLogBuffer()).toBe("abc\n");
    });

    it("returns all logged failed scenario lines joined with a line break", function() {
      listener.appendStringToUndefinedStepLogBuffer("abc");
      listener.appendStringToUndefinedStepLogBuffer("def");
      expect(listener.getUndefinedStepLogBuffer()).toBe("abc\ndef\n");
    });
  });

  describe("appendStringToUndefinedStepLogBuffer() [getUndefinedStepLogBuffer()]", function() {
    it("does not log the same string twice", function() {
      listener.appendStringToUndefinedStepLogBuffer("abcdef");
      listener.appendStringToUndefinedStepLogBuffer("abcdef");
      expect(listener.getUndefinedStepLogBuffer()).toBe("abcdef\n");
    });
  });

  describe("logSummary()", function() {
    var scenarioCount, passedScenarioCount, failedScenarioCount;
    var stepCount, passedStepCount;

    beforeEach(function() {
      spyOn(listener, 'log');
      spyOn(listener, 'witnessedAnyFailedStep');
      spyOn(listener, 'witnessedAnyUndefinedStep');
      spyOn(listener, 'logFailedStepResults');
      spyOn(listener, 'logScenariosSummary');
      spyOn(listener, 'logStepsSummary');
      spyOn(listener, 'logUndefinedStepSnippets');
    });

    it("logs two line feeds", function() {
      listener.logSummary();
      expect(listener.log).toHaveBeenCalledWith("\n\n");
    });

    it("checks wether there are failed steps or not", function() {
      listener.logSummary();
      expect(listener.witnessedAnyFailedStep).toHaveBeenCalled();
    });

    describe("when there are failed steps", function() {
      beforeEach(function() {
        listener.witnessedAnyFailedStep.andReturn(true);
      });

      it("logs the failed steps", function() {
        listener.logSummary();
        expect(listener.logFailedStepResults).toHaveBeenCalled();
      });
    });

    describe("when there are no failed steps", function() {
      beforeEach(function() {
        listener.witnessedAnyFailedStep.andReturn(false);
      });

      it("does not log failed steps", function() {
        listener.logSummary();
        expect(listener.logFailedStepResults).not.toHaveBeenCalled();
      });
    });

    it("logs the scenarios summary", function() {
      listener.logSummary();
      expect(listener.logScenariosSummary).toHaveBeenCalled();
    });

    it("logs the steps summary", function() {
      listener.logSummary();
      expect(listener.logStepsSummary).toHaveBeenCalled();
    });

    it("checks wether there are undefined steps or not", function() {
      listener.logSummary();
      expect(listener.witnessedAnyUndefinedStep).toHaveBeenCalled();
    });

    describe("when there are undefined steps", function() {
      beforeEach(function() {
        listener.witnessedAnyUndefinedStep.andReturn(true);
      });

      it("logs the undefined step snippets", function() {
        listener.logSummary();
        expect(listener.logUndefinedStepSnippets).toHaveBeenCalled();
      });
    });

    describe("when there are no undefined steps", function() {
      beforeEach(function() {
        listener.witnessedAnyUndefinedStep.andReturn(false);
      });

      it("does not log the undefined step snippets", function() {
        listener.logSummary();
        expect(listener.logUndefinedStepSnippets).not.toHaveBeenCalled();
      });
    });
  });

  describe("logFailedStepResults()", function() {
    var failedScenarioLogBuffer;

    beforeEach(function() {
      failedScenarioLogBuffer = createSpy("failed scenario log buffer");
      spyOnStub(failedStepResults, 'syncForEach');
      spyOn(listener, 'log');
      spyOn(listener, 'getFailedScenarioLogBuffer').andReturn(failedScenarioLogBuffer);
    });

    it("logs a failed steps header", function() {
      listener.logFailedStepResults();
      expect(listener.log).toHaveBeenCalledWith("(::) failed steps (::)\n\n");
    });

    it("iterates synchronously over the failed step results", function() {
      listener.logFailedStepResults();
      expect(failedStepResults.syncForEach).toHaveBeenCalled();
      expect(failedStepResults.syncForEach).toHaveBeenCalledWithAFunctionAsNthParameter(1);
    });

    describe("for each failed step result", function() {
      var userFunction, failedStep, forEachCallback;

      beforeEach(function() {
        listener.logFailedStepResults();
        userFunction     = failedStepResults.syncForEach.mostRecentCall.args[0];
        failedStepResult = createSpy("failed step result");
        spyOn(listener, 'logFailedStepResult');
      });

      it("tells the visitor to visit the feature and call back when finished", function() {
        userFunction(failedStepResult);
        expect(listener.logFailedStepResult).toHaveBeenCalledWith(failedStepResult);
      });
    });

    it("logs a failed scenarios header", function() {
      listener.logFailedStepResults();
      expect(listener.log).toHaveBeenCalledWith("Failing scenarios:\n");
    });

    it("gets the failed scenario details from its log buffer", function() {
      listener.logFailedStepResults();
      expect(listener.getFailedScenarioLogBuffer).toHaveBeenCalled();
    });

    it("logs the failed scenario details", function() {
      listener.logFailedStepResults();
      expect(listener.log).toHaveBeenCalledWith(failedScenarioLogBuffer);
    });

    it("logs a line break", function() {
      listener.logFailedStepResults();
      expect(listener.log).toHaveBeenCalledWith("\n");
    });
  });

  describe("logFailedStepResult()", function() {
    var stepResult, failureException;

    beforeEach(function() {
      spyOn(listener, 'log');
      failureException = createSpy('caught exception');
      stepResult       = createSpyWithStubs("failed step result", { getFailureException: failureException });
    });

    it("gets the failure exception from the step result", function() {
      listener.logFailedStepResult(stepResult);
      expect(stepResult.getFailureException).toHaveBeenCalled();
    });

    describe("when the failure exception has a stack", function() {
      beforeEach(function() {
        failureException.stack = createSpy('failure exception stack');
      });

      it("logs the stack", function() {
        listener.logFailedStepResult(stepResult);
        expect(listener.log).toHaveBeenCalledWith(failureException.stack);
      });
    });

    describe("when the failure exception has no stack", function() {
      it("logs the exception itself", function() {
        listener.logFailedStepResult(stepResult);
        expect(listener.log).toHaveBeenCalledWith(failureException);
      });
    });

    it("logs two line breaks", function() {
      listener.logFailedStepResult(stepResult);
      expect(listener.log).toHaveBeenCalledWith("\n\n");
    });
  });

  describe("logScenariosSummary()", function() {
    var scenarioCount, passedScenarioCount, pendingScenarioCount, failedScenarioCount;

    beforeEach(function() {
      scenarioCount          = 12;
      passedScenarioCount    = 9;
      undefinedScenarioCount = 17;
      pendingScenarioCount   = 7;
      failedScenarioCount    = 15;
      spyOn(listener, 'log');
      spyOn(listener, 'getScenarioCount').andReturn(scenarioCount);
      spyOn(listener, 'getPassedScenarioCount').andReturn(passedScenarioCount);
      spyOn(listener, 'getUndefinedScenarioCount').andReturn(undefinedScenarioCount);
      spyOn(listener, 'getPendingScenarioCount').andReturn(pendingScenarioCount);
      spyOn(listener, 'getFailedScenarioCount').andReturn(failedScenarioCount);
    });

    it("gets the number of scenarios", function() {
      listener.logScenariosSummary();
      expect(listener.getScenarioCount).toHaveBeenCalled();
    });

    describe("when there are no scenarios", function() {
      beforeEach(function() { listener.getScenarioCount.andReturn(0); });

      it("logs 0 scenarios", function() {
        listener.logScenariosSummary();
        expect(listener.log).toHaveBeenCalledWithStringMatching(/0 scenarios/);
      });

      it("does not log any details", function() {
        listener.logScenariosSummary();
        expect(listener.log).not.toHaveBeenCalledWithStringMatching(/\(.*\)/);
      });
    });

    describe("when there are scenarios", function() {
      beforeEach(function() { listener.getScenarioCount.andReturn(12); });

      describe("when there is one scenario", function() {
        beforeEach(function() { listener.getScenarioCount.andReturn(1); });

        it("logs one scenario", function() {
          listener.logScenariosSummary();
          expect(listener.log).toHaveBeenCalledWithStringMatching(/1 scenario([^s]|$)/);
        });
      });

      describe("when there are 2 or more scenarios", function() {
        beforeEach(function() { listener.getScenarioCount.andReturn(2); });

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
        beforeEach(function() { listener.getFailedScenarioCount.andReturn(0); });

        it("does not log failed scenarios", function() {
          listener.logScenariosSummary();
          expect(listener.log).not.toHaveBeenCalledWithStringMatching(/failed/);
        });
      });

      describe("when there is one failed scenario", function() {
        beforeEach(function() { listener.getFailedScenarioCount.andReturn(1); });

        it("logs a failed scenario", function() {
          listener.logScenariosSummary();
          expect(listener.log).toHaveBeenCalledWithStringMatching(/1 failed/);
        });
      });

      describe("when there are two or more failed scenarios", function() {
        beforeEach(function() { listener.getFailedScenarioCount.andReturn(2); });

        it("logs the number of failed scenarios", function() {
          listener.logScenariosSummary();
          expect(listener.log).toHaveBeenCalledWithStringMatching(/2 failed/);
        });
      });

      it("gets the number of undefined scenarios", function() {
        listener.logScenariosSummary();
        expect(listener.getUndefinedScenarioCount).toHaveBeenCalled();
      });

      describe("when there are no undefined scenarios", function() {
        beforeEach(function() { listener.getUndefinedScenarioCount.andReturn(0); });

        it("does not log passed scenarios", function() {
          listener.logScenariosSummary();
          expect(listener.log).not.toHaveBeenCalledWithStringMatching(/undefined/);
        });
      });

      describe("when there is one undefined scenario", function() {
        beforeEach(function() { listener.getUndefinedScenarioCount.andReturn(1); });

        it("logs one undefined scenario", function() {
          listener.logScenariosSummary();
          expect(listener.log).toHaveBeenCalledWithStringMatching(/1 undefined/);
        });
      });

      describe("when there are two or more undefined scenarios", function() {
        beforeEach(function() { listener.getUndefinedScenarioCount.andReturn(2); });

        it("logs the undefined scenarios", function() {
          listener.logScenariosSummary();
          expect(listener.log).toHaveBeenCalledWithStringMatching(/2 undefined/);
        });
      });

      it("gets the number of pending scenarios", function() {
        listener.logScenariosSummary();
        expect(listener.getPendingScenarioCount).toHaveBeenCalled();
      });

      describe("when there are no pending scenarios", function() {
        beforeEach(function() { listener.getPendingScenarioCount.andReturn(0); });

        it("does not log passed scenarios", function() {
          listener.logScenariosSummary();
          expect(listener.log).not.toHaveBeenCalledWithStringMatching(/pending/);
        });
      });

      describe("when there is one pending scenario", function() {
        beforeEach(function() { listener.getPendingScenarioCount.andReturn(1); });

        it("logs one pending scenario", function() {
          listener.logScenariosSummary();
          expect(listener.log).toHaveBeenCalledWithStringMatching(/1 pending/);
        });
      });

      describe("when there are two or more pending scenarios", function() {
        beforeEach(function() { listener.getPendingScenarioCount.andReturn(2); });

        it("logs the pending scenarios", function() {
          listener.logScenariosSummary();
          expect(listener.log).toHaveBeenCalledWithStringMatching(/2 pending/);
        });
      });

      it("gets the number of passed scenarios", function() {
        listener.logScenariosSummary();
        expect(listener.getPassedScenarioCount).toHaveBeenCalled();
      });

      describe("when there are no passed scenarios", function() {
        beforeEach(function() { listener.getPassedScenarioCount.andReturn(0); });

        it("does not log passed scenarios", function() {
          listener.logScenariosSummary();
          expect(listener.log).not.toHaveBeenCalledWithStringMatching(/passed/);
        });
      });

      describe("when there is one passed scenario", function() {
        beforeEach(function() { listener.getPassedScenarioCount.andReturn(1); });

        it("logs 1 passed scenarios", function() {
          listener.logScenariosSummary();
          expect(listener.log).toHaveBeenCalledWithStringMatching(/1 passed/);
        });
      });

      describe("when there are two or more passed scenarios", function() {
        beforeEach(function() { listener.getPassedScenarioCount.andReturn(2); });

        it("logs the number of passed scenarios", function() {
          listener.logScenariosSummary();
          expect(listener.log).toHaveBeenCalledWithStringMatching(/2 passed/);
        });
      });
    });
  });

  describe("logStepsSummary()", function() {
    var stepCount, passedStepCount, failedStepCount, skippedStepCount, pendingStepCount;

    beforeEach(function() {
      stepCount          = 34;
      passedStepCount    = 31;
      failedStepCount    = 7;
      skippedStepCount   = 5;
      undefinedStepCount = 4;
      pendingStepCount   = 2;
      spyOn(listener, 'log');
      spyOn(listener, 'getStepCount').andReturn(stepCount);
      spyOn(listener, 'getPassedStepCount').andReturn(passedStepCount);
      spyOn(listener, 'getFailedStepCount').andReturn(failedStepCount);
      spyOn(listener, 'getSkippedStepCount').andReturn(skippedStepCount);
      spyOn(listener, 'getUndefinedStepCount').andReturn(undefinedStepCount);
      spyOn(listener, 'getPendingStepCount').andReturn(pendingStepCount);
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

      it("does not log any details", function() {
        listener.logStepsSummary();
        expect(listener.log).not.toHaveBeenCalledWithStringMatching(/\(.*\)/);
      });
    });

    describe("when there are steps", function() {
      beforeEach(function() { listener.getStepCount.andReturn(13); });

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

      it("gets the number of undefined steps", function() {
        listener.logStepsSummary();
        expect(listener.getUndefinedStepCount).toHaveBeenCalled();
      });

      describe("when there are no undefined steps", function() {
        beforeEach(function() {
          listener.getUndefinedStepCount.andReturn(0);
        });

        it("does not log undefined steps", function() {
          listener.logStepsSummary();
          expect(listener.log).not.toHaveBeenCalledWithStringMatching(/undefined/);
        });
      });

      describe("when there is one undefined step", function() {
        beforeEach(function() {
          listener.getUndefinedStepCount.andReturn(1);
        });

        it("logs one undefined steps", function() {
          listener.logStepsSummary();
          expect(listener.log).toHaveBeenCalledWithStringMatching(/1 undefined/);
        });
      });

      describe("when there are two or more undefined steps", function() {
        beforeEach(function() {
          listener.getUndefinedStepCount.andReturn(2);
        });

        it("logs the number of undefined steps", function() {
          listener.logStepsSummary();
          expect(listener.log).toHaveBeenCalledWithStringMatching(/2 undefined/);
        });
      });

      it("gets the number of pending steps", function() {
        listener.logStepsSummary();
        expect(listener.getPendingStepCount).toHaveBeenCalled();
      });

      describe("when there are no pending steps", function() {
        beforeEach(function() {
          listener.getPendingStepCount.andReturn(0);
        });

        it("does not log pending steps", function() {
          listener.logStepsSummary();
          expect(listener.log).not.toHaveBeenCalledWithStringMatching(/pending/);
        });
      });

      describe("when there is one pending step", function() {
        beforeEach(function() {
          listener.getPendingStepCount.andReturn(1);
        });

        it("logs one pending steps", function() {
          listener.logStepsSummary();
          expect(listener.log).toHaveBeenCalledWithStringMatching(/1 pending/);
        });
      });

      describe("when there are two or more pending steps", function() {
        beforeEach(function() {
          listener.getPendingStepCount.andReturn(2);
        });

        it("logs the number of pending steps", function() {
          listener.logStepsSummary();
          expect(listener.log).toHaveBeenCalledWithStringMatching(/2 pending/);
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
  });

  describe("logUndefinedStepSnippets()", function() {
    var undefinedStepLogBuffer;

    beforeEach(function() {
      undefinedStepLogBuffer = createSpy("undefined step log buffer");
      spyOn(listener, 'log');
      spyOn(listener, 'getUndefinedStepLogBuffer').andReturn(undefinedStepLogBuffer);
    });

    it("logs a little explanation about the snippets", function() {
      listener.logUndefinedStepSnippets();
      expect(listener.log).toHaveBeenCalledWith("\nYou can implement step definitions for undefined steps with these snippets:\n\n");
    });

    it("gets the undefined steps log buffer", function() {
      listener.logUndefinedStepSnippets();
      expect(listener.getUndefinedStepLogBuffer).toHaveBeenCalled();
    });

    it("logs the undefined steps", function() {
      listener.logUndefinedStepSnippets();
      expect(listener.log).toHaveBeenCalledWith(undefinedStepLogBuffer);
    });
  });

  describe("getScenarioCount()", function() {
    var passedScenarioCount, undefinedScenarioCount, pendingScenarioCount, failedScenarioCount;

    beforeEach(function() {
      passedScenarioCount    = Math.floor(Math.random()*11) + 1;
      undefinedScenarioCount = Math.floor(Math.random()*11) + 1;
      pendingScenarioCount   = Math.floor(Math.random()*11) + 1;
      failedScenarioCount    = Math.floor(Math.random()*11) + 1;
      spyOn(listener, 'getPassedScenarioCount').andReturn(passedScenarioCount);
      spyOn(listener, 'getUndefinedScenarioCount').andReturn(undefinedScenarioCount);
      spyOn(listener, 'getPendingScenarioCount').andReturn(pendingScenarioCount);
      spyOn(listener, 'getFailedScenarioCount').andReturn(failedScenarioCount);
    });

    it("gets the number of passed scenarios", function() {
      listener.getScenarioCount();
      expect(listener.getPassedScenarioCount).toHaveBeenCalled();
    });

    it("gets the number of undefined scenarios", function() {
      listener.getScenarioCount();
      expect(listener.getUndefinedScenarioCount).toHaveBeenCalled();
    });

    it("gets the number of pending scenarios", function() {
      listener.getScenarioCount();
      expect(listener.getPendingScenarioCount).toHaveBeenCalled();
    });

    it("gets the number of failed scenarios", function() {
      listener.getScenarioCount();
      expect(listener.getFailedScenarioCount).toHaveBeenCalled();
    });

    it("returns the sum of passed, undefined, pending aand failed scenarios", function() {
      expect(listener.getScenarioCount()).toBe(passedScenarioCount + undefinedScenarioCount + pendingScenarioCount + failedScenarioCount);
    });
  });

  describe("getStepCount()", function() {
    var passedStepCount, undefinedStepCount, skippedStepCount, pendingStepCount, failedStepCount, stepCount;

    beforeEach(function() {
      passedStepCount    = Math.floor(Math.random()*11) + 1;
      undefinedStepCount = Math.floor(Math.random()*11) + 1;
      skippedStepCount   = Math.floor(Math.random()*11) + 1;
      pendingStepCount   = Math.floor(Math.random()*11) + 1;
      failedStepCount    = Math.floor(Math.random()*11) + 1;
      stepCount          =
        undefinedStepCount +
        passedStepCount    +
        skippedStepCount   +
        pendingStepCount   +
        failedStepCount;
      spyOn(listener, 'getPassedStepCount').andReturn(passedStepCount);
      spyOn(listener, 'getUndefinedStepCount').andReturn(undefinedStepCount);
      spyOn(listener, 'getSkippedStepCount').andReturn(skippedStepCount);
      spyOn(listener, 'getPendingStepCount').andReturn(pendingStepCount);
      spyOn(listener, 'getFailedStepCount').andReturn(failedStepCount);
    });

    it("gets the number of passed steps", function() {
      listener.getStepCount();
      expect(listener.getPassedStepCount).toHaveBeenCalled();
    });

    it("gets the number of undefined steps", function() {
      listener.getStepCount();
      expect(listener.getUndefinedStepCount).toHaveBeenCalled();
    });

    it("gets the number of skipped steps", function() {
      listener.getStepCount();
      expect(listener.getSkippedStepCount).toHaveBeenCalled();
    });

    it("gets the number of pending steps", function() {
      listener.getStepCount();
      expect(listener.getPendingStepCount).toHaveBeenCalled();
    });

    it("gets the number of failed steps", function() {
      listener.getStepCount();
      expect(listener.getFailedStepCount).toHaveBeenCalled();
    });

    it("returns the sum of passed steps and failed steps", function() {
      expect(listener.getStepCount()).toBe(stepCount);
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

  describe("undefined scenario counting", function() {
    describe("getUndefinedScenarioCount()", function() {
      it("returns 0 when no scenarios undefined", function() {
        expect(listener.getUndefinedScenarioCount()).toBe(0);
      });

      it("returns 1 when one scenario passed", function() {
        listener.witnessUndefinedScenario();
        expect(listener.getUndefinedScenarioCount()).toBe(1);
      });

      it("returns 2 when two scenarios passed", function() {
        listener.witnessUndefinedScenario();
        listener.witnessUndefinedScenario();
        expect(listener.getUndefinedScenarioCount()).toBe(2);
      });

      it("returns 3 when two scenarios passed", function() {
        listener.witnessUndefinedScenario();
        listener.witnessUndefinedScenario();
        listener.witnessUndefinedScenario();
        expect(listener.getUndefinedScenarioCount()).toBe(3);
      });
    });
  });

  describe("pending scenario counting", function() {
    describe("getPendingScenarioCount()", function() {
      it("returns 0 when no scenarios pending", function() {
        expect(listener.getPendingScenarioCount()).toBe(0);
      });

      it("returns 1 when one scenario passed", function() {
        listener.witnessPendingScenario();
        expect(listener.getPendingScenarioCount()).toBe(1);
      });

      it("returns 2 when two scenarios passed", function() {
        listener.witnessPendingScenario();
        listener.witnessPendingScenario();
        expect(listener.getPendingScenarioCount()).toBe(2);
      });

      it("returns 3 when two scenarios passed", function() {
        listener.witnessPendingScenario();
        listener.witnessPendingScenario();
        listener.witnessPendingScenario();
        expect(listener.getPendingScenarioCount()).toBe(3);
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

  describe("undefined step counting", function() {
    describe("getUndefinedStepCount()", function() {
      it("returns 0 when no steps undefined", function() {
        expect(listener.getUndefinedStepCount()).toBe(0);
      });

      it("returns 1 when one step passed", function() {
        listener.witnessUndefinedStep();
        expect(listener.getUndefinedStepCount()).toBe(1);
      });

      it("returns 2 when two steps passed", function() {
        listener.witnessUndefinedStep();
        listener.witnessUndefinedStep();
        expect(listener.getUndefinedStepCount()).toBe(2);
      });

      it("returns 3 when two steps passed", function() {
        listener.witnessUndefinedStep();
        listener.witnessUndefinedStep();
        listener.witnessUndefinedStep();
        expect(listener.getUndefinedStepCount()).toBe(3);
      });
    });
  });

  describe("pending step counting", function() {
    describe("getPendingStepCount()", function() {
      it("returns 0 when no steps pending", function() {
        expect(listener.getPendingStepCount()).toBe(0);
      });

      it("returns 1 when one step passed", function() {
        listener.witnessPendingStep();
        expect(listener.getPendingStepCount()).toBe(1);
      });

      it("returns 2 when two steps passed", function() {
        listener.witnessPendingStep();
        listener.witnessPendingStep();
        expect(listener.getPendingStepCount()).toBe(2);
      });

      it("returns 3 when two steps passed", function() {
        listener.witnessPendingStep();
        listener.witnessPendingStep();
        listener.witnessPendingStep();
        expect(listener.getPendingStepCount()).toBe(3);
      });
    });
  });

  describe("witnessedAnyFailedStep()", function() {
    it("returns false when no failed step were encountered", function() {
      expect(listener.witnessedAnyFailedStep()).toBeFalsy();
    });

    it("returns true when one or more steps were witnessed", function() {
      listener.witnessFailedStep();
      expect(listener.witnessedAnyFailedStep()).toBeTruthy();
    });
  });

  describe("witnessedAnyUndefinedStep()", function() {
    it("returns false when no undefined step were encountered", function() {
      expect(listener.witnessedAnyUndefinedStep()).toBeFalsy();
    });

    it("returns true when one or more steps were witnessed", function() {
      listener.witnessUndefinedStep();
      expect(listener.witnessedAnyUndefinedStep()).toBeTruthy();
    });
  });
});
