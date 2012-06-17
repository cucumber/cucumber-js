require('../../support/spec_helper');

describe("Cucumber.Listener.ProgressFormatter", function () {
  var Cucumber = requireLib('cucumber');
  var listener, listenerHearMethod, progressFormatter, statsJournal, failedStepResults;

  beforeEach(function () {
    var ProgressFormatter = Cucumber.Listener.ProgressFormatter;
    listener           = createSpyWithStubs("listener");
    listenerHearMethod = spyOnStub(listener, 'hear');
    statsJournal       = createSpy("stats journal");
    failedStepResults  = createSpy("failed steps");
    spyOn(Cucumber.Type, 'Collection').andReturn(failedStepResults);
    spyOn(Cucumber, 'Listener').andReturn(listener);
    spyOnStub(Cucumber.Listener, 'StatsJournal').andReturn(statsJournal);
    Cucumber.Listener.ProgressFormatter = ProgressFormatter;
    progressFormatter = Cucumber.Listener.ProgressFormatter();
  });

  it("is based on the listener", function () {
    expect(progressFormatter).toBe(listener);
  });

  describe("constructor", function () {
    it("creates a listener", function() {
      expect(Cucumber.Listener).toHaveBeenCalled();
    });

    it("creates a collection to store the failed steps", function () {
      expect(Cucumber.Type.Collection).toHaveBeenCalled();
    });

    it("creates a stats journal", function () {
      expect(Cucumber.Listener.StatsJournal).toHaveBeenCalled();
    })
  });

  describe("log()", function () {
    var logged, alsoLogged, loggedBuffer;

    beforeEach(function () {
      logged       = "this was logged";
      alsoLogged   = "this was also logged";
      loggedBuffer = logged + alsoLogged;
      spyOn(process.stdout, 'write');
    });

    it("records logged strings", function () {
      progressFormatter.log(logged);
      progressFormatter.log(alsoLogged);
      expect(progressFormatter.getLogs()).toBe(loggedBuffer);
    });

    it("outputs the logged string to STDOUT by default", function () {
        progressFormatter.log(logged);
        expect(process.stdout.write).toHaveBeenCalledWith(logged);
    });

    describe("when asked to output to STDOUT", function () {
      beforeEach(function () {
        progressFormatter = Cucumber.Listener.ProgressFormatter({logToConsole: true});
      });

      it("outputs the logged string to STDOUT", function () {
        progressFormatter.log(logged);
        expect(process.stdout.write).toHaveBeenCalledWith(logged);
      });
    });

    describe("when asked to not output to STDOUT", function () {
      beforeEach(function () {
        progressFormatter = Cucumber.Listener.ProgressFormatter({logToConsole: false});
      });

      it("does not output anything to STDOUT", function () {
        progressFormatter.log(logged);
        expect(process.stdout.write).not.toHaveBeenCalledWith(logged);
      });
    });

    describe("when asked to output to a function", function () {
      var userFunction;

      beforeEach(function () {
        userFunction      = createSpy("output user function");
        progressFormatter = Cucumber.Listener.ProgressFormatter({logToFunction: userFunction});
      });

      it("calls the function with the logged string", function () {
        progressFormatter.log(logged);
        expect(userFunction).toHaveBeenCalledWith(logged);
      });
    });
  });

  describe("getLogs()", function () {
    it("returns the logged buffer", function () {
      var logged       = "this was logged";
      var alsoLogged   = "this was also logged";
      var loggedBuffer = logged + alsoLogged;
      spyOn(process.stdout, 'write'); // prevent actual output during spec execution
      progressFormatter.log(logged);
      progressFormatter.log(alsoLogged);
      expect(progressFormatter.getLogs()).toBe(loggedBuffer);
    });

    it("returns an empty string when the progress formatter did not log anything yet", function () {
      expect(progressFormatter.getLogs()).toBe("");
    });
  });

  describe("hear()", function () {
    var event, callback;

    beforeEach(function () {
      event    = createSpy("event");
      callback = createSpy("callback");
      spyOnStub(statsJournal, 'hear');
    });

    it("tells the stats journal to listen to the event", function () {
      progressFormatter.hear(event, callback);
      expect(statsJournal.hear).toHaveBeenCalled();
      expect(statsJournal.hear).toHaveBeenCalledWithValueAsNthParameter(event, 1);
      expect(statsJournal.hear).toHaveBeenCalledWithAFunctionAsNthParameter(2);
    });

    describe("stats journal callback", function () {
      var statsJournalCallback;

      beforeEach(function () {
        progressFormatter.hear(event, callback);
        statsJournalCallback = statsJournal.hear.mostRecentCall.args[1];
      });

      it("tells the listener to listen to the event", function () {
        statsJournalCallback();
        expect(listenerHearMethod).toHaveBeenCalledWith(event, callback);
      });
    });
  });

  describe("handleStepResultEvent()", function () {
    var event, callback, stepResult;

    beforeEach(function () {
      stepResult = createSpyWithStubs("step result", {
        isSuccessful: undefined,
        isPending:    undefined,
        isFailed:     undefined,
        isSkipped:    undefined,
        isUndefined:  undefined
      });
      event      = createSpyWithStubs("event", {getPayloadItem: stepResult});
      callback   = createSpy("Callback");
      spyOn(progressFormatter, 'handleFailedStepResult');
    });

    it("gets the step result from the event payload", function () {
      progressFormatter.handleStepResultEvent(event, callback);
      expect(event.getPayloadItem).toHaveBeenCalledWith('stepResult');
    });

    it("checks whether the step was successful or not", function () {
      progressFormatter.handleStepResultEvent(event, callback);
      expect(stepResult.isSuccessful).toHaveBeenCalled();
    });

    describe("when the step passed", function () {
      beforeEach(function () {
        stepResult.isSuccessful.andReturn(true);
        spyOn(progressFormatter, 'handleSuccessfulStepResult');
      });

      it("handles the successful step result", function () {
        progressFormatter.handleStepResultEvent(event, callback);
        expect(progressFormatter.handleSuccessfulStepResult).toHaveBeenCalled();
      });
    });

    describe("when the step did not pass", function () {
      beforeEach(function () {
        stepResult.isSuccessful.andReturn(false);
        spyOn(progressFormatter, 'handleSuccessfulStepResult');
      });

      it("does not handle a successful step result", function () {
        progressFormatter.handleStepResultEvent(event, callback);
        expect(progressFormatter.handleSuccessfulStepResult).not.toHaveBeenCalled();
      });

      it("checks whether the step is pending", function () {
        progressFormatter.handleStepResultEvent(event, callback);
        expect(stepResult.isPending).toHaveBeenCalled();
      });

      describe("when the step was pending", function () {
        beforeEach(function () {
          stepResult.isPending.andReturn(true);
          spyOn(progressFormatter, 'handlePendingStepResult');
        });

        it("handles the pending step result", function () {
          progressFormatter.handleStepResultEvent(event, callback);
          expect(progressFormatter.handlePendingStepResult).toHaveBeenCalled();
        });
      });

      describe("when the step was not pending", function () {
        beforeEach(function () {
          stepResult.isPending.andReturn(false);
          spyOn(progressFormatter, 'handlePendingStepResult');
        });

        it("does not handle a pending step result", function () {
          progressFormatter.handleStepResultEvent(event, callback);
          expect(progressFormatter.handlePendingStepResult).not.toHaveBeenCalled();
        });

        it("checks whether the step was skipped", function () {
          progressFormatter.handleStepResultEvent(event, callback);
          expect(stepResult.isSkipped).toHaveBeenCalled();
        });

        describe("when the step was skipped", function () {
          beforeEach(function () {
            stepResult.isSkipped.andReturn(true);
            spyOn(progressFormatter, 'handleSkippedStepResult');
          });

          it("handles the skipped step result", function () {
            progressFormatter.handleStepResultEvent(event, callback);
            expect(progressFormatter.handleSkippedStepResult).toHaveBeenCalled();
          });
        });

        describe("when the step was not skipped", function () {
          beforeEach(function () {
            stepResult.isSkipped.andReturn(false);
            spyOn(progressFormatter, 'handleSkippedStepResult');
          });

          it("does not handle a skipped step result", function () {
            progressFormatter.handleStepResultEvent(event, callback);
            expect(progressFormatter.handleSkippedStepResult).not.toHaveBeenCalled();
          });

          it("checks whether the step was undefined", function () {
            progressFormatter.handleStepResultEvent(event, callback);
            expect(stepResult.isUndefined).toHaveBeenCalled();
          });

          describe("when the step was undefined", function () {
            beforeEach(function () {
              stepResult.isUndefined.andReturn(true);
              spyOn(progressFormatter, 'handleUndefinedStepResult');
            });

            it("handles the undefined step result", function () {
              progressFormatter.handleStepResultEvent(event, callback);
              expect(progressFormatter.handleUndefinedStepResult).toHaveBeenCalledWith(stepResult);
            });
          });

          describe("when the step was not undefined", function () {
            beforeEach(function () {
              stepResult.isUndefined.andReturn(false);
              spyOn(progressFormatter, 'handleUndefinedStepResult');
            });

            it("does not handle a skipped step result", function () {
              progressFormatter.handleStepResultEvent(event, callback);
              expect(progressFormatter.handleSkippedStepResult).not.toHaveBeenCalled();
            });

            it("handles a failed step result", function () {
              progressFormatter.handleStepResultEvent(event, callback);
              expect(progressFormatter.handleFailedStepResult).toHaveBeenCalledWith(stepResult);
            });
          });
        });
      });
    });

    it("calls back", function () {
      progressFormatter.handleStepResultEvent(event, callback);
      expect(callback).toHaveBeenCalled();
    });
  });

  describe("handleSuccessfulStepResult()", function () {
    beforeEach(function () {
      spyOn(progressFormatter, 'log');
    });

    it("logs the passing step character", function () {
      progressFormatter.handleSuccessfulStepResult();
      expect(progressFormatter.log).toHaveBeenCalledWith(Cucumber.Listener.ProgressFormatter.PASSED_STEP_CHARACTER);
    });
  });

  describe("handlePendingStepResult()", function () {
    beforeEach(function () {
      spyOn(progressFormatter, 'log')
    });

    it("logs the pending step character", function () {
      progressFormatter.handlePendingStepResult();
      expect(progressFormatter.log).toHaveBeenCalledWith(Cucumber.Listener.ProgressFormatter.PENDING_STEP_CHARACTER);
    });
  });

  describe("handleSkippedStepResult()", function () {
    beforeEach(function () {
      spyOn(progressFormatter, 'log');
    });

    it("logs the skipped step character", function () {
      progressFormatter.handleSkippedStepResult();
      expect(progressFormatter.log).toHaveBeenCalledWith(Cucumber.Listener.ProgressFormatter.SKIPPED_STEP_CHARACTER);
    });
  });

  describe("handleUndefinedStepResult()", function () {
    var stepResult, step;

    beforeEach(function () {
      step       = createSpy("step");
      stepResult = createSpyWithStubs("step result", {getStep: step});
      spyOn(progressFormatter, 'storeUndefinedStep');
      spyOn(progressFormatter, 'log');
    });

    it("gets the step from the step result", function () {
      progressFormatter.handleUndefinedStepResult(stepResult);
      expect(stepResult.getStep).toHaveBeenCalled();
    });

    it("stores the undefined step", function () {
      progressFormatter.handleUndefinedStepResult(stepResult);
      expect(progressFormatter.storeUndefinedStep).toHaveBeenCalledWith(step);
    });

    it("logs the undefined step character", function () {
      progressFormatter.handleUndefinedStepResult(stepResult);
      expect(progressFormatter.log).toHaveBeenCalledWith(Cucumber.Listener.ProgressFormatter.UNDEFINED_STEP_CHARACTER);
    });
  });

  describe("handleFailedStepResult()", function () {
    var stepResult;

    beforeEach(function () {
      stepResult = createSpy("failed step result");
      spyOn(progressFormatter, 'storeFailedStepResult');
      spyOn(progressFormatter, 'log');
    });

    it("stores the failed step result", function () {
      progressFormatter.handleFailedStepResult(stepResult);
      expect(progressFormatter.storeFailedStepResult).toHaveBeenCalledWith(stepResult);
    });

    it("logs the failed step character", function () {
      progressFormatter.handleFailedStepResult(stepResult);
      expect(progressFormatter.log).toHaveBeenCalledWith(Cucumber.Listener.ProgressFormatter.FAILED_STEP_CHARACTER);
    });
  });

  describe("handleAfterFeaturesEvent()", function () {
    var features, callback;

    beforeEach(function () {
      event    = createSpy("Event");
      callback = createSpy("Callback");
      spyOn(progressFormatter, "logSummary");
    });

    it("displays a summary", function () {
      progressFormatter.handleAfterFeaturesEvent(event, callback);
      expect(progressFormatter.logSummary).toHaveBeenCalled();
    });

    it("calls back", function () {
      progressFormatter.handleAfterFeaturesEvent(event, callback);
      expect(callback).toHaveBeenCalled();
    });
  });

  describe("handleAfterScenarioEvent()", function () {
    var event, callback;

    beforeEach(function () {
      event    = createSpy("event");
      callback = createSpy("callback");
      spyOnStub(statsJournal, 'isCurrentScenarioFailing');
    });

    it("checks whether the current scenario failed", function () {
      progressFormatter.handleAfterScenarioEvent(event, callback);
      expect(statsJournal.isCurrentScenarioFailing).toHaveBeenCalled();
    });

    describe("when the current scenario failed", function () {
      var scenario;

      beforeEach(function () {
        scenario = createSpy("scenario");
        statsJournal.isCurrentScenarioFailing.andReturn(true);
        spyOn(progressFormatter, 'storeFailedScenario');
        spyOnStub(event, 'getPayloadItem').andReturn(scenario);
      });

      it("gets the scenario from the payload", function () {
        progressFormatter.handleAfterScenarioEvent(event, callback);
        expect(event.getPayloadItem).toHaveBeenCalledWith('scenario');
      });

      it("stores the failed scenario", function () {
        progressFormatter.handleAfterScenarioEvent(event, callback);
        expect(progressFormatter.storeFailedScenario).toHaveBeenCalledWith(scenario);
      });
    });

    describe("when the current scenario did not fail", function () {
      beforeEach(function () {
        statsJournal.isCurrentScenarioFailing.andReturn(false);
        spyOn(progressFormatter, 'storeFailedScenario');
        spyOnStub(event, 'getPayloadItem');
      });

      it("does not get the scenario from the payload", function () {
        progressFormatter.handleAfterScenarioEvent(event, callback);
        expect(event.getPayloadItem).not.toHaveBeenCalled();
      });

      it("does not store the failed scenario", function () {
        progressFormatter.handleAfterScenarioEvent(event, callback);
        expect(progressFormatter.storeFailedScenario).not.toHaveBeenCalled();
      });
    });

    it("calls back", function () {
      progressFormatter.handleAfterScenarioEvent(event, callback);
      expect(callback).toHaveBeenCalled();
    });
  });

  describe("storeFailedStepResult()", function () {
    var failedStepResult;

    beforeEach(function () {
      failedStepResult = createSpy("failed step result");
      spyOnStub(failedStepResults, 'add');
    });

    it("adds the result to the failed step result collection", function () {
      progressFormatter.storeFailedStepResult(failedStepResult);
      expect(failedStepResults.add).toHaveBeenCalledWith(failedStepResult);
    });
  });

  describe("storeFailedScenario()", function () {
    var failedScenario, name, line;

    beforeEach(function () {
      name           = "some failed scenario";
      line           = "123";
      string         = ":" + line + " # Scenario: " + name;
      failedScenario = createSpyWithStubs("failedScenario", {getName: name, getLine: line});
      spyOn(progressFormatter, 'appendStringToFailedScenarioLogBuffer');
    });

    it("gets the name of the scenario", function () {
      progressFormatter.storeFailedScenario(failedScenario);
      expect(failedScenario.getName).toHaveBeenCalled();
    });

    it("gets the line of the scenario", function () {
      progressFormatter.storeFailedScenario(failedScenario);
      expect(failedScenario.getLine).toHaveBeenCalled();
    });

    it("appends the scenario details to the failed scenario log buffer", function () {
      progressFormatter.storeFailedScenario(failedScenario);
      expect(progressFormatter.appendStringToFailedScenarioLogBuffer).toHaveBeenCalledWith(string);
    });
  });

  describe("storeUndefinedStep()", function () {
    var snippetBuilder, snippet, step;

    beforeEach(function () {
      stpe           = createSpy("step");
      snippet        = createSpy("step definition snippet");
      snippetBuilder = createSpyWithStubs("snippet builder", {buildSnippet: snippet});
      spyOn(Cucumber.SupportCode, 'StepDefinitionSnippetBuilder').andReturn(snippetBuilder);
      spyOn(progressFormatter, 'appendStringToUndefinedStepLogBuffer');
    });

    it("creates a new step definition snippet builder", function () {
      progressFormatter.storeUndefinedStep(step);
      expect(Cucumber.SupportCode.StepDefinitionSnippetBuilder).toHaveBeenCalledWith(step);
    });

    it("builds the step definition", function () {
      progressFormatter.storeUndefinedStep(step);
      expect(snippetBuilder.buildSnippet).toHaveBeenCalled();
    });

    it("appends the snippet to the undefined step log buffer", function () {
      progressFormatter.storeUndefinedStep(step);
      expect(progressFormatter.appendStringToUndefinedStepLogBuffer).toHaveBeenCalledWith(snippet);
    });
  });

  describe("getFailedScenarioLogBuffer() [appendStringToFailedScenarioLogBuffer()]", function () {
    it("returns the logged failed scenario details", function () {
      progressFormatter.appendStringToFailedScenarioLogBuffer("abc");
      expect(progressFormatter.getFailedScenarioLogBuffer()).toBe("abc\n");
    });

    it("returns all logged failed scenario lines joined with a line break", function () {
      progressFormatter.appendStringToFailedScenarioLogBuffer("abc");
      progressFormatter.appendStringToFailedScenarioLogBuffer("def");
      expect(progressFormatter.getFailedScenarioLogBuffer()).toBe("abc\ndef\n");
    });
  });

  describe("getUndefinedStepLogBuffer() [appendStringToUndefinedStepLogBuffer()]", function () {
    it("returns the logged undefined step details", function () {
      progressFormatter.appendStringToUndefinedStepLogBuffer("abc");
      expect(progressFormatter.getUndefinedStepLogBuffer()).toBe("abc\n");
    });

    it("returns all logged failed scenario lines joined with a line break", function () {
      progressFormatter.appendStringToUndefinedStepLogBuffer("abc");
      progressFormatter.appendStringToUndefinedStepLogBuffer("def");
      expect(progressFormatter.getUndefinedStepLogBuffer()).toBe("abc\ndef\n");
    });
  });

  describe("appendStringToUndefinedStepLogBuffer() [getUndefinedStepLogBuffer()]", function () {
    it("does not log the same string twice", function () {
      progressFormatter.appendStringToUndefinedStepLogBuffer("abcdef");
      progressFormatter.appendStringToUndefinedStepLogBuffer("abcdef");
      expect(progressFormatter.getUndefinedStepLogBuffer()).toBe("abcdef\n");
    });
  });

  describe("logSummary()", function () {
    var scenarioCount, passedScenarioCount, failedScenarioCount;
    var stepCount, passedStepCount;

    beforeEach(function () {
      spyOn(progressFormatter, 'log');
      spyOn(progressFormatter, 'logScenariosSummary');
      spyOn(progressFormatter, 'logStepsSummary');
      spyOn(progressFormatter, 'logFailedStepResults');
      spyOn(progressFormatter, 'logUndefinedStepSnippets');
      spyOnStub(statsJournal, 'witnessedAnyFailedStep');
      spyOnStub(statsJournal, 'witnessedAnyUndefinedStep');
      spyOnStub(statsJournal, 'logFailedStepResults');
      spyOnStub(statsJournal, 'logScenariosSummary');
      spyOnStub(statsJournal, 'logStepsSummary');
      spyOnStub(statsJournal, 'logUndefinedStepSnippets');
    });

    it("logs two line feeds", function () {
      progressFormatter.logSummary();
      expect(progressFormatter.log).toHaveBeenCalledWith("\n\n");
    });

    it("checks whether there are failed steps or not", function () {
      progressFormatter.logSummary();
      expect(statsJournal.witnessedAnyFailedStep).toHaveBeenCalled();
    });

    describe("when there are failed steps", function () {
      beforeEach(function () {
        statsJournal.witnessedAnyFailedStep.andReturn(true);
      });

      it("logs the failed steps", function () {
        progressFormatter.logSummary();
        expect(progressFormatter.logFailedStepResults).toHaveBeenCalled();
      });
    });

    describe("when there are no failed steps", function () {
      beforeEach(function () {
        statsJournal.witnessedAnyFailedStep.andReturn(false);
      });

      it("does not log failed steps", function () {
        progressFormatter.logSummary();
        expect(progressFormatter.logFailedStepResults).not.toHaveBeenCalled();
      });
    });

    it("logs the scenarios summary", function () {
      progressFormatter.logSummary();
      expect(progressFormatter.logScenariosSummary).toHaveBeenCalled();
    });

    it("logs the steps summary", function () {
      progressFormatter.logSummary();
      expect(progressFormatter.logStepsSummary).toHaveBeenCalled();
    });

    it("checks whether there are undefined steps or not", function () {
      progressFormatter.logSummary();
      expect(statsJournal.witnessedAnyUndefinedStep).toHaveBeenCalled();
    });

    describe("when there are undefined steps", function () {
      beforeEach(function () {
        statsJournal.witnessedAnyUndefinedStep.andReturn(true);
      });

      it("logs the undefined step snippets", function () {
        progressFormatter.logSummary();
        expect(progressFormatter.logUndefinedStepSnippets).toHaveBeenCalled();
      });
    });

    describe("when there are no undefined steps", function () {
      beforeEach(function () {
        statsJournal.witnessedAnyUndefinedStep.andReturn(false);
      });

      it("does not log the undefined step snippets", function () {
        progressFormatter.logSummary();
        expect(progressFormatter.logUndefinedStepSnippets).not.toHaveBeenCalled();
      });
    });
  });

  describe("logFailedStepResults()", function () {
    var failedScenarioLogBuffer;

    beforeEach(function () {
      failedScenarioLogBuffer = createSpy("failed scenario log buffer");
      spyOnStub(failedStepResults, 'syncForEach');
      spyOn(progressFormatter, 'log');
      spyOn(progressFormatter, 'getFailedScenarioLogBuffer').andReturn(failedScenarioLogBuffer);
    });

    it("logs a failed steps header", function () {
      progressFormatter.logFailedStepResults();
      expect(progressFormatter.log).toHaveBeenCalledWith("(::) failed steps (::)\n\n");
    });

    it("iterates synchronously over the failed step results", function () {
      progressFormatter.logFailedStepResults();
      expect(failedStepResults.syncForEach).toHaveBeenCalled();
      expect(failedStepResults.syncForEach).toHaveBeenCalledWithAFunctionAsNthParameter(1);
    });

    describe("for each failed step result", function () {
      var userFunction, failedStep, forEachCallback;

      beforeEach(function () {
        progressFormatter.logFailedStepResults();
        userFunction     = failedStepResults.syncForEach.mostRecentCall.args[0];
        failedStepResult = createSpy("failed step result");
        spyOn(progressFormatter, 'logFailedStepResult');
      });

      it("tells the visitor to visit the feature and call back when finished", function () {
        userFunction(failedStepResult);
        expect(progressFormatter.logFailedStepResult).toHaveBeenCalledWith(failedStepResult);
      });
    });

    it("logs a failed scenarios header", function () {
      progressFormatter.logFailedStepResults();
      expect(progressFormatter.log).toHaveBeenCalledWith("Failing scenarios:\n");
    });

    it("gets the failed scenario details from its log buffer", function () {
      progressFormatter.logFailedStepResults();
      expect(progressFormatter.getFailedScenarioLogBuffer).toHaveBeenCalled();
    });

    it("logs the failed scenario details", function () {
      progressFormatter.logFailedStepResults();
      expect(progressFormatter.log).toHaveBeenCalledWith(failedScenarioLogBuffer);
    });

    it("logs a line break", function () {
      progressFormatter.logFailedStepResults();
      expect(progressFormatter.log).toHaveBeenCalledWith("\n");
    });
  });

  describe("logFailedStepResult()", function () {
    var stepResult, failureException;

    beforeEach(function () {
      spyOn(progressFormatter, 'log');
      failureException = createSpy('caught exception');
      stepResult       = createSpyWithStubs("failed step result", { getFailureException: failureException });
    });

    it("gets the failure exception from the step result", function () {
      progressFormatter.logFailedStepResult(stepResult);
      expect(stepResult.getFailureException).toHaveBeenCalled();
    });

    describe("when the failure exception has a stack", function () {
      beforeEach(function () {
        failureException.stack = createSpy('failure exception stack');
      });

      it("logs the stack", function () {
        progressFormatter.logFailedStepResult(stepResult);
        expect(progressFormatter.log).toHaveBeenCalledWith(failureException.stack);
      });
    });

    describe("when the failure exception has no stack", function () {
      it("logs the exception itself", function () {
        progressFormatter.logFailedStepResult(stepResult);
        expect(progressFormatter.log).toHaveBeenCalledWith(failureException);
      });
    });

    it("logs two line breaks", function () {
      progressFormatter.logFailedStepResult(stepResult);
      expect(progressFormatter.log).toHaveBeenCalledWith("\n\n");
    });
  });

  describe("logScenariosSummary()", function () {
    var scenarioCount, passedScenarioCount, pendingScenarioCount, failedScenarioCount;

    beforeEach(function () {
      scenarioCount          = 12;
      passedScenarioCount    = 9;
      undefinedScenarioCount = 17;
      pendingScenarioCount   = 7;
      failedScenarioCount    = 15;
      spyOn(progressFormatter, 'log');
      spyOnStub(statsJournal, 'getScenarioCount').andReturn(scenarioCount);
      spyOnStub(statsJournal, 'getPassedScenarioCount').andReturn(passedScenarioCount);
      spyOnStub(statsJournal, 'getUndefinedScenarioCount').andReturn(undefinedScenarioCount);
      spyOnStub(statsJournal, 'getPendingScenarioCount').andReturn(pendingScenarioCount);
      spyOnStub(statsJournal, 'getFailedScenarioCount').andReturn(failedScenarioCount);
    });

    it("gets the number of scenarios", function () {
      progressFormatter.logScenariosSummary();
      expect(statsJournal.getScenarioCount).toHaveBeenCalled();
    });

    describe("when there are no scenarios", function () {
      beforeEach(function () { statsJournal.getScenarioCount.andReturn(0); });

      it("logs 0 scenarios", function () {
        progressFormatter.logScenariosSummary();
        expect(progressFormatter.log).toHaveBeenCalledWithStringMatching(/0 scenarios/);
      });

      it("does not log any details", function () {
        progressFormatter.logScenariosSummary();
        expect(progressFormatter.log).not.toHaveBeenCalledWithStringMatching(/\(.*\)/);
      });
    });

    describe("when there are scenarios", function () {
      beforeEach(function () { statsJournal.getScenarioCount.andReturn(12); });

      describe("when there is one scenario", function () {
        beforeEach(function () { statsJournal.getScenarioCount.andReturn(1); });

        it("logs one scenario", function () {
          progressFormatter.logScenariosSummary();
          expect(progressFormatter.log).toHaveBeenCalledWithStringMatching(/1 scenario([^s]|$)/);
        });
      });

      describe("when there are 2 or more scenarios", function () {
        beforeEach(function () { statsJournal.getScenarioCount.andReturn(2); });

        it("logs two or more scenarios", function () {
          progressFormatter.logScenariosSummary();
          expect(progressFormatter.log).toHaveBeenCalledWithStringMatching(/2 scenarios/);
        });
      });

      it("gets the number of failed scenarios", function () {
        progressFormatter.logScenariosSummary();
        expect(statsJournal.getFailedScenarioCount).toHaveBeenCalled();
      });

      describe("when there are no failed scenarios", function () {
        beforeEach(function () { statsJournal.getFailedScenarioCount.andReturn(0); });

        it("does not log failed scenarios", function () {
          progressFormatter.logScenariosSummary();
          expect(progressFormatter.log).not.toHaveBeenCalledWithStringMatching(/failed/);
        });
      });

      describe("when there is one failed scenario", function () {
        beforeEach(function () { statsJournal.getFailedScenarioCount.andReturn(1); });

        it("logs a failed scenario", function () {
          progressFormatter.logScenariosSummary();
          expect(progressFormatter.log).toHaveBeenCalledWithStringMatching(/1 failed/);
        });
      });

      describe("when there are two or more failed scenarios", function () {
        beforeEach(function () { statsJournal.getFailedScenarioCount.andReturn(2); });

        it("logs the number of failed scenarios", function () {
          progressFormatter.logScenariosSummary();
          expect(progressFormatter.log).toHaveBeenCalledWithStringMatching(/2 failed/);
        });
      });

      it("gets the number of undefined scenarios", function () {
        progressFormatter.logScenariosSummary();
        expect(statsJournal.getUndefinedScenarioCount).toHaveBeenCalled();
      });

      describe("when there are no undefined scenarios", function () {
        beforeEach(function () { statsJournal.getUndefinedScenarioCount.andReturn(0); });

        it("does not log passed scenarios", function () {
          progressFormatter.logScenariosSummary();
          expect(progressFormatter.log).not.toHaveBeenCalledWithStringMatching(/undefined/);
        });
      });

      describe("when there is one undefined scenario", function () {
        beforeEach(function () { statsJournal.getUndefinedScenarioCount.andReturn(1); });

        it("logs one undefined scenario", function () {
          progressFormatter.logScenariosSummary();
          expect(progressFormatter.log).toHaveBeenCalledWithStringMatching(/1 undefined/);
        });
      });

      describe("when there are two or more undefined scenarios", function () {
        beforeEach(function () { statsJournal.getUndefinedScenarioCount.andReturn(2); });

        it("logs the undefined scenarios", function () {
          progressFormatter.logScenariosSummary();
          expect(progressFormatter.log).toHaveBeenCalledWithStringMatching(/2 undefined/);
        });
      });

      it("gets the number of pending scenarios", function () {
        progressFormatter.logScenariosSummary();
        expect(statsJournal.getPendingScenarioCount).toHaveBeenCalled();
      });

      describe("when there are no pending scenarios", function () {
        beforeEach(function () { statsJournal.getPendingScenarioCount.andReturn(0); });

        it("does not log passed scenarios", function () {
          progressFormatter.logScenariosSummary();
          expect(progressFormatter.log).not.toHaveBeenCalledWithStringMatching(/pending/);
        });
      });

      describe("when there is one pending scenario", function () {
        beforeEach(function () { statsJournal.getPendingScenarioCount.andReturn(1); });

        it("logs one pending scenario", function () {
          progressFormatter.logScenariosSummary();
          expect(progressFormatter.log).toHaveBeenCalledWithStringMatching(/1 pending/);
        });
      });

      describe("when there are two or more pending scenarios", function () {
        beforeEach(function () { statsJournal.getPendingScenarioCount.andReturn(2); });

        it("logs the pending scenarios", function () {
          progressFormatter.logScenariosSummary();
          expect(progressFormatter.log).toHaveBeenCalledWithStringMatching(/2 pending/);
        });
      });

      it("gets the number of passed scenarios", function () {
        progressFormatter.logScenariosSummary();
        expect(statsJournal.getPassedScenarioCount).toHaveBeenCalled();
      });

      describe("when there are no passed scenarios", function () {
        beforeEach(function () { statsJournal.getPassedScenarioCount.andReturn(0); });

        it("does not log passed scenarios", function () {
          progressFormatter.logScenariosSummary();
          expect(progressFormatter.log).not.toHaveBeenCalledWithStringMatching(/passed/);
        });
      });

      describe("when there is one passed scenario", function () {
        beforeEach(function () { statsJournal.getPassedScenarioCount.andReturn(1); });

        it("logs 1 passed scenarios", function () {
          progressFormatter.logScenariosSummary();
          expect(progressFormatter.log).toHaveBeenCalledWithStringMatching(/1 passed/);
        });
      });

      describe("when there are two or more passed scenarios", function () {
        beforeEach(function () { statsJournal.getPassedScenarioCount.andReturn(2); });

        it("logs the number of passed scenarios", function () {
          progressFormatter.logScenariosSummary();
          expect(progressFormatter.log).toHaveBeenCalledWithStringMatching(/2 passed/);
        });
      });
    });
  });

  describe("logStepsSummary()", function () {
    var stepCount, passedStepCount, failedStepCount, skippedStepCount, pendingStepCount;

    beforeEach(function () {
      stepCount          = 34;
      passedStepCount    = 31;
      failedStepCount    = 7;
      skippedStepCount   = 5;
      undefinedStepCount = 4;
      pendingStepCount   = 2;
      spyOn(progressFormatter, 'log');
      spyOnStub(statsJournal, 'getStepCount').andReturn(stepCount);
      spyOnStub(statsJournal, 'getPassedStepCount').andReturn(passedStepCount);
      spyOnStub(statsJournal, 'getFailedStepCount').andReturn(failedStepCount);
      spyOnStub(statsJournal, 'getSkippedStepCount').andReturn(skippedStepCount);
      spyOnStub(statsJournal, 'getUndefinedStepCount').andReturn(undefinedStepCount);
      spyOnStub(statsJournal, 'getPendingStepCount').andReturn(pendingStepCount);
    });

    it("gets the number of steps", function () {
      progressFormatter.logStepsSummary();
      expect(statsJournal.getStepCount).toHaveBeenCalled();
    });

    describe("when there are no steps", function () {
      beforeEach(function () {
        statsJournal.getStepCount.andReturn(0);
      });

      it("logs 0 steps", function () {
        progressFormatter.logStepsSummary();
        expect(progressFormatter.log).toHaveBeenCalledWithStringMatching(/0 steps/);
      });

      it("does not log any details", function () {
        progressFormatter.logStepsSummary();
        expect(progressFormatter.log).not.toHaveBeenCalledWithStringMatching(/\(.*\)/);
      });
    });

    describe("when there are steps", function () {
      beforeEach(function () { statsJournal.getStepCount.andReturn(13); });

      describe("when there is one step", function () {
        beforeEach(function () {
          statsJournal.getStepCount.andReturn(1);
        });

        it("logs 1 step", function () {
          progressFormatter.logStepsSummary();
          expect(progressFormatter.log).toHaveBeenCalledWithStringMatching(/1 step/);
        });
      });

      describe("when there are two or more steps", function () {
        beforeEach(function () {
          statsJournal.getStepCount.andReturn(2);
        });

        it("logs the number of steps", function () {
          progressFormatter.logStepsSummary();
          expect(progressFormatter.log).toHaveBeenCalledWithStringMatching(/2 steps/);
        });
      });

      it("gets the number of failed steps", function () {
        progressFormatter.logStepsSummary();
        expect(statsJournal.getFailedStepCount).toHaveBeenCalled();
      });

      describe("when there are no failed steps", function () {
        beforeEach(function () {
          statsJournal.getFailedStepCount.andReturn(0);
        });

        it("does not log failed steps", function () {
          progressFormatter.logStepsSummary();
          expect(progressFormatter.log).not.toHaveBeenCalledWithStringMatching(/failed/);
        });
      });

      describe("when there is one failed step", function () {
        beforeEach(function () {
          statsJournal.getFailedStepCount.andReturn(1);
        });

        it("logs one failed step", function () {
          progressFormatter.logStepsSummary();
          expect(progressFormatter.log).toHaveBeenCalledWithStringMatching(/1 failed/);
        });
      });

      describe("when there is two or more failed steps", function () {
        beforeEach(function () {
          statsJournal.getFailedStepCount.andReturn(2);
        });

        it("logs the number of failed steps", function () {
          progressFormatter.logStepsSummary();
          expect(progressFormatter.log).toHaveBeenCalledWithStringMatching(/2 failed/);
        });
      });

      it("gets the number of undefined steps", function () {
        progressFormatter.logStepsSummary();
        expect(statsJournal.getUndefinedStepCount).toHaveBeenCalled();
      });

      describe("when there are no undefined steps", function () {
        beforeEach(function () {
          statsJournal.getUndefinedStepCount.andReturn(0);
        });

        it("does not log undefined steps", function () {
          progressFormatter.logStepsSummary();
          expect(progressFormatter.log).not.toHaveBeenCalledWithStringMatching(/undefined/);
        });
      });

      describe("when there is one undefined step", function () {
        beforeEach(function () {
          statsJournal.getUndefinedStepCount.andReturn(1);
        });

        it("logs one undefined steps", function () {
          progressFormatter.logStepsSummary();
          expect(progressFormatter.log).toHaveBeenCalledWithStringMatching(/1 undefined/);
        });
      });

      describe("when there are two or more undefined steps", function () {
        beforeEach(function () {
          statsJournal.getUndefinedStepCount.andReturn(2);
        });

        it("logs the number of undefined steps", function () {
          progressFormatter.logStepsSummary();
          expect(progressFormatter.log).toHaveBeenCalledWithStringMatching(/2 undefined/);
        });
      });

      it("gets the number of pending steps", function () {
        progressFormatter.logStepsSummary();
        expect(statsJournal.getPendingStepCount).toHaveBeenCalled();
      });

      describe("when there are no pending steps", function () {
        beforeEach(function () {
          statsJournal.getPendingStepCount.andReturn(0);
        });

        it("does not log pending steps", function () {
          progressFormatter.logStepsSummary();
          expect(progressFormatter.log).not.toHaveBeenCalledWithStringMatching(/pending/);
        });
      });

      describe("when there is one pending step", function () {
        beforeEach(function () {
          statsJournal.getPendingStepCount.andReturn(1);
        });

        it("logs one pending steps", function () {
          progressFormatter.logStepsSummary();
          expect(progressFormatter.log).toHaveBeenCalledWithStringMatching(/1 pending/);
        });
      });

      describe("when there are two or more pending steps", function () {
        beforeEach(function () {
          statsJournal.getPendingStepCount.andReturn(2);
        });

        it("logs the number of pending steps", function () {
          progressFormatter.logStepsSummary();
          expect(progressFormatter.log).toHaveBeenCalledWithStringMatching(/2 pending/);
        });
      });

      it("gets the number of skipped steps", function () {
        progressFormatter.logStepsSummary();
        expect(statsJournal.getSkippedStepCount).toHaveBeenCalled();
      });

      describe("when there are no skipped steps", function () {
        beforeEach(function () {
          statsJournal.getSkippedStepCount.andReturn(0);
        });

        it("does not log skipped steps", function () {
          progressFormatter.logStepsSummary();
          expect(progressFormatter.log).not.toHaveBeenCalledWithStringMatching(/skipped/);
        });
      });

      describe("when there is one skipped step", function () {
        beforeEach(function () {
          statsJournal.getSkippedStepCount.andReturn(1);
        });

        it("logs one skipped steps", function () {
          progressFormatter.logStepsSummary();
          expect(progressFormatter.log).toHaveBeenCalledWithStringMatching(/1 skipped/);
        });
      });

      describe("when there are two or more skipped steps", function () {
        beforeEach(function () {
          statsJournal.getSkippedStepCount.andReturn(2);
        });

        it("logs the number of skipped steps", function () {
          progressFormatter.logStepsSummary();
          expect(progressFormatter.log).toHaveBeenCalledWithStringMatching(/2 skipped/);
        });
      });

      it("gets the number of passed steps", function () {
        progressFormatter.logStepsSummary();
        expect(statsJournal.getPassedStepCount).toHaveBeenCalled();
      });

      describe("when there are no passed steps", function () {
        beforeEach(function () {
          statsJournal.getPassedStepCount.andReturn(0);
        });

        it("does not log passed steps", function () {
          progressFormatter.logStepsSummary();
          expect(progressFormatter.log).not.toHaveBeenCalledWithStringMatching(/passed/);
        });
      });

      describe("when there is one passed step", function () {
        beforeEach(function () {
          statsJournal.getPassedStepCount.andReturn(1);
        });

        it("logs one passed step", function () {
          progressFormatter.logStepsSummary();
          expect(progressFormatter.log).toHaveBeenCalledWithStringMatching(/1 passed/);
        });
      });

      describe("when there is two or more passed steps", function () {
        beforeEach(function () {
          statsJournal.getPassedStepCount.andReturn(2);
        });

        it("logs the number of passed steps", function () {
          progressFormatter.logStepsSummary();
          expect(progressFormatter.log).toHaveBeenCalledWithStringMatching(/2 passed/);
        });
      });
    });
  });

  describe("logUndefinedStepSnippets()", function () {
    var undefinedStepLogBuffer;

    beforeEach(function () {
      undefinedStepLogBuffer = createSpy("undefined step log buffer");
      spyOn(progressFormatter, 'log');
      spyOn(progressFormatter, 'getUndefinedStepLogBuffer').andReturn(undefinedStepLogBuffer);
    });

    it("logs a little explanation about the snippets", function () {
      progressFormatter.logUndefinedStepSnippets();
      expect(progressFormatter.log).toHaveBeenCalledWith("\nYou can implement step definitions for undefined steps with these snippets:\n\n");
    });

    it("gets the undefined steps log buffer", function () {
      progressFormatter.logUndefinedStepSnippets();
      expect(progressFormatter.getUndefinedStepLogBuffer).toHaveBeenCalled();
    });

    it("logs the undefined steps", function () {
      progressFormatter.logUndefinedStepSnippets();
      expect(progressFormatter.log).toHaveBeenCalledWith(undefinedStepLogBuffer);
    });
  });
});
