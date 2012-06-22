require('../../support/spec_helper');

describe("Cucumber.Listener.Summarizer", function () {
  var Cucumber = requireLib('cucumber');
  var listener, listenerHearMethod, summarizer, statsJournal, failedStepResults;

  beforeEach(function () {
    var Summarizer = Cucumber.Listener.Summarizer;
    listener           = createSpyWithStubs("listener");
    listenerHearMethod = spyOnStub(listener, 'hear');
    statsJournal       = createSpy("stats journal");
    failedStepResults  = createSpy("failed steps");
    spyOn(Cucumber.Type, 'Collection').andReturn(failedStepResults);
    spyOn(Cucumber, 'Listener').andReturn(listener);
    spyOnStub(Cucumber.Listener, 'StatsJournal').andReturn(statsJournal);
    Cucumber.Listener.Summarizer = Summarizer;
    summarizer = Cucumber.Listener.Summarizer();
  });

  describe("constructor", function () {
    it("creates a listener", function() {
      expect(Cucumber.Listener).toHaveBeenCalled();
    });

    it("extends the listener", function () {
      expect(summarizer).toBe(listener);
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
      summarizer.log(logged);
      summarizer.log(alsoLogged);
      expect(summarizer.getLogs()).toBe(loggedBuffer);
    });
  });

  describe("getLogs()", function () {
    it("returns the logged buffer", function () {
      var logged       = "this was logged";
      var alsoLogged   = "this was also logged";
      var loggedBuffer = logged + alsoLogged;
      spyOn(process.stdout, 'write'); // prevent actual output during spec execution
      summarizer.log(logged);
      summarizer.log(alsoLogged);
      expect(summarizer.getLogs()).toBe(loggedBuffer);
    });

    it("returns an empty string when the progress formatter did not log anything yet", function () {
      expect(summarizer.getLogs()).toBe("");
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
      summarizer.hear(event, callback);
      expect(statsJournal.hear).toHaveBeenCalled();
      expect(statsJournal.hear).toHaveBeenCalledWithValueAsNthParameter(event, 1);
      expect(statsJournal.hear).toHaveBeenCalledWithAFunctionAsNthParameter(2);
    });

    describe("stats journal callback", function () {
      var statsJournalCallback;

      beforeEach(function () {
        summarizer.hear(event, callback);
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
      spyOn(summarizer, 'handleFailedStepResult');
    });

    it("gets the step result from the event payload", function () {
      summarizer.handleStepResultEvent(event, callback);
      expect(event.getPayloadItem).toHaveBeenCalledWith('stepResult');
    });

    it("checks whether the step was undefined", function () {
      summarizer.handleStepResultEvent(event, callback);
      expect(stepResult.isUndefined).toHaveBeenCalled();
    });

    describe("when the step was undefined", function () {
      beforeEach(function () {
        stepResult.isUndefined.andReturn(true);
        spyOn(summarizer, 'handleUndefinedStepResult');
      });

      it("handles the undefined step result", function () {
        summarizer.handleStepResultEvent(event, callback);
        expect(summarizer.handleUndefinedStepResult).toHaveBeenCalledWith(stepResult);
      });
    });

    describe("when the step was not undefined", function () {
      beforeEach(function () {
        stepResult.isUndefined.andReturn(false);
        spyOn(summarizer, 'handleUndefinedStepResult');
      });

      it("does not handle an undefined step result", function () {
        summarizer.handleStepResultEvent(event, callback);
        expect(summarizer.handleUndefinedStepResult).not.toHaveBeenCalled();
      });

      it("checks whether the step failed", function () {
        summarizer.handleStepResultEvent(event, callback);
        expect(stepResult.isFailed).toHaveBeenCalled();
      });

      describe("when the step failed", function () {
        beforeEach(function () {
          stepResult.isFailed.andReturn(true);
        });

        it("handles the failed step result", function () {
          summarizer.handleStepResultEvent(event, callback);
          expect(summarizer.handleFailedStepResult).toHaveBeenCalledWith(stepResult);
        });
      });

      describe("when the step did not fail", function () {
        beforeEach(function () {
          stepResult.isFailed.andReturn(false);
        });

        it("handles the failed step result", function () {
          summarizer.handleStepResultEvent(event, callback);
          expect(summarizer.handleFailedStepResult).not.toHaveBeenCalled();
        });
      });
    });

    it("calls back", function () {
      summarizer.handleStepResultEvent(event, callback);
      expect(callback).toHaveBeenCalled();
    });
  });

  describe("handleUndefinedStepResult()", function () {
    var stepResult, step;

    beforeEach(function () {
      step       = createSpy("step");
      stepResult = createSpyWithStubs("step result", {getStep: step});
      spyOn(summarizer, 'storeUndefinedStep');
    });

    it("gets the step from the step result", function () {
      summarizer.handleUndefinedStepResult(stepResult);
      expect(stepResult.getStep).toHaveBeenCalled();
    });

    it("stores the undefined step", function () {
      summarizer.handleUndefinedStepResult(stepResult);
      expect(summarizer.storeUndefinedStep).toHaveBeenCalledWith(step);
    });
  });

  describe("handleFailedStepResult()", function () {
    var stepResult;

    beforeEach(function () {
      stepResult = createSpy("failed step result");
      spyOn(summarizer, 'storeFailedStepResult');
    });

    it("stores the failed step result", function () {
      summarizer.handleFailedStepResult(stepResult);
      expect(summarizer.storeFailedStepResult).toHaveBeenCalledWith(stepResult);
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
      summarizer.handleAfterScenarioEvent(event, callback);
      expect(statsJournal.isCurrentScenarioFailing).toHaveBeenCalled();
    });

    describe("when the current scenario failed", function () {
      var scenario;

      beforeEach(function () {
        scenario = createSpy("scenario");
        statsJournal.isCurrentScenarioFailing.andReturn(true);
        spyOn(summarizer, 'storeFailedScenario');
        spyOnStub(event, 'getPayloadItem').andReturn(scenario);
      });

      it("gets the scenario from the payload", function () {
        summarizer.handleAfterScenarioEvent(event, callback);
        expect(event.getPayloadItem).toHaveBeenCalledWith('scenario');
      });

      it("stores the failed scenario", function () {
        summarizer.handleAfterScenarioEvent(event, callback);
        expect(summarizer.storeFailedScenario).toHaveBeenCalledWith(scenario);
      });
    });

    describe("when the current scenario did not fail", function () {
      beforeEach(function () {
        statsJournal.isCurrentScenarioFailing.andReturn(false);
        spyOn(summarizer, 'storeFailedScenario');
        spyOnStub(event, 'getPayloadItem');
      });

      it("does not get the scenario from the payload", function () {
        summarizer.handleAfterScenarioEvent(event, callback);
        expect(event.getPayloadItem).not.toHaveBeenCalled();
      });

      it("does not store the failed scenario", function () {
        summarizer.handleAfterScenarioEvent(event, callback);
        expect(summarizer.storeFailedScenario).not.toHaveBeenCalled();
      });
    });

    it("calls back", function () {
      summarizer.handleAfterScenarioEvent(event, callback);
      expect(callback).toHaveBeenCalled();
    });
  });

  describe("handleAfterFeaturesEvent()", function () {
    var callback;

    beforeEach(function () {
      callback = createSpy("callback");
      spyOn(summarizer, 'logSummary');
    });

    it("logs the summary", function () {
      summarizer.handleAfterFeaturesEvent(event, callback);
      expect(summarizer.logSummary).toHaveBeenCalled();
    });

    it("calls back", function () {
      summarizer.handleAfterFeaturesEvent(event, callback);
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
      summarizer.storeFailedStepResult(failedStepResult);
      expect(failedStepResults.add).toHaveBeenCalledWith(failedStepResult);
    });
  });

  describe("storeFailedScenario()", function () {
    var failedScenario, name, uri, line;

    beforeEach(function () {
      name           = "some failed scenario";
      uri            = "/path/to/some.feature";
      line           = "123";
      string         = uri + ":" + line + " # Scenario: " + name;
      failedScenario = createSpyWithStubs("failedScenario", {getName: name, getUri: uri, getLine: line});
      spyOn(summarizer, 'appendStringToFailedScenarioLogBuffer');
    });

    it("gets the name of the scenario", function () {
      summarizer.storeFailedScenario(failedScenario);
      expect(failedScenario.getName).toHaveBeenCalled();
    });

    it("gets the URI of the scenario", function () {
      summarizer.storeFailedScenario(failedScenario);
      expect(failedScenario.getUri).toHaveBeenCalled();
    });

    it("gets the line of the scenario", function () {
      summarizer.storeFailedScenario(failedScenario);
      expect(failedScenario.getLine).toHaveBeenCalled();
    });

    it("appends the scenario details to the failed scenario log buffer", function () {
      summarizer.storeFailedScenario(failedScenario);
      expect(summarizer.appendStringToFailedScenarioLogBuffer).toHaveBeenCalledWith(string);
    });
  });

  describe("storeUndefinedStep()", function () {
    var snippetBuilder, snippet, step;

    beforeEach(function () {
      stpe           = createSpy("step");
      snippet        = createSpy("step definition snippet");
      snippetBuilder = createSpyWithStubs("snippet builder", {buildSnippet: snippet});
      spyOn(Cucumber.SupportCode, 'StepDefinitionSnippetBuilder').andReturn(snippetBuilder);
      spyOn(summarizer, 'appendStringToUndefinedStepLogBuffer');
    });

    it("creates a new step definition snippet builder", function () {
      summarizer.storeUndefinedStep(step);
      expect(Cucumber.SupportCode.StepDefinitionSnippetBuilder).toHaveBeenCalledWith(step);
    });

    it("builds the step definition", function () {
      summarizer.storeUndefinedStep(step);
      expect(snippetBuilder.buildSnippet).toHaveBeenCalled();
    });

    it("appends the snippet to the undefined step log buffer", function () {
      summarizer.storeUndefinedStep(step);
      expect(summarizer.appendStringToUndefinedStepLogBuffer).toHaveBeenCalledWith(snippet);
    });
  });

  describe("getFailedScenarioLogBuffer() [appendStringToFailedScenarioLogBuffer()]", function () {
    it("returns the logged failed scenario details", function () {
      summarizer.appendStringToFailedScenarioLogBuffer("abc");
      expect(summarizer.getFailedScenarioLogBuffer()).toBe("abc\n");
    });

    it("returns all logged failed scenario lines joined with a line break", function () {
      summarizer.appendStringToFailedScenarioLogBuffer("abc");
      summarizer.appendStringToFailedScenarioLogBuffer("def");
      expect(summarizer.getFailedScenarioLogBuffer()).toBe("abc\ndef\n");
    });
  });

  describe("getUndefinedStepLogBuffer() [appendStringToUndefinedStepLogBuffer()]", function () {
    it("returns the logged undefined step details", function () {
      summarizer.appendStringToUndefinedStepLogBuffer("abc");
      expect(summarizer.getUndefinedStepLogBuffer()).toBe("abc\n");
    });

    it("returns all logged failed scenario lines joined with a line break", function () {
      summarizer.appendStringToUndefinedStepLogBuffer("abc");
      summarizer.appendStringToUndefinedStepLogBuffer("def");
      expect(summarizer.getUndefinedStepLogBuffer()).toBe("abc\ndef\n");
    });
  });

  describe("appendStringToUndefinedStepLogBuffer() [getUndefinedStepLogBuffer()]", function () {
    it("does not log the same string twice", function () {
      summarizer.appendStringToUndefinedStepLogBuffer("abcdef");
      summarizer.appendStringToUndefinedStepLogBuffer("abcdef");
      expect(summarizer.getUndefinedStepLogBuffer()).toBe("abcdef\n");
    });
  });

  describe("logSummary()", function () {
    var scenarioCount, passedScenarioCount, failedScenarioCount;
    var stepCount, passedStepCount;

    beforeEach(function () {
      spyOn(summarizer, 'log');
      spyOn(summarizer, 'logScenariosSummary');
      spyOn(summarizer, 'logStepsSummary');
      spyOn(summarizer, 'logFailedStepResults');
      spyOn(summarizer, 'logUndefinedStepSnippets');
      spyOnStub(statsJournal, 'witnessedAnyFailedStep');
      spyOnStub(statsJournal, 'witnessedAnyUndefinedStep');
      spyOnStub(statsJournal, 'logFailedStepResults');
      spyOnStub(statsJournal, 'logScenariosSummary');
      spyOnStub(statsJournal, 'logStepsSummary');
      spyOnStub(statsJournal, 'logUndefinedStepSnippets');
    });

    it("logs two line feeds", function () {
      summarizer.logSummary();
      expect(summarizer.log).toHaveBeenCalledWith("\n\n");
    });

    it("checks whether there are failed steps or not", function () {
      summarizer.logSummary();
      expect(statsJournal.witnessedAnyFailedStep).toHaveBeenCalled();
    });

    describe("when there are failed steps", function () {
      beforeEach(function () {
        statsJournal.witnessedAnyFailedStep.andReturn(true);
      });

      it("logs the failed steps", function () {
        summarizer.logSummary();
        expect(summarizer.logFailedStepResults).toHaveBeenCalled();
      });
    });

    describe("when there are no failed steps", function () {
      beforeEach(function () {
        statsJournal.witnessedAnyFailedStep.andReturn(false);
      });

      it("does not log failed steps", function () {
        summarizer.logSummary();
        expect(summarizer.logFailedStepResults).not.toHaveBeenCalled();
      });
    });

    it("logs the scenarios summary", function () {
      summarizer.logSummary();
      expect(summarizer.logScenariosSummary).toHaveBeenCalled();
    });

    it("logs the steps summary", function () {
      summarizer.logSummary();
      expect(summarizer.logStepsSummary).toHaveBeenCalled();
    });

    it("checks whether there are undefined steps or not", function () {
      summarizer.logSummary();
      expect(statsJournal.witnessedAnyUndefinedStep).toHaveBeenCalled();
    });

    describe("when there are undefined steps", function () {
      beforeEach(function () {
        statsJournal.witnessedAnyUndefinedStep.andReturn(true);
      });

      it("logs the undefined step snippets", function () {
        summarizer.logSummary();
        expect(summarizer.logUndefinedStepSnippets).toHaveBeenCalled();
      });
    });

    describe("when there are no undefined steps", function () {
      beforeEach(function () {
        statsJournal.witnessedAnyUndefinedStep.andReturn(false);
      });

      it("does not log the undefined step snippets", function () {
        summarizer.logSummary();
        expect(summarizer.logUndefinedStepSnippets).not.toHaveBeenCalled();
      });
    });
  });

  describe("logFailedStepResults()", function () {
    var failedScenarioLogBuffer;

    beforeEach(function () {
      failedScenarioLogBuffer = createSpy("failed scenario log buffer");
      spyOnStub(failedStepResults, 'syncForEach');
      spyOn(summarizer, 'log');
      spyOn(summarizer, 'getFailedScenarioLogBuffer').andReturn(failedScenarioLogBuffer);
    });

    it("logs a failed steps header", function () {
      summarizer.logFailedStepResults();
      expect(summarizer.log).toHaveBeenCalledWith("(::) failed steps (::)\n\n");
    });

    it("iterates synchronously over the failed step results", function () {
      summarizer.logFailedStepResults();
      expect(failedStepResults.syncForEach).toHaveBeenCalled();
      expect(failedStepResults.syncForEach).toHaveBeenCalledWithAFunctionAsNthParameter(1);
    });

    describe("for each failed step result", function () {
      var userFunction, failedStep, forEachCallback;

      beforeEach(function () {
        summarizer.logFailedStepResults();
        userFunction     = failedStepResults.syncForEach.mostRecentCall.args[0];
        failedStepResult = createSpy("failed step result");
        spyOn(summarizer, 'logFailedStepResult');
      });

      it("tells the visitor to visit the feature and call back when finished", function () {
        userFunction(failedStepResult);
        expect(summarizer.logFailedStepResult).toHaveBeenCalledWith(failedStepResult);
      });
    });

    it("logs a failed scenarios header", function () {
      summarizer.logFailedStepResults();
      expect(summarizer.log).toHaveBeenCalledWith("Failing scenarios:\n");
    });

    it("gets the failed scenario details from its log buffer", function () {
      summarizer.logFailedStepResults();
      expect(summarizer.getFailedScenarioLogBuffer).toHaveBeenCalled();
    });

    it("logs the failed scenario details", function () {
      summarizer.logFailedStepResults();
      expect(summarizer.log).toHaveBeenCalledWith(failedScenarioLogBuffer);
    });

    it("logs a line break", function () {
      summarizer.logFailedStepResults();
      expect(summarizer.log).toHaveBeenCalledWith("\n");
    });
  });

  describe("logFailedStepResult()", function () {
    var stepResult, failureException;

    beforeEach(function () {
      spyOn(summarizer, 'log');
      failureException = createSpy('caught exception');
      stepResult       = createSpyWithStubs("failed step result", { getFailureException: failureException });
    });

    it("gets the failure exception from the step result", function () {
      summarizer.logFailedStepResult(stepResult);
      expect(stepResult.getFailureException).toHaveBeenCalled();
    });

    describe("when the failure exception has a stack", function () {
      beforeEach(function () {
        failureException.stack = createSpy('failure exception stack');
      });

      it("logs the stack", function () {
        summarizer.logFailedStepResult(stepResult);
        expect(summarizer.log).toHaveBeenCalledWith(failureException.stack);
      });
    });

    describe("when the failure exception has no stack", function () {
      it("logs the exception itself", function () {
        summarizer.logFailedStepResult(stepResult);
        expect(summarizer.log).toHaveBeenCalledWith(failureException);
      });
    });

    it("logs two line breaks", function () {
      summarizer.logFailedStepResult(stepResult);
      expect(summarizer.log).toHaveBeenCalledWith("\n\n");
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
      spyOn(summarizer, 'log');
      spyOnStub(statsJournal, 'getScenarioCount').andReturn(scenarioCount);
      spyOnStub(statsJournal, 'getPassedScenarioCount').andReturn(passedScenarioCount);
      spyOnStub(statsJournal, 'getUndefinedScenarioCount').andReturn(undefinedScenarioCount);
      spyOnStub(statsJournal, 'getPendingScenarioCount').andReturn(pendingScenarioCount);
      spyOnStub(statsJournal, 'getFailedScenarioCount').andReturn(failedScenarioCount);
    });

    it("gets the number of scenarios", function () {
      summarizer.logScenariosSummary();
      expect(statsJournal.getScenarioCount).toHaveBeenCalled();
    });

    describe("when there are no scenarios", function () {
      beforeEach(function () { statsJournal.getScenarioCount.andReturn(0); });

      it("logs 0 scenarios", function () {
        summarizer.logScenariosSummary();
        expect(summarizer.log).toHaveBeenCalledWithStringMatching(/0 scenarios/);
      });

      it("does not log any details", function () {
        summarizer.logScenariosSummary();
        expect(summarizer.log).not.toHaveBeenCalledWithStringMatching(/\(.*\)/);
      });
    });

    describe("when there are scenarios", function () {
      beforeEach(function () { statsJournal.getScenarioCount.andReturn(12); });

      describe("when there is one scenario", function () {
        beforeEach(function () { statsJournal.getScenarioCount.andReturn(1); });

        it("logs one scenario", function () {
          summarizer.logScenariosSummary();
          expect(summarizer.log).toHaveBeenCalledWithStringMatching(/1 scenario([^s]|$)/);
        });
      });

      describe("when there are 2 or more scenarios", function () {
        beforeEach(function () { statsJournal.getScenarioCount.andReturn(2); });

        it("logs two or more scenarios", function () {
          summarizer.logScenariosSummary();
          expect(summarizer.log).toHaveBeenCalledWithStringMatching(/2 scenarios/);
        });
      });

      it("gets the number of failed scenarios", function () {
        summarizer.logScenariosSummary();
        expect(statsJournal.getFailedScenarioCount).toHaveBeenCalled();
      });

      describe("when there are no failed scenarios", function () {
        beforeEach(function () { statsJournal.getFailedScenarioCount.andReturn(0); });

        it("does not log failed scenarios", function () {
          summarizer.logScenariosSummary();
          expect(summarizer.log).not.toHaveBeenCalledWithStringMatching(/failed/);
        });
      });

      describe("when there is one failed scenario", function () {
        beforeEach(function () { statsJournal.getFailedScenarioCount.andReturn(1); });

        it("logs a failed scenario", function () {
          summarizer.logScenariosSummary();
          expect(summarizer.log).toHaveBeenCalledWithStringMatching(/1 failed/);
        });
      });

      describe("when there are two or more failed scenarios", function () {
        beforeEach(function () { statsJournal.getFailedScenarioCount.andReturn(2); });

        it("logs the number of failed scenarios", function () {
          summarizer.logScenariosSummary();
          expect(summarizer.log).toHaveBeenCalledWithStringMatching(/2 failed/);
        });
      });

      it("gets the number of undefined scenarios", function () {
        summarizer.logScenariosSummary();
        expect(statsJournal.getUndefinedScenarioCount).toHaveBeenCalled();
      });

      describe("when there are no undefined scenarios", function () {
        beforeEach(function () { statsJournal.getUndefinedScenarioCount.andReturn(0); });

        it("does not log passed scenarios", function () {
          summarizer.logScenariosSummary();
          expect(summarizer.log).not.toHaveBeenCalledWithStringMatching(/undefined/);
        });
      });

      describe("when there is one undefined scenario", function () {
        beforeEach(function () { statsJournal.getUndefinedScenarioCount.andReturn(1); });

        it("logs one undefined scenario", function () {
          summarizer.logScenariosSummary();
          expect(summarizer.log).toHaveBeenCalledWithStringMatching(/1 undefined/);
        });
      });

      describe("when there are two or more undefined scenarios", function () {
        beforeEach(function () { statsJournal.getUndefinedScenarioCount.andReturn(2); });

        it("logs the undefined scenarios", function () {
          summarizer.logScenariosSummary();
          expect(summarizer.log).toHaveBeenCalledWithStringMatching(/2 undefined/);
        });
      });

      it("gets the number of pending scenarios", function () {
        summarizer.logScenariosSummary();
        expect(statsJournal.getPendingScenarioCount).toHaveBeenCalled();
      });

      describe("when there are no pending scenarios", function () {
        beforeEach(function () { statsJournal.getPendingScenarioCount.andReturn(0); });

        it("does not log passed scenarios", function () {
          summarizer.logScenariosSummary();
          expect(summarizer.log).not.toHaveBeenCalledWithStringMatching(/pending/);
        });
      });

      describe("when there is one pending scenario", function () {
        beforeEach(function () { statsJournal.getPendingScenarioCount.andReturn(1); });

        it("logs one pending scenario", function () {
          summarizer.logScenariosSummary();
          expect(summarizer.log).toHaveBeenCalledWithStringMatching(/1 pending/);
        });
      });

      describe("when there are two or more pending scenarios", function () {
        beforeEach(function () { statsJournal.getPendingScenarioCount.andReturn(2); });

        it("logs the pending scenarios", function () {
          summarizer.logScenariosSummary();
          expect(summarizer.log).toHaveBeenCalledWithStringMatching(/2 pending/);
        });
      });

      it("gets the number of passed scenarios", function () {
        summarizer.logScenariosSummary();
        expect(statsJournal.getPassedScenarioCount).toHaveBeenCalled();
      });

      describe("when there are no passed scenarios", function () {
        beforeEach(function () { statsJournal.getPassedScenarioCount.andReturn(0); });

        it("does not log passed scenarios", function () {
          summarizer.logScenariosSummary();
          expect(summarizer.log).not.toHaveBeenCalledWithStringMatching(/passed/);
        });
      });

      describe("when there is one passed scenario", function () {
        beforeEach(function () { statsJournal.getPassedScenarioCount.andReturn(1); });

        it("logs 1 passed scenarios", function () {
          summarizer.logScenariosSummary();
          expect(summarizer.log).toHaveBeenCalledWithStringMatching(/1 passed/);
        });
      });

      describe("when there are two or more passed scenarios", function () {
        beforeEach(function () { statsJournal.getPassedScenarioCount.andReturn(2); });

        it("logs the number of passed scenarios", function () {
          summarizer.logScenariosSummary();
          expect(summarizer.log).toHaveBeenCalledWithStringMatching(/2 passed/);
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
      spyOn(summarizer, 'log');
      spyOnStub(statsJournal, 'getStepCount').andReturn(stepCount);
      spyOnStub(statsJournal, 'getPassedStepCount').andReturn(passedStepCount);
      spyOnStub(statsJournal, 'getFailedStepCount').andReturn(failedStepCount);
      spyOnStub(statsJournal, 'getSkippedStepCount').andReturn(skippedStepCount);
      spyOnStub(statsJournal, 'getUndefinedStepCount').andReturn(undefinedStepCount);
      spyOnStub(statsJournal, 'getPendingStepCount').andReturn(pendingStepCount);
    });

    it("gets the number of steps", function () {
      summarizer.logStepsSummary();
      expect(statsJournal.getStepCount).toHaveBeenCalled();
    });

    describe("when there are no steps", function () {
      beforeEach(function () {
        statsJournal.getStepCount.andReturn(0);
      });

      it("logs 0 steps", function () {
        summarizer.logStepsSummary();
        expect(summarizer.log).toHaveBeenCalledWithStringMatching(/0 steps/);
      });

      it("does not log any details", function () {
        summarizer.logStepsSummary();
        expect(summarizer.log).not.toHaveBeenCalledWithStringMatching(/\(.*\)/);
      });
    });

    describe("when there are steps", function () {
      beforeEach(function () { statsJournal.getStepCount.andReturn(13); });

      describe("when there is one step", function () {
        beforeEach(function () {
          statsJournal.getStepCount.andReturn(1);
        });

        it("logs 1 step", function () {
          summarizer.logStepsSummary();
          expect(summarizer.log).toHaveBeenCalledWithStringMatching(/1 step/);
        });
      });

      describe("when there are two or more steps", function () {
        beforeEach(function () {
          statsJournal.getStepCount.andReturn(2);
        });

        it("logs the number of steps", function () {
          summarizer.logStepsSummary();
          expect(summarizer.log).toHaveBeenCalledWithStringMatching(/2 steps/);
        });
      });

      it("gets the number of failed steps", function () {
        summarizer.logStepsSummary();
        expect(statsJournal.getFailedStepCount).toHaveBeenCalled();
      });

      describe("when there are no failed steps", function () {
        beforeEach(function () {
          statsJournal.getFailedStepCount.andReturn(0);
        });

        it("does not log failed steps", function () {
          summarizer.logStepsSummary();
          expect(summarizer.log).not.toHaveBeenCalledWithStringMatching(/failed/);
        });
      });

      describe("when there is one failed step", function () {
        beforeEach(function () {
          statsJournal.getFailedStepCount.andReturn(1);
        });

        it("logs one failed step", function () {
          summarizer.logStepsSummary();
          expect(summarizer.log).toHaveBeenCalledWithStringMatching(/1 failed/);
        });
      });

      describe("when there is two or more failed steps", function () {
        beforeEach(function () {
          statsJournal.getFailedStepCount.andReturn(2);
        });

        it("logs the number of failed steps", function () {
          summarizer.logStepsSummary();
          expect(summarizer.log).toHaveBeenCalledWithStringMatching(/2 failed/);
        });
      });

      it("gets the number of undefined steps", function () {
        summarizer.logStepsSummary();
        expect(statsJournal.getUndefinedStepCount).toHaveBeenCalled();
      });

      describe("when there are no undefined steps", function () {
        beforeEach(function () {
          statsJournal.getUndefinedStepCount.andReturn(0);
        });

        it("does not log undefined steps", function () {
          summarizer.logStepsSummary();
          expect(summarizer.log).not.toHaveBeenCalledWithStringMatching(/undefined/);
        });
      });

      describe("when there is one undefined step", function () {
        beforeEach(function () {
          statsJournal.getUndefinedStepCount.andReturn(1);
        });

        it("logs one undefined steps", function () {
          summarizer.logStepsSummary();
          expect(summarizer.log).toHaveBeenCalledWithStringMatching(/1 undefined/);
        });
      });

      describe("when there are two or more undefined steps", function () {
        beforeEach(function () {
          statsJournal.getUndefinedStepCount.andReturn(2);
        });

        it("logs the number of undefined steps", function () {
          summarizer.logStepsSummary();
          expect(summarizer.log).toHaveBeenCalledWithStringMatching(/2 undefined/);
        });
      });

      it("gets the number of pending steps", function () {
        summarizer.logStepsSummary();
        expect(statsJournal.getPendingStepCount).toHaveBeenCalled();
      });

      describe("when there are no pending steps", function () {
        beforeEach(function () {
          statsJournal.getPendingStepCount.andReturn(0);
        });

        it("does not log pending steps", function () {
          summarizer.logStepsSummary();
          expect(summarizer.log).not.toHaveBeenCalledWithStringMatching(/pending/);
        });
      });

      describe("when there is one pending step", function () {
        beforeEach(function () {
          statsJournal.getPendingStepCount.andReturn(1);
        });

        it("logs one pending steps", function () {
          summarizer.logStepsSummary();
          expect(summarizer.log).toHaveBeenCalledWithStringMatching(/1 pending/);
        });
      });

      describe("when there are two or more pending steps", function () {
        beforeEach(function () {
          statsJournal.getPendingStepCount.andReturn(2);
        });

        it("logs the number of pending steps", function () {
          summarizer.logStepsSummary();
          expect(summarizer.log).toHaveBeenCalledWithStringMatching(/2 pending/);
        });
      });

      it("gets the number of skipped steps", function () {
        summarizer.logStepsSummary();
        expect(statsJournal.getSkippedStepCount).toHaveBeenCalled();
      });

      describe("when there are no skipped steps", function () {
        beforeEach(function () {
          statsJournal.getSkippedStepCount.andReturn(0);
        });

        it("does not log skipped steps", function () {
          summarizer.logStepsSummary();
          expect(summarizer.log).not.toHaveBeenCalledWithStringMatching(/skipped/);
        });
      });

      describe("when there is one skipped step", function () {
        beforeEach(function () {
          statsJournal.getSkippedStepCount.andReturn(1);
        });

        it("logs one skipped steps", function () {
          summarizer.logStepsSummary();
          expect(summarizer.log).toHaveBeenCalledWithStringMatching(/1 skipped/);
        });
      });

      describe("when there are two or more skipped steps", function () {
        beforeEach(function () {
          statsJournal.getSkippedStepCount.andReturn(2);
        });

        it("logs the number of skipped steps", function () {
          summarizer.logStepsSummary();
          expect(summarizer.log).toHaveBeenCalledWithStringMatching(/2 skipped/);
        });
      });

      it("gets the number of passed steps", function () {
        summarizer.logStepsSummary();
        expect(statsJournal.getPassedStepCount).toHaveBeenCalled();
      });

      describe("when there are no passed steps", function () {
        beforeEach(function () {
          statsJournal.getPassedStepCount.andReturn(0);
        });

        it("does not log passed steps", function () {
          summarizer.logStepsSummary();
          expect(summarizer.log).not.toHaveBeenCalledWithStringMatching(/passed/);
        });
      });

      describe("when there is one passed step", function () {
        beforeEach(function () {
          statsJournal.getPassedStepCount.andReturn(1);
        });

        it("logs one passed step", function () {
          summarizer.logStepsSummary();
          expect(summarizer.log).toHaveBeenCalledWithStringMatching(/1 passed/);
        });
      });

      describe("when there is two or more passed steps", function () {
        beforeEach(function () {
          statsJournal.getPassedStepCount.andReturn(2);
        });

        it("logs the number of passed steps", function () {
          summarizer.logStepsSummary();
          expect(summarizer.log).toHaveBeenCalledWithStringMatching(/2 passed/);
        });
      });
    });
  });

  describe("logUndefinedStepSnippets()", function () {
    var undefinedStepLogBuffer;

    beforeEach(function () {
      undefinedStepLogBuffer = createSpy("undefined step log buffer");
      spyOn(summarizer, 'log');
      spyOn(summarizer, 'getUndefinedStepLogBuffer').andReturn(undefinedStepLogBuffer);
    });

    it("logs a little explanation about the snippets", function () {
      summarizer.logUndefinedStepSnippets();
      expect(summarizer.log).toHaveBeenCalledWith("\nYou can implement step definitions for undefined steps with these snippets:\n\n");
    });

    it("gets the undefined steps log buffer", function () {
      summarizer.logUndefinedStepSnippets();
      expect(summarizer.getUndefinedStepLogBuffer).toHaveBeenCalled();
    });

    it("logs the undefined steps", function () {
      summarizer.logUndefinedStepSnippets();
      expect(summarizer.log).toHaveBeenCalledWith(undefinedStepLogBuffer);
    });
  });
});
