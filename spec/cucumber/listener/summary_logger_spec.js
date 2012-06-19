require('../../support/spec_helper');

describe("Cucumber.Listener.SummaryLogger", function () {
  var Cucumber = requireLib('cucumber');
  var listener, listenerHearMethod, summaryLogger, statsJournal, failedStepResults;

  beforeEach(function () {
    var SummaryLogger = Cucumber.Listener.SummaryLogger;
    listener           = createSpyWithStubs("listener");
    listenerHearMethod = spyOnStub(listener, 'hear');
    statsJournal       = createSpy("stats journal");
    failedStepResults  = createSpy("failed steps");
    spyOn(Cucumber.Type, 'Collection').andReturn(failedStepResults);
    spyOn(Cucumber, 'Listener').andReturn(listener);
    spyOnStub(Cucumber.Listener, 'StatsJournal').andReturn(statsJournal);
    Cucumber.Listener.SummaryLogger = SummaryLogger;
    summaryLogger = Cucumber.Listener.SummaryLogger();
  });

  describe("constructor", function () {
    it("creates a listener", function() {
      expect(Cucumber.Listener).toHaveBeenCalled();
    });

    it("extends the listener", function () {
      expect(summaryLogger).toBe(listener);
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
      summaryLogger.log(logged);
      summaryLogger.log(alsoLogged);
      expect(summaryLogger.getLogs()).toBe(loggedBuffer);
    });
  });

  describe("getLogs()", function () {
    it("returns the logged buffer", function () {
      var logged       = "this was logged";
      var alsoLogged   = "this was also logged";
      var loggedBuffer = logged + alsoLogged;
      spyOn(process.stdout, 'write'); // prevent actual output during spec execution
      summaryLogger.log(logged);
      summaryLogger.log(alsoLogged);
      expect(summaryLogger.getLogs()).toBe(loggedBuffer);
    });

    it("returns an empty string when the progress formatter did not log anything yet", function () {
      expect(summaryLogger.getLogs()).toBe("");
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
      summaryLogger.hear(event, callback);
      expect(statsJournal.hear).toHaveBeenCalled();
      expect(statsJournal.hear).toHaveBeenCalledWithValueAsNthParameter(event, 1);
      expect(statsJournal.hear).toHaveBeenCalledWithAFunctionAsNthParameter(2);
    });

    describe("stats journal callback", function () {
      var statsJournalCallback;

      beforeEach(function () {
        summaryLogger.hear(event, callback);
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
        isUndefined:  undefined,
        isFailed:     undefined
      });
      event      = createSpyWithStubs("event", {getPayloadItem: stepResult});
      callback   = createSpy("Callback");
      spyOn(summaryLogger, 'handleFailedStepResult');
    });

    it("gets the step result from the event payload", function () {
      summaryLogger.handleStepResultEvent(event, callback);
      expect(event.getPayloadItem).toHaveBeenCalledWith('stepResult');
    });

    it("checks whether the step was undefined", function () {
      summaryLogger.handleStepResultEvent(event, callback);
      expect(stepResult.isUndefined).toHaveBeenCalled();
    });

    describe("when the step was undefined", function () {
      beforeEach(function () {
        stepResult.isUndefined.andReturn(true);
        spyOn(summaryLogger, 'handleUndefinedStepResult');
      });

      it("handles the undefined step result", function () {
        summaryLogger.handleStepResultEvent(event, callback);
        expect(summaryLogger.handleUndefinedStepResult).toHaveBeenCalledWith(stepResult);
      });
    });

    describe("when the step was not undefined", function () {
      beforeEach(function () {
        stepResult.isUndefined.andReturn(false);
        spyOn(summaryLogger, 'handleUndefinedStepResult');
      });

      it("does not handle an undefined step result", function () {
        summaryLogger.handleStepResultEvent(event, callback);
        expect(summaryLogger.handleUndefinedStepResult).not.toHaveBeenCalled();
      });

      it("checks whether the step failed", function () {
        summaryLogger.handleStepResultEvent(event, callback);
        expect(stepResult.isFailed).toHaveBeenCalled();
      });

      describe("when the step failed", function () {
        beforeEach(function () {
          stepResult.isFailed.andReturn(true);
        });

        it("handles the failed step result", function () {
          summaryLogger.handleStepResultEvent(event, callback);
          expect(summaryLogger.handleFailedStepResult).toHaveBeenCalledWith(stepResult);
        });
      });

      describe("when the step did not fail", function () {
        beforeEach(function () {
          stepResult.isFailed.andReturn(false);
        });

        it("handles the failed step result", function () {
          summaryLogger.handleStepResultEvent(event, callback);
          expect(summaryLogger.handleFailedStepResult).not.toHaveBeenCalled();
        });
      });
    });

    it("calls back", function () {
      summaryLogger.handleStepResultEvent(event, callback);
      expect(callback).toHaveBeenCalled();
    });
  });

  describe("handleUndefinedStepResult()", function () {
    var stepResult, step;

    beforeEach(function () {
      step       = createSpy("step");
      stepResult = createSpyWithStubs("step result", {getStep: step});
      spyOn(summaryLogger, 'storeUndefinedStep');
    });

    it("gets the step from the step result", function () {
      summaryLogger.handleUndefinedStepResult(stepResult);
      expect(stepResult.getStep).toHaveBeenCalled();
    });

    it("stores the undefined step", function () {
      summaryLogger.handleUndefinedStepResult(stepResult);
      expect(summaryLogger.storeUndefinedStep).toHaveBeenCalledWith(step);
    });
  });

  describe("handleFailedStepResult()", function () {
    var stepResult;

    beforeEach(function () {
      stepResult = createSpy("failed step result");
      spyOn(summaryLogger, 'storeFailedStepResult');
    });

    it("stores the failed step result", function () {
      summaryLogger.handleFailedStepResult(stepResult);
      expect(summaryLogger.storeFailedStepResult).toHaveBeenCalledWith(stepResult);
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
      summaryLogger.handleAfterScenarioEvent(event, callback);
      expect(statsJournal.isCurrentScenarioFailing).toHaveBeenCalled();
    });

    describe("when the current scenario failed", function () {
      var scenario;

      beforeEach(function () {
        scenario = createSpy("scenario");
        statsJournal.isCurrentScenarioFailing.andReturn(true);
        spyOn(summaryLogger, 'storeFailedScenario');
        spyOnStub(event, 'getPayloadItem').andReturn(scenario);
      });

      it("gets the scenario from the payload", function () {
        summaryLogger.handleAfterScenarioEvent(event, callback);
        expect(event.getPayloadItem).toHaveBeenCalledWith('scenario');
      });

      it("stores the failed scenario", function () {
        summaryLogger.handleAfterScenarioEvent(event, callback);
        expect(summaryLogger.storeFailedScenario).toHaveBeenCalledWith(scenario);
      });
    });

    describe("when the current scenario did not fail", function () {
      beforeEach(function () {
        statsJournal.isCurrentScenarioFailing.andReturn(false);
        spyOn(summaryLogger, 'storeFailedScenario');
        spyOnStub(event, 'getPayloadItem');
      });

      it("does not get the scenario from the payload", function () {
        summaryLogger.handleAfterScenarioEvent(event, callback);
        expect(event.getPayloadItem).not.toHaveBeenCalled();
      });

      it("does not store the failed scenario", function () {
        summaryLogger.handleAfterScenarioEvent(event, callback);
        expect(summaryLogger.storeFailedScenario).not.toHaveBeenCalled();
      });
    });

    it("calls back", function () {
      summaryLogger.handleAfterScenarioEvent(event, callback);
      expect(callback).toHaveBeenCalled();
    });
  });

  describe("handleAfterFeaturesEvent()", function () {
    var callback;

    beforeEach(function () {
      callback = createSpy("callback");
      spyOn(summaryLogger, 'logSummary');
    });

    it("logs the summary", function () {
      summaryLogger.handleAfterFeaturesEvent(event, callback);
      expect(summaryLogger.logSummary).toHaveBeenCalled();
    });

    it("calls back", function () {
      summaryLogger.handleAfterFeaturesEvent(event, callback);
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
      summaryLogger.storeFailedStepResult(failedStepResult);
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
      spyOn(summaryLogger, 'appendStringToFailedScenarioLogBuffer');
    });

    it("gets the name of the scenario", function () {
      summaryLogger.storeFailedScenario(failedScenario);
      expect(failedScenario.getName).toHaveBeenCalled();
    });

    it("gets the line of the scenario", function () {
      summaryLogger.storeFailedScenario(failedScenario);
      expect(failedScenario.getLine).toHaveBeenCalled();
    });

    it("appends the scenario details to the failed scenario log buffer", function () {
      summaryLogger.storeFailedScenario(failedScenario);
      expect(summaryLogger.appendStringToFailedScenarioLogBuffer).toHaveBeenCalledWith(string);
    });
  });

  describe("storeUndefinedStep()", function () {
    var snippetBuilder, snippet, step;

    beforeEach(function () {
      stpe           = createSpy("step");
      snippet        = createSpy("step definition snippet");
      snippetBuilder = createSpyWithStubs("snippet builder", {buildSnippet: snippet});
      spyOn(Cucumber.SupportCode, 'StepDefinitionSnippetBuilder').andReturn(snippetBuilder);
      spyOn(summaryLogger, 'appendStringToUndefinedStepLogBuffer');
    });

    it("creates a new step definition snippet builder", function () {
      summaryLogger.storeUndefinedStep(step);
      expect(Cucumber.SupportCode.StepDefinitionSnippetBuilder).toHaveBeenCalledWith(step);
    });

    it("builds the step definition", function () {
      summaryLogger.storeUndefinedStep(step);
      expect(snippetBuilder.buildSnippet).toHaveBeenCalled();
    });

    it("appends the snippet to the undefined step log buffer", function () {
      summaryLogger.storeUndefinedStep(step);
      expect(summaryLogger.appendStringToUndefinedStepLogBuffer).toHaveBeenCalledWith(snippet);
    });
  });

  describe("getFailedScenarioLogBuffer() [appendStringToFailedScenarioLogBuffer()]", function () {
    it("returns the logged failed scenario details", function () {
      summaryLogger.appendStringToFailedScenarioLogBuffer("abc");
      expect(summaryLogger.getFailedScenarioLogBuffer()).toBe("abc\n");
    });

    it("returns all logged failed scenario lines joined with a line break", function () {
      summaryLogger.appendStringToFailedScenarioLogBuffer("abc");
      summaryLogger.appendStringToFailedScenarioLogBuffer("def");
      expect(summaryLogger.getFailedScenarioLogBuffer()).toBe("abc\ndef\n");
    });
  });

  describe("getUndefinedStepLogBuffer() [appendStringToUndefinedStepLogBuffer()]", function () {
    it("returns the logged undefined step details", function () {
      summaryLogger.appendStringToUndefinedStepLogBuffer("abc");
      expect(summaryLogger.getUndefinedStepLogBuffer()).toBe("abc\n");
    });

    it("returns all logged failed scenario lines joined with a line break", function () {
      summaryLogger.appendStringToUndefinedStepLogBuffer("abc");
      summaryLogger.appendStringToUndefinedStepLogBuffer("def");
      expect(summaryLogger.getUndefinedStepLogBuffer()).toBe("abc\ndef\n");
    });
  });

  describe("appendStringToUndefinedStepLogBuffer() [getUndefinedStepLogBuffer()]", function () {
    it("does not log the same string twice", function () {
      summaryLogger.appendStringToUndefinedStepLogBuffer("abcdef");
      summaryLogger.appendStringToUndefinedStepLogBuffer("abcdef");
      expect(summaryLogger.getUndefinedStepLogBuffer()).toBe("abcdef\n");
    });
  });

  describe("logSummary()", function () {
    var scenarioCount, passedScenarioCount, failedScenarioCount;
    var stepCount, passedStepCount;

    beforeEach(function () {
      spyOn(summaryLogger, 'log');
      spyOn(summaryLogger, 'logScenariosSummary');
      spyOn(summaryLogger, 'logStepsSummary');
      spyOn(summaryLogger, 'logFailedStepResults');
      spyOn(summaryLogger, 'logUndefinedStepSnippets');
      spyOnStub(statsJournal, 'witnessedAnyFailedStep');
      spyOnStub(statsJournal, 'witnessedAnyUndefinedStep');
      spyOnStub(statsJournal, 'logFailedStepResults');
      spyOnStub(statsJournal, 'logScenariosSummary');
      spyOnStub(statsJournal, 'logStepsSummary');
      spyOnStub(statsJournal, 'logUndefinedStepSnippets');
    });

    it("logs two line feeds", function () {
      summaryLogger.logSummary();
      expect(summaryLogger.log).toHaveBeenCalledWith("\n\n");
    });

    it("checks whether there are failed steps or not", function () {
      summaryLogger.logSummary();
      expect(statsJournal.witnessedAnyFailedStep).toHaveBeenCalled();
    });

    describe("when there are failed steps", function () {
      beforeEach(function () {
        statsJournal.witnessedAnyFailedStep.andReturn(true);
      });

      it("logs the failed steps", function () {
        summaryLogger.logSummary();
        expect(summaryLogger.logFailedStepResults).toHaveBeenCalled();
      });
    });

    describe("when there are no failed steps", function () {
      beforeEach(function () {
        statsJournal.witnessedAnyFailedStep.andReturn(false);
      });

      it("does not log failed steps", function () {
        summaryLogger.logSummary();
        expect(summaryLogger.logFailedStepResults).not.toHaveBeenCalled();
      });
    });

    it("logs the scenarios summary", function () {
      summaryLogger.logSummary();
      expect(summaryLogger.logScenariosSummary).toHaveBeenCalled();
    });

    it("logs the steps summary", function () {
      summaryLogger.logSummary();
      expect(summaryLogger.logStepsSummary).toHaveBeenCalled();
    });

    it("checks whether there are undefined steps or not", function () {
      summaryLogger.logSummary();
      expect(statsJournal.witnessedAnyUndefinedStep).toHaveBeenCalled();
    });

    describe("when there are undefined steps", function () {
      beforeEach(function () {
        statsJournal.witnessedAnyUndefinedStep.andReturn(true);
      });

      it("logs the undefined step snippets", function () {
        summaryLogger.logSummary();
        expect(summaryLogger.logUndefinedStepSnippets).toHaveBeenCalled();
      });
    });

    describe("when there are no undefined steps", function () {
      beforeEach(function () {
        statsJournal.witnessedAnyUndefinedStep.andReturn(false);
      });

      it("does not log the undefined step snippets", function () {
        summaryLogger.logSummary();
        expect(summaryLogger.logUndefinedStepSnippets).not.toHaveBeenCalled();
      });
    });
  });

  describe("logFailedStepResults()", function () {
    var failedScenarioLogBuffer;

    beforeEach(function () {
      failedScenarioLogBuffer = createSpy("failed scenario log buffer");
      spyOnStub(failedStepResults, 'syncForEach');
      spyOn(summaryLogger, 'log');
      spyOn(summaryLogger, 'getFailedScenarioLogBuffer').andReturn(failedScenarioLogBuffer);
    });

    it("logs a failed steps header", function () {
      summaryLogger.logFailedStepResults();
      expect(summaryLogger.log).toHaveBeenCalledWith("(::) failed steps (::)\n\n");
    });

    it("iterates synchronously over the failed step results", function () {
      summaryLogger.logFailedStepResults();
      expect(failedStepResults.syncForEach).toHaveBeenCalled();
      expect(failedStepResults.syncForEach).toHaveBeenCalledWithAFunctionAsNthParameter(1);
    });

    describe("for each failed step result", function () {
      var userFunction, failedStep, forEachCallback;

      beforeEach(function () {
        summaryLogger.logFailedStepResults();
        userFunction     = failedStepResults.syncForEach.mostRecentCall.args[0];
        failedStepResult = createSpy("failed step result");
        spyOn(summaryLogger, 'logFailedStepResult');
      });

      it("tells the visitor to visit the feature and call back when finished", function () {
        userFunction(failedStepResult);
        expect(summaryLogger.logFailedStepResult).toHaveBeenCalledWith(failedStepResult);
      });
    });

    it("logs a failed scenarios header", function () {
      summaryLogger.logFailedStepResults();
      expect(summaryLogger.log).toHaveBeenCalledWith("Failing scenarios:\n");
    });

    it("gets the failed scenario details from its log buffer", function () {
      summaryLogger.logFailedStepResults();
      expect(summaryLogger.getFailedScenarioLogBuffer).toHaveBeenCalled();
    });

    it("logs the failed scenario details", function () {
      summaryLogger.logFailedStepResults();
      expect(summaryLogger.log).toHaveBeenCalledWith(failedScenarioLogBuffer);
    });

    it("logs a line break", function () {
      summaryLogger.logFailedStepResults();
      expect(summaryLogger.log).toHaveBeenCalledWith("\n");
    });
  });

  describe("logFailedStepResult()", function () {
    var stepResult, failureException;

    beforeEach(function () {
      spyOn(summaryLogger, 'log');
      failureException = createSpy('caught exception');
      stepResult       = createSpyWithStubs("failed step result", { getFailureException: failureException });
    });

    it("gets the failure exception from the step result", function () {
      summaryLogger.logFailedStepResult(stepResult);
      expect(stepResult.getFailureException).toHaveBeenCalled();
    });

    describe("when the failure exception has a stack", function () {
      beforeEach(function () {
        failureException.stack = createSpy('failure exception stack');
      });

      it("logs the stack", function () {
        summaryLogger.logFailedStepResult(stepResult);
        expect(summaryLogger.log).toHaveBeenCalledWith(failureException.stack);
      });
    });

    describe("when the failure exception has no stack", function () {
      it("logs the exception itself", function () {
        summaryLogger.logFailedStepResult(stepResult);
        expect(summaryLogger.log).toHaveBeenCalledWith(failureException);
      });
    });

    it("logs two line breaks", function () {
      summaryLogger.logFailedStepResult(stepResult);
      expect(summaryLogger.log).toHaveBeenCalledWith("\n\n");
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
      spyOn(summaryLogger, 'log');
      spyOnStub(statsJournal, 'getScenarioCount').andReturn(scenarioCount);
      spyOnStub(statsJournal, 'getPassedScenarioCount').andReturn(passedScenarioCount);
      spyOnStub(statsJournal, 'getUndefinedScenarioCount').andReturn(undefinedScenarioCount);
      spyOnStub(statsJournal, 'getPendingScenarioCount').andReturn(pendingScenarioCount);
      spyOnStub(statsJournal, 'getFailedScenarioCount').andReturn(failedScenarioCount);
    });

    it("gets the number of scenarios", function () {
      summaryLogger.logScenariosSummary();
      expect(statsJournal.getScenarioCount).toHaveBeenCalled();
    });

    describe("when there are no scenarios", function () {
      beforeEach(function () { statsJournal.getScenarioCount.andReturn(0); });

      it("logs 0 scenarios", function () {
        summaryLogger.logScenariosSummary();
        expect(summaryLogger.log).toHaveBeenCalledWithStringMatching(/0 scenarios/);
      });

      it("does not log any details", function () {
        summaryLogger.logScenariosSummary();
        expect(summaryLogger.log).not.toHaveBeenCalledWithStringMatching(/\(.*\)/);
      });
    });

    describe("when there are scenarios", function () {
      beforeEach(function () { statsJournal.getScenarioCount.andReturn(12); });

      describe("when there is one scenario", function () {
        beforeEach(function () { statsJournal.getScenarioCount.andReturn(1); });

        it("logs one scenario", function () {
          summaryLogger.logScenariosSummary();
          expect(summaryLogger.log).toHaveBeenCalledWithStringMatching(/1 scenario([^s]|$)/);
        });
      });

      describe("when there are 2 or more scenarios", function () {
        beforeEach(function () { statsJournal.getScenarioCount.andReturn(2); });

        it("logs two or more scenarios", function () {
          summaryLogger.logScenariosSummary();
          expect(summaryLogger.log).toHaveBeenCalledWithStringMatching(/2 scenarios/);
        });
      });

      it("gets the number of failed scenarios", function () {
        summaryLogger.logScenariosSummary();
        expect(statsJournal.getFailedScenarioCount).toHaveBeenCalled();
      });

      describe("when there are no failed scenarios", function () {
        beforeEach(function () { statsJournal.getFailedScenarioCount.andReturn(0); });

        it("does not log failed scenarios", function () {
          summaryLogger.logScenariosSummary();
          expect(summaryLogger.log).not.toHaveBeenCalledWithStringMatching(/failed/);
        });
      });

      describe("when there is one failed scenario", function () {
        beforeEach(function () { statsJournal.getFailedScenarioCount.andReturn(1); });

        it("logs a failed scenario", function () {
          summaryLogger.logScenariosSummary();
          expect(summaryLogger.log).toHaveBeenCalledWithStringMatching(/1 failed/);
        });
      });

      describe("when there are two or more failed scenarios", function () {
        beforeEach(function () { statsJournal.getFailedScenarioCount.andReturn(2); });

        it("logs the number of failed scenarios", function () {
          summaryLogger.logScenariosSummary();
          expect(summaryLogger.log).toHaveBeenCalledWithStringMatching(/2 failed/);
        });
      });

      it("gets the number of undefined scenarios", function () {
        summaryLogger.logScenariosSummary();
        expect(statsJournal.getUndefinedScenarioCount).toHaveBeenCalled();
      });

      describe("when there are no undefined scenarios", function () {
        beforeEach(function () { statsJournal.getUndefinedScenarioCount.andReturn(0); });

        it("does not log passed scenarios", function () {
          summaryLogger.logScenariosSummary();
          expect(summaryLogger.log).not.toHaveBeenCalledWithStringMatching(/undefined/);
        });
      });

      describe("when there is one undefined scenario", function () {
        beforeEach(function () { statsJournal.getUndefinedScenarioCount.andReturn(1); });

        it("logs one undefined scenario", function () {
          summaryLogger.logScenariosSummary();
          expect(summaryLogger.log).toHaveBeenCalledWithStringMatching(/1 undefined/);
        });
      });

      describe("when there are two or more undefined scenarios", function () {
        beforeEach(function () { statsJournal.getUndefinedScenarioCount.andReturn(2); });

        it("logs the undefined scenarios", function () {
          summaryLogger.logScenariosSummary();
          expect(summaryLogger.log).toHaveBeenCalledWithStringMatching(/2 undefined/);
        });
      });

      it("gets the number of pending scenarios", function () {
        summaryLogger.logScenariosSummary();
        expect(statsJournal.getPendingScenarioCount).toHaveBeenCalled();
      });

      describe("when there are no pending scenarios", function () {
        beforeEach(function () { statsJournal.getPendingScenarioCount.andReturn(0); });

        it("does not log passed scenarios", function () {
          summaryLogger.logScenariosSummary();
          expect(summaryLogger.log).not.toHaveBeenCalledWithStringMatching(/pending/);
        });
      });

      describe("when there is one pending scenario", function () {
        beforeEach(function () { statsJournal.getPendingScenarioCount.andReturn(1); });

        it("logs one pending scenario", function () {
          summaryLogger.logScenariosSummary();
          expect(summaryLogger.log).toHaveBeenCalledWithStringMatching(/1 pending/);
        });
      });

      describe("when there are two or more pending scenarios", function () {
        beforeEach(function () { statsJournal.getPendingScenarioCount.andReturn(2); });

        it("logs the pending scenarios", function () {
          summaryLogger.logScenariosSummary();
          expect(summaryLogger.log).toHaveBeenCalledWithStringMatching(/2 pending/);
        });
      });

      it("gets the number of passed scenarios", function () {
        summaryLogger.logScenariosSummary();
        expect(statsJournal.getPassedScenarioCount).toHaveBeenCalled();
      });

      describe("when there are no passed scenarios", function () {
        beforeEach(function () { statsJournal.getPassedScenarioCount.andReturn(0); });

        it("does not log passed scenarios", function () {
          summaryLogger.logScenariosSummary();
          expect(summaryLogger.log).not.toHaveBeenCalledWithStringMatching(/passed/);
        });
      });

      describe("when there is one passed scenario", function () {
        beforeEach(function () { statsJournal.getPassedScenarioCount.andReturn(1); });

        it("logs 1 passed scenarios", function () {
          summaryLogger.logScenariosSummary();
          expect(summaryLogger.log).toHaveBeenCalledWithStringMatching(/1 passed/);
        });
      });

      describe("when there are two or more passed scenarios", function () {
        beforeEach(function () { statsJournal.getPassedScenarioCount.andReturn(2); });

        it("logs the number of passed scenarios", function () {
          summaryLogger.logScenariosSummary();
          expect(summaryLogger.log).toHaveBeenCalledWithStringMatching(/2 passed/);
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
      spyOn(summaryLogger, 'log');
      spyOnStub(statsJournal, 'getStepCount').andReturn(stepCount);
      spyOnStub(statsJournal, 'getPassedStepCount').andReturn(passedStepCount);
      spyOnStub(statsJournal, 'getFailedStepCount').andReturn(failedStepCount);
      spyOnStub(statsJournal, 'getSkippedStepCount').andReturn(skippedStepCount);
      spyOnStub(statsJournal, 'getUndefinedStepCount').andReturn(undefinedStepCount);
      spyOnStub(statsJournal, 'getPendingStepCount').andReturn(pendingStepCount);
    });

    it("gets the number of steps", function () {
      summaryLogger.logStepsSummary();
      expect(statsJournal.getStepCount).toHaveBeenCalled();
    });

    describe("when there are no steps", function () {
      beforeEach(function () {
        statsJournal.getStepCount.andReturn(0);
      });

      it("logs 0 steps", function () {
        summaryLogger.logStepsSummary();
        expect(summaryLogger.log).toHaveBeenCalledWithStringMatching(/0 steps/);
      });

      it("does not log any details", function () {
        summaryLogger.logStepsSummary();
        expect(summaryLogger.log).not.toHaveBeenCalledWithStringMatching(/\(.*\)/);
      });
    });

    describe("when there are steps", function () {
      beforeEach(function () { statsJournal.getStepCount.andReturn(13); });

      describe("when there is one step", function () {
        beforeEach(function () {
          statsJournal.getStepCount.andReturn(1);
        });

        it("logs 1 step", function () {
          summaryLogger.logStepsSummary();
          expect(summaryLogger.log).toHaveBeenCalledWithStringMatching(/1 step/);
        });
      });

      describe("when there are two or more steps", function () {
        beforeEach(function () {
          statsJournal.getStepCount.andReturn(2);
        });

        it("logs the number of steps", function () {
          summaryLogger.logStepsSummary();
          expect(summaryLogger.log).toHaveBeenCalledWithStringMatching(/2 steps/);
        });
      });

      it("gets the number of failed steps", function () {
        summaryLogger.logStepsSummary();
        expect(statsJournal.getFailedStepCount).toHaveBeenCalled();
      });

      describe("when there are no failed steps", function () {
        beforeEach(function () {
          statsJournal.getFailedStepCount.andReturn(0);
        });

        it("does not log failed steps", function () {
          summaryLogger.logStepsSummary();
          expect(summaryLogger.log).not.toHaveBeenCalledWithStringMatching(/failed/);
        });
      });

      describe("when there is one failed step", function () {
        beforeEach(function () {
          statsJournal.getFailedStepCount.andReturn(1);
        });

        it("logs one failed step", function () {
          summaryLogger.logStepsSummary();
          expect(summaryLogger.log).toHaveBeenCalledWithStringMatching(/1 failed/);
        });
      });

      describe("when there is two or more failed steps", function () {
        beforeEach(function () {
          statsJournal.getFailedStepCount.andReturn(2);
        });

        it("logs the number of failed steps", function () {
          summaryLogger.logStepsSummary();
          expect(summaryLogger.log).toHaveBeenCalledWithStringMatching(/2 failed/);
        });
      });

      it("gets the number of undefined steps", function () {
        summaryLogger.logStepsSummary();
        expect(statsJournal.getUndefinedStepCount).toHaveBeenCalled();
      });

      describe("when there are no undefined steps", function () {
        beforeEach(function () {
          statsJournal.getUndefinedStepCount.andReturn(0);
        });

        it("does not log undefined steps", function () {
          summaryLogger.logStepsSummary();
          expect(summaryLogger.log).not.toHaveBeenCalledWithStringMatching(/undefined/);
        });
      });

      describe("when there is one undefined step", function () {
        beforeEach(function () {
          statsJournal.getUndefinedStepCount.andReturn(1);
        });

        it("logs one undefined steps", function () {
          summaryLogger.logStepsSummary();
          expect(summaryLogger.log).toHaveBeenCalledWithStringMatching(/1 undefined/);
        });
      });

      describe("when there are two or more undefined steps", function () {
        beforeEach(function () {
          statsJournal.getUndefinedStepCount.andReturn(2);
        });

        it("logs the number of undefined steps", function () {
          summaryLogger.logStepsSummary();
          expect(summaryLogger.log).toHaveBeenCalledWithStringMatching(/2 undefined/);
        });
      });

      it("gets the number of pending steps", function () {
        summaryLogger.logStepsSummary();
        expect(statsJournal.getPendingStepCount).toHaveBeenCalled();
      });

      describe("when there are no pending steps", function () {
        beforeEach(function () {
          statsJournal.getPendingStepCount.andReturn(0);
        });

        it("does not log pending steps", function () {
          summaryLogger.logStepsSummary();
          expect(summaryLogger.log).not.toHaveBeenCalledWithStringMatching(/pending/);
        });
      });

      describe("when there is one pending step", function () {
        beforeEach(function () {
          statsJournal.getPendingStepCount.andReturn(1);
        });

        it("logs one pending steps", function () {
          summaryLogger.logStepsSummary();
          expect(summaryLogger.log).toHaveBeenCalledWithStringMatching(/1 pending/);
        });
      });

      describe("when there are two or more pending steps", function () {
        beforeEach(function () {
          statsJournal.getPendingStepCount.andReturn(2);
        });

        it("logs the number of pending steps", function () {
          summaryLogger.logStepsSummary();
          expect(summaryLogger.log).toHaveBeenCalledWithStringMatching(/2 pending/);
        });
      });

      it("gets the number of skipped steps", function () {
        summaryLogger.logStepsSummary();
        expect(statsJournal.getSkippedStepCount).toHaveBeenCalled();
      });

      describe("when there are no skipped steps", function () {
        beforeEach(function () {
          statsJournal.getSkippedStepCount.andReturn(0);
        });

        it("does not log skipped steps", function () {
          summaryLogger.logStepsSummary();
          expect(summaryLogger.log).not.toHaveBeenCalledWithStringMatching(/skipped/);
        });
      });

      describe("when there is one skipped step", function () {
        beforeEach(function () {
          statsJournal.getSkippedStepCount.andReturn(1);
        });

        it("logs one skipped steps", function () {
          summaryLogger.logStepsSummary();
          expect(summaryLogger.log).toHaveBeenCalledWithStringMatching(/1 skipped/);
        });
      });

      describe("when there are two or more skipped steps", function () {
        beforeEach(function () {
          statsJournal.getSkippedStepCount.andReturn(2);
        });

        it("logs the number of skipped steps", function () {
          summaryLogger.logStepsSummary();
          expect(summaryLogger.log).toHaveBeenCalledWithStringMatching(/2 skipped/);
        });
      });

      it("gets the number of passed steps", function () {
        summaryLogger.logStepsSummary();
        expect(statsJournal.getPassedStepCount).toHaveBeenCalled();
      });

      describe("when there are no passed steps", function () {
        beforeEach(function () {
          statsJournal.getPassedStepCount.andReturn(0);
        });

        it("does not log passed steps", function () {
          summaryLogger.logStepsSummary();
          expect(summaryLogger.log).not.toHaveBeenCalledWithStringMatching(/passed/);
        });
      });

      describe("when there is one passed step", function () {
        beforeEach(function () {
          statsJournal.getPassedStepCount.andReturn(1);
        });

        it("logs one passed step", function () {
          summaryLogger.logStepsSummary();
          expect(summaryLogger.log).toHaveBeenCalledWithStringMatching(/1 passed/);
        });
      });

      describe("when there is two or more passed steps", function () {
        beforeEach(function () {
          statsJournal.getPassedStepCount.andReturn(2);
        });

        it("logs the number of passed steps", function () {
          summaryLogger.logStepsSummary();
          expect(summaryLogger.log).toHaveBeenCalledWithStringMatching(/2 passed/);
        });
      });
    });
  });

  describe("logUndefinedStepSnippets()", function () {
    var undefinedStepLogBuffer;

    beforeEach(function () {
      undefinedStepLogBuffer = createSpy("undefined step log buffer");
      spyOn(summaryLogger, 'log');
      spyOn(summaryLogger, 'getUndefinedStepLogBuffer').andReturn(undefinedStepLogBuffer);
    });

    it("logs a little explanation about the snippets", function () {
      summaryLogger.logUndefinedStepSnippets();
      expect(summaryLogger.log).toHaveBeenCalledWith("\nYou can implement step definitions for undefined steps with these snippets:\n\n");
    });

    it("gets the undefined steps log buffer", function () {
      summaryLogger.logUndefinedStepSnippets();
      expect(summaryLogger.getUndefinedStepLogBuffer).toHaveBeenCalled();
    });

    it("logs the undefined steps", function () {
      summaryLogger.logUndefinedStepSnippets();
      expect(summaryLogger.log).toHaveBeenCalledWith(undefinedStepLogBuffer);
    });
  });
});
