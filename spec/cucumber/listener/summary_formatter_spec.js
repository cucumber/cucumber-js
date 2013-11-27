require('../../support/spec_helper');

describe("Cucumber.Listener.SummaryFormatter", function () {
  var Cucumber = requireLib('cucumber');
  var formatter, formatterHearMethod, summaryFormatter, statsJournal, failedStepResults, options;

  beforeEach(function () {
    options              = createSpy("options");
    formatter            = createSpyWithStubs("formatter", {log: null});
    formatterHearMethod  = spyOnStub(formatter, 'hear');
    statsJournal         = createSpy("stats journal");
    failedStepResults    = createSpy("failed steps");
    spyOn(Cucumber.Type, 'Collection').andReturn(failedStepResults);
    spyOn(Cucumber.Listener, 'Formatter').andReturn(formatter);
    spyOn(Cucumber.Listener, 'StatsJournal').andReturn(statsJournal);
    summaryFormatter = Cucumber.Listener.SummaryFormatter(options);
    color = Cucumber.Util.ConsoleColor;
  });

  describe("constructor", function () {
    it("creates a formatter", function() {
      expect(Cucumber.Listener.Formatter).toHaveBeenCalledWith(options);
    });

    it("extends the formatter", function () {
      expect(summaryFormatter).toBe(formatter);
    });

    it("creates a collection to store the failed steps", function () {
      expect(Cucumber.Type.Collection).toHaveBeenCalled();
    });

    it("creates a stats journal", function () {
      expect(Cucumber.Listener.StatsJournal).toHaveBeenCalled();
    })
  });

  describe("hear()", function () {
    var event, callback;

    beforeEach(function () {
      event    = createSpy("event");
      callback = createSpy("callback");
      spyOnStub(statsJournal, 'hear');
    });

    it("tells the stats journal to listen to the event", function () {
      summaryFormatter.hear(event, callback);
      expect(statsJournal.hear).toHaveBeenCalled();
      expect(statsJournal.hear).toHaveBeenCalledWithValueAsNthParameter(event, 1);
      expect(statsJournal.hear).toHaveBeenCalledWithAFunctionAsNthParameter(2);
    });

    describe("stats journal callback", function () {
      var statsJournalCallback;

      beforeEach(function () {
        summaryFormatter.hear(event, callback);
        statsJournalCallback = statsJournal.hear.mostRecentCall.args[1];
      });

      it("tells the formatter to listen to the event", function () {
        statsJournalCallback();
        expect(formatterHearMethod).toHaveBeenCalledWith(event, callback);
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
      spyOn(summaryFormatter, 'handleFailedStepResult');
    });

    it("gets the step result from the event payload", function () {
      summaryFormatter.handleStepResultEvent(event, callback);
      expect(event.getPayloadItem).toHaveBeenCalledWith('stepResult');
    });

    it("checks whether the step was undefined", function () {
      summaryFormatter.handleStepResultEvent(event, callback);
      expect(stepResult.isUndefined).toHaveBeenCalled();
    });

    describe("when the step was undefined", function () {
      beforeEach(function () {
        stepResult.isUndefined.andReturn(true);
        spyOn(summaryFormatter, 'handleUndefinedStepResult');
      });

      it("handles the undefined step result", function () {
        summaryFormatter.handleStepResultEvent(event, callback);
        expect(summaryFormatter.handleUndefinedStepResult).toHaveBeenCalledWith(stepResult);
      });
    });

    describe("when the step was not undefined", function () {
      beforeEach(function () {
        stepResult.isUndefined.andReturn(false);
        spyOn(summaryFormatter, 'handleUndefinedStepResult');
      });

      it("does not handle an undefined step result", function () {
        summaryFormatter.handleStepResultEvent(event, callback);
        expect(summaryFormatter.handleUndefinedStepResult).not.toHaveBeenCalled();
      });

      it("checks whether the step failed", function () {
        summaryFormatter.handleStepResultEvent(event, callback);
        expect(stepResult.isFailed).toHaveBeenCalled();
      });

      describe("when the step failed", function () {
        beforeEach(function () {
          stepResult.isFailed.andReturn(true);
        });

        it("handles the failed step result", function () {
          summaryFormatter.handleStepResultEvent(event, callback);
          expect(summaryFormatter.handleFailedStepResult).toHaveBeenCalledWith(stepResult);
        });
      });

      describe("when the step did not fail", function () {
        beforeEach(function () {
          stepResult.isFailed.andReturn(false);
        });

        it("handles the failed step result", function () {
          summaryFormatter.handleStepResultEvent(event, callback);
          expect(summaryFormatter.handleFailedStepResult).not.toHaveBeenCalled();
        });
      });
    });

    it("calls back", function () {
      summaryFormatter.handleStepResultEvent(event, callback);
      expect(callback).toHaveBeenCalled();
    });
  });

  describe("handleUndefinedStepResult()", function () {
    var stepResult, step;

    beforeEach(function () {
      step       = createSpy("step");
      stepResult = createSpyWithStubs("step result", {getStep: step});
      spyOn(summaryFormatter, 'storeUndefinedStep');
    });

    it("gets the step from the step result", function () {
      summaryFormatter.handleUndefinedStepResult(stepResult);
      expect(stepResult.getStep).toHaveBeenCalled();
    });

    it("stores the undefined step", function () {
      summaryFormatter.handleUndefinedStepResult(stepResult);
      expect(summaryFormatter.storeUndefinedStep).toHaveBeenCalledWith(step);
    });
  });

  describe("handleFailedStepResult()", function () {
    var stepResult;

    beforeEach(function () {
      stepResult = createSpy("failed step result");
      spyOn(summaryFormatter, 'storeFailedStepResult');
    });

    it("stores the failed step result", function () {
      summaryFormatter.handleFailedStepResult(stepResult);
      expect(summaryFormatter.storeFailedStepResult).toHaveBeenCalledWith(stepResult);
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
      summaryFormatter.handleAfterScenarioEvent(event, callback);
      expect(statsJournal.isCurrentScenarioFailing).toHaveBeenCalled();
    });

    describe("when the current scenario failed", function () {
      var scenario;

      beforeEach(function () {
        scenario = createSpy("scenario");
        statsJournal.isCurrentScenarioFailing.andReturn(true);
        spyOn(summaryFormatter, 'storeFailedScenario');
        spyOnStub(event, 'getPayloadItem').andReturn(scenario);
      });

      it("gets the scenario from the payload", function () {
        summaryFormatter.handleAfterScenarioEvent(event, callback);
        expect(event.getPayloadItem).toHaveBeenCalledWith('scenario');
      });

      it("stores the failed scenario", function () {
        summaryFormatter.handleAfterScenarioEvent(event, callback);
        expect(summaryFormatter.storeFailedScenario).toHaveBeenCalledWith(scenario);
      });
    });

    describe("when the current scenario did not fail", function () {
      beforeEach(function () {
        statsJournal.isCurrentScenarioFailing.andReturn(false);
        spyOn(summaryFormatter, 'storeFailedScenario');
        spyOnStub(event, 'getPayloadItem');
      });

      it("does not get the scenario from the payload", function () {
        summaryFormatter.handleAfterScenarioEvent(event, callback);
        expect(event.getPayloadItem).not.toHaveBeenCalled();
      });

      it("does not store the failed scenario", function () {
        summaryFormatter.handleAfterScenarioEvent(event, callback);
        expect(summaryFormatter.storeFailedScenario).not.toHaveBeenCalled();
      });
    });

    it("calls back", function () {
      summaryFormatter.handleAfterScenarioEvent(event, callback);
      expect(callback).toHaveBeenCalled();
    });
  });

  describe("handleAfterFeaturesEvent()", function () {
    var callback, event;

    beforeEach(function () {
      callback = createSpy("callback");
      event    = createSpy("event");
      spyOn(summaryFormatter, 'logSummary');
    });

    it("logs the summary", function () {
      summaryFormatter.handleAfterFeaturesEvent(event, callback);
      expect(summaryFormatter.logSummary).toHaveBeenCalled();
    });

    it("calls back", function () {
      summaryFormatter.handleAfterFeaturesEvent(event, callback);
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
      summaryFormatter.storeFailedStepResult(failedStepResult);
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
      spyOn(summaryFormatter, 'appendStringToFailedScenarioLogBuffer');
    });

    it("gets the name of the scenario", function () {
      summaryFormatter.storeFailedScenario(failedScenario);
      expect(failedScenario.getName).toHaveBeenCalled();
    });

    it("gets the URI of the scenario", function () {
      summaryFormatter.storeFailedScenario(failedScenario);
      expect(failedScenario.getUri).toHaveBeenCalled();
    });

    it("gets the line of the scenario", function () {
      summaryFormatter.storeFailedScenario(failedScenario);
      expect(failedScenario.getLine).toHaveBeenCalled();
    });

    it("appends the scenario details to the failed scenario log buffer", function () {
      summaryFormatter.storeFailedScenario(failedScenario);
      expect(summaryFormatter.appendStringToFailedScenarioLogBuffer).toHaveBeenCalledWith(string);
    });
  });

  describe("storeUndefinedStep()", function () {
    var snippetBuilderSyntax, numberMatchingGroup, snippetBuilder, snippet, step;

    beforeEach(function () {
      numberMatchingGroup  = createSpy("snippet number matching group");
      snippetBuilderSyntax = createSpyWithStubs("snippet builder syntax", {getNumberMatchingGroup: numberMatchingGroup});
      step           = createSpy("step");
      snippet        = createSpy("step definition snippet");
      snippetBuilder = createSpyWithStubs("snippet builder", {buildSnippet: snippet});
      spyOn(Cucumber.SupportCode, 'StepDefinitionSnippetBuilder').andReturn(snippetBuilder);
      spyOn(summaryFormatter, 'appendStringToUndefinedStepLogBuffer');
      spyOn(summaryFormatter, 'getStepDefinitionSyntax').andReturn(snippetBuilderSyntax);
    });

    it("creates a new step definition snippet builder", function () {
      summaryFormatter.storeUndefinedStep(step, snippetBuilderSyntax);
      expect(Cucumber.SupportCode.StepDefinitionSnippetBuilder).toHaveBeenCalledWith(step, snippetBuilderSyntax);
    });

    it("builds the step definition", function () {
      summaryFormatter.storeUndefinedStep(step, snippetBuilderSyntax);
      expect(snippetBuilder.buildSnippet).toHaveBeenCalled();
    });

    it("appends the snippet to the undefined step log buffer", function () {
      summaryFormatter.storeUndefinedStep(step, snippetBuilderSyntax);
      expect(summaryFormatter.appendStringToUndefinedStepLogBuffer).toHaveBeenCalledWith(snippet);
    });
  });

  describe("getFailedScenarioLogBuffer() [appendStringToFailedScenarioLogBuffer()]", function () {
    it("returns the logged failed scenario details", function () {
      summaryFormatter.appendStringToFailedScenarioLogBuffer("abc");
      expect(summaryFormatter.getFailedScenarioLogBuffer()).toBe("abc\n");
    });

    it("returns all logged failed scenario lines joined with a line break", function () {
      summaryFormatter.appendStringToFailedScenarioLogBuffer("abc");
      summaryFormatter.appendStringToFailedScenarioLogBuffer("def");
      expect(summaryFormatter.getFailedScenarioLogBuffer()).toBe("abc\ndef\n");
    });
  });

  describe("getUndefinedStepLogBuffer() [appendStringToUndefinedStepLogBuffer()]", function () {
    it("returns the logged undefined step details", function () {
      summaryFormatter.appendStringToUndefinedStepLogBuffer("abc");
      expect(summaryFormatter.getUndefinedStepLogBuffer()).toBe("abc\n");
    });

    it("returns all logged failed scenario lines joined with a line break", function () {
      summaryFormatter.appendStringToUndefinedStepLogBuffer("abc");
      summaryFormatter.appendStringToUndefinedStepLogBuffer("def");
      expect(summaryFormatter.getUndefinedStepLogBuffer()).toBe("abc\ndef\n");
    });
  });

  describe("appendStringToUndefinedStepLogBuffer() [getUndefinedStepLogBuffer()]", function () {
    it("does not log the same string twice", function () {
      summaryFormatter.appendStringToUndefinedStepLogBuffer("abcdef");
      summaryFormatter.appendStringToUndefinedStepLogBuffer("abcdef");
      expect(summaryFormatter.getUndefinedStepLogBuffer()).toBe("abcdef\n");
    });
  });

  describe("logSummary()", function () {
    var scenarioCount, passedScenarioCount, failedScenarioCount;
    var stepCount, passedStepCount;

    beforeEach(function () {
      spyOn(summaryFormatter, 'logScenariosSummary');
      spyOn(summaryFormatter, 'logStepsSummary');
      spyOn(summaryFormatter, 'logFailedStepResults');
      spyOn(summaryFormatter, 'logUndefinedStepSnippets');
      spyOnStub(statsJournal, 'witnessedAnyFailedStep');
      spyOnStub(statsJournal, 'witnessedAnyUndefinedStep');
      spyOnStub(statsJournal, 'logFailedStepResults');
      spyOnStub(statsJournal, 'logScenariosSummary');
      spyOnStub(statsJournal, 'logStepsSummary');
      spyOnStub(statsJournal, 'logUndefinedStepSnippets');
    });

    it("checks whether there are failed steps or not", function () {
      summaryFormatter.logSummary();
      expect(statsJournal.witnessedAnyFailedStep).toHaveBeenCalled();
    });

    describe("when there are failed steps", function () {
      beforeEach(function () {
        statsJournal.witnessedAnyFailedStep.andReturn(true);
      });

      it("logs the failed steps", function () {
        summaryFormatter.logSummary();
        expect(summaryFormatter.logFailedStepResults).toHaveBeenCalled();
      });
    });

    describe("when there are no failed steps", function () {
      beforeEach(function () {
        statsJournal.witnessedAnyFailedStep.andReturn(false);
      });

      it("does not log failed steps", function () {
        summaryFormatter.logSummary();
        expect(summaryFormatter.logFailedStepResults).not.toHaveBeenCalled();
      });
    });

    it("logs the scenarios summary", function () {
      summaryFormatter.logSummary();
      expect(summaryFormatter.logScenariosSummary).toHaveBeenCalled();
    });

    it("logs the steps summary", function () {
      summaryFormatter.logSummary();
      expect(summaryFormatter.logStepsSummary).toHaveBeenCalled();
    });

    it("checks whether there are undefined steps or not", function () {
      summaryFormatter.logSummary();
      expect(statsJournal.witnessedAnyUndefinedStep).toHaveBeenCalled();
    });

    describe("when there are undefined steps", function () {
      beforeEach(function () {
        statsJournal.witnessedAnyUndefinedStep.andReturn(true);
      });

      it("logs the undefined step snippets", function () {
        summaryFormatter.logSummary();
        expect(summaryFormatter.logUndefinedStepSnippets).toHaveBeenCalled();
      });
    });

    describe("when there are no undefined steps", function () {
      beforeEach(function () {
        statsJournal.witnessedAnyUndefinedStep.andReturn(false);
      });

      it("does not log the undefined step snippets", function () {
        summaryFormatter.logSummary();
        expect(summaryFormatter.logUndefinedStepSnippets).not.toHaveBeenCalled();
      });
    });
  });

  describe("logFailedStepResults()", function () {
    var failedScenarioLogBuffer;

    beforeEach(function () {
      failedScenarioLogBuffer = createSpy("failed scenario log buffer");
      spyOnStub(failedStepResults, 'syncForEach');
      spyOn(summaryFormatter, 'getFailedScenarioLogBuffer').andReturn(failedScenarioLogBuffer);
    });

    it("logs a failed steps header", function () {
      summaryFormatter.logFailedStepResults();
      expect(summaryFormatter.log).toHaveBeenCalledWith("(::) failed steps (::)\n\n");
    });

    it("iterates synchronously over the failed step results", function () {
      summaryFormatter.logFailedStepResults();
      expect(failedStepResults.syncForEach).toHaveBeenCalled();
      expect(failedStepResults.syncForEach).toHaveBeenCalledWithAFunctionAsNthParameter(1);
    });

    describe("for each failed step result", function () {
      var userFunction, failedStep, forEachCallback;

      beforeEach(function () {
        summaryFormatter.logFailedStepResults();
        userFunction     = failedStepResults.syncForEach.mostRecentCall.args[0];
        failedStepResult = createSpy("failed step result");
        spyOn(summaryFormatter, 'logFailedStepResult');
      });

      it("tells the visitor to visit the feature and call back when finished", function () {
        userFunction(failedStepResult);
        expect(summaryFormatter.logFailedStepResult).toHaveBeenCalledWith(failedStepResult);
      });
    });

    it("logs a failed scenarios header", function () {
      summaryFormatter.logFailedStepResults();
      expect(summaryFormatter.log).toHaveBeenCalledWith("Failing scenarios:\n");
    });

    it("gets the failed scenario details from its log buffer", function () {
      summaryFormatter.logFailedStepResults();
      expect(summaryFormatter.getFailedScenarioLogBuffer).toHaveBeenCalled();
    });

    it("logs the failed scenario details", function () {
      summaryFormatter.logFailedStepResults();
      expect(summaryFormatter.log).toHaveBeenCalledWith(failedScenarioLogBuffer);
    });

    it("logs a line break", function () {
      summaryFormatter.logFailedStepResults();
      expect(summaryFormatter.log).toHaveBeenCalledWith("\n");
    });
  });

  describe("logFailedStepResult()", function () {
    var stepResult, failureException;

    beforeEach(function () {
      failureException = createSpy('caught exception');
      stepResult       = createSpyWithStubs("failed step result", { getFailureException: failureException });
    });

    it("gets the failure exception from the step result", function () {
      summaryFormatter.logFailedStepResult(stepResult);
      expect(stepResult.getFailureException).toHaveBeenCalled();
    });

    describe("when the failure exception has a stack", function () {
      beforeEach(function () {
        failureException.stack = createSpy('failure exception stack');
      });

      it("logs the stack", function () {
        summaryFormatter.logFailedStepResult(stepResult);
        expect(summaryFormatter.log).toHaveBeenCalledWith(failureException.stack);
      });
    });

    describe("when the failure exception has no stack", function () {
      it("logs the exception itself", function () {
        summaryFormatter.logFailedStepResult(stepResult);
        expect(summaryFormatter.log).toHaveBeenCalledWith(failureException);
      });
    });

    it("logs two line breaks", function () {
      summaryFormatter.logFailedStepResult(stepResult);
      expect(summaryFormatter.log).toHaveBeenCalledWith("\n\n");
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
      spyOnStub(statsJournal, 'getScenarioCount').andReturn(scenarioCount);
      spyOnStub(statsJournal, 'getPassedScenarioCount').andReturn(passedScenarioCount);
      spyOnStub(statsJournal, 'getUndefinedScenarioCount').andReturn(undefinedScenarioCount);
      spyOnStub(statsJournal, 'getPendingScenarioCount').andReturn(pendingScenarioCount);
      spyOnStub(statsJournal, 'getFailedScenarioCount').andReturn(failedScenarioCount);
    });

    it("gets the number of scenarios", function () {
      summaryFormatter.logScenariosSummary();
      expect(statsJournal.getScenarioCount).toHaveBeenCalled();
    });

    describe("when there are no scenarios", function () {
      beforeEach(function () { statsJournal.getScenarioCount.andReturn(0); });

      it("logs 0 scenarios", function () {
        summaryFormatter.logScenariosSummary();
        expect(summaryFormatter.log).toHaveBeenCalledWithStringMatching(/0 scenarios/);
      });

      it("does not log any details", function () {
        summaryFormatter.logScenariosSummary();
        expect(summaryFormatter.log).not.toHaveBeenCalledWithStringMatching(/\(.*\)/);
      });
    });

    describe("when there are scenarios", function () {
      beforeEach(function () { statsJournal.getScenarioCount.andReturn(12); });

      describe("when there is one scenario", function () {
        beforeEach(function () { statsJournal.getScenarioCount.andReturn(1); });

        it("logs one scenario", function () {
          summaryFormatter.logScenariosSummary();
          expect(summaryFormatter.log).toHaveBeenCalledWithStringMatching(/1 scenario([^s]|$)/);
        });
      });

      describe("when there are 2 or more scenarios", function () {
        beforeEach(function () { statsJournal.getScenarioCount.andReturn(2); });

        it("logs two or more scenarios", function () {
          summaryFormatter.logScenariosSummary();
          expect(summaryFormatter.log).toHaveBeenCalledWithStringMatching(/2 scenarios/);
        });
      });

      it("gets the number of failed scenarios", function () {
        summaryFormatter.logScenariosSummary();
        expect(statsJournal.getFailedScenarioCount).toHaveBeenCalled();
      });

      describe("when there are no failed scenarios", function () {
        beforeEach(function () { statsJournal.getFailedScenarioCount.andReturn(0); });

        it("does not log failed scenarios", function () {
          summaryFormatter.logScenariosSummary();
          expect(summaryFormatter.log).not.toHaveBeenCalledWithStringMatching(/failed/);
        });
      });

      describe("when there is one failed scenario", function () {
        beforeEach(function () { statsJournal.getFailedScenarioCount.andReturn(1); });

        it("logs a failed scenario", function () {
          summaryFormatter.logScenariosSummary();
          expect(summaryFormatter.log).toHaveBeenCalledWithStringMatching(/1 failed/);
        });
      });

      describe("when there are two or more failed scenarios", function () {
        beforeEach(function () { statsJournal.getFailedScenarioCount.andReturn(2); });

        it("logs the number of failed scenarios", function () {
          summaryFormatter.logScenariosSummary();
          expect(summaryFormatter.log).toHaveBeenCalledWithStringMatching(/2 failed/);
        });
      });

      it("gets the number of undefined scenarios", function () {
        summaryFormatter.logScenariosSummary();
        expect(statsJournal.getUndefinedScenarioCount).toHaveBeenCalled();
      });

      describe("when there are no undefined scenarios", function () {
        beforeEach(function () { statsJournal.getUndefinedScenarioCount.andReturn(0); });

        it("does not log passed scenarios", function () {
          summaryFormatter.logScenariosSummary();
          expect(summaryFormatter.log).not.toHaveBeenCalledWithStringMatching(/undefined/);
        });
      });

      describe("when there is one undefined scenario", function () {
        beforeEach(function () { statsJournal.getUndefinedScenarioCount.andReturn(1); });

        it("logs one undefined scenario", function () {
          summaryFormatter.logScenariosSummary();
          expect(summaryFormatter.log).toHaveBeenCalledWithStringMatching(/1 undefined/);
        });
      });

      describe("when there are two or more undefined scenarios", function () {
        beforeEach(function () { statsJournal.getUndefinedScenarioCount.andReturn(2); });

        it("logs the undefined scenarios", function () {
          summaryFormatter.logScenariosSummary();
          expect(summaryFormatter.log).toHaveBeenCalledWithStringMatching(/2 undefined/);
        });
      });

      it("gets the number of pending scenarios", function () {
        summaryFormatter.logScenariosSummary();
        expect(statsJournal.getPendingScenarioCount).toHaveBeenCalled();
      });

      describe("when there are no pending scenarios", function () {
        beforeEach(function () { statsJournal.getPendingScenarioCount.andReturn(0); });

        it("does not log passed scenarios", function () {
          summaryFormatter.logScenariosSummary();
          expect(summaryFormatter.log).not.toHaveBeenCalledWithStringMatching(/pending/);
        });
      });

      describe("when there is one pending scenario", function () {
        beforeEach(function () { statsJournal.getPendingScenarioCount.andReturn(1); });

        it("logs one pending scenario", function () {
          summaryFormatter.logScenariosSummary();
          expect(summaryFormatter.log).toHaveBeenCalledWithStringMatching(/1 pending/);
        });
      });

      describe("when there are two or more pending scenarios", function () {
        beforeEach(function () { statsJournal.getPendingScenarioCount.andReturn(2); });

        it("logs the pending scenarios", function () {
          summaryFormatter.logScenariosSummary();
          expect(summaryFormatter.log).toHaveBeenCalledWithStringMatching(/2 pending/);
        });
      });

      it("gets the number of passed scenarios", function () {
        summaryFormatter.logScenariosSummary();
        expect(statsJournal.getPassedScenarioCount).toHaveBeenCalled();
      });

      describe("when there are no passed scenarios", function () {
        beforeEach(function () { statsJournal.getPassedScenarioCount.andReturn(0); });

        it("does not log passed scenarios", function () {
          summaryFormatter.logScenariosSummary();
          expect(summaryFormatter.log).not.toHaveBeenCalledWithStringMatching(/passed/);
        });
      });

      describe("when there is one passed scenario", function () {
        beforeEach(function () { statsJournal.getPassedScenarioCount.andReturn(1); });

        it("logs 1 passed scenarios", function () {
          summaryFormatter.logScenariosSummary();
          expect(summaryFormatter.log).toHaveBeenCalledWithStringMatching(/1 passed/);
        });
      });

      describe("when there are two or more passed scenarios", function () {
        beforeEach(function () { statsJournal.getPassedScenarioCount.andReturn(2); });

        it("logs the number of passed scenarios", function () {
          summaryFormatter.logScenariosSummary();
          expect(summaryFormatter.log).toHaveBeenCalledWithStringMatching(/2 passed/);
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
      spyOnStub(statsJournal, 'getStepCount').andReturn(stepCount);
      spyOnStub(statsJournal, 'getPassedStepCount').andReturn(passedStepCount);
      spyOnStub(statsJournal, 'getFailedStepCount').andReturn(failedStepCount);
      spyOnStub(statsJournal, 'getSkippedStepCount').andReturn(skippedStepCount);
      spyOnStub(statsJournal, 'getUndefinedStepCount').andReturn(undefinedStepCount);
      spyOnStub(statsJournal, 'getPendingStepCount').andReturn(pendingStepCount);
    });

    it("gets the number of steps", function () {
      summaryFormatter.logStepsSummary();
      expect(statsJournal.getStepCount).toHaveBeenCalled();
    });

    describe("when there are no steps", function () {
      beforeEach(function () {
        statsJournal.getStepCount.andReturn(0);
      });

      it("logs 0 steps", function () {
        summaryFormatter.logStepsSummary();
        expect(summaryFormatter.log).toHaveBeenCalledWithStringMatching(/0 steps/);
      });

      it("does not log any details", function () {
        summaryFormatter.logStepsSummary();
        expect(summaryFormatter.log).not.toHaveBeenCalledWithStringMatching(/\(.*\)/);
      });
    });

    describe("when there are steps", function () {
      beforeEach(function () { statsJournal.getStepCount.andReturn(13); });

      describe("when there is one step", function () {
        beforeEach(function () {
          statsJournal.getStepCount.andReturn(1);
        });

        it("logs 1 step", function () {
          summaryFormatter.logStepsSummary();
          expect(summaryFormatter.log).toHaveBeenCalledWithStringMatching(/1 step/);
        });
      });

      describe("when there are two or more steps", function () {
        beforeEach(function () {
          statsJournal.getStepCount.andReturn(2);
        });

        it("logs the number of steps", function () {
          summaryFormatter.logStepsSummary();
          expect(summaryFormatter.log).toHaveBeenCalledWithStringMatching(/2 steps/);
        });
      });

      it("gets the number of failed steps", function () {
        summaryFormatter.logStepsSummary();
        expect(statsJournal.getFailedStepCount).toHaveBeenCalled();
      });

      describe("when there are no failed steps", function () {
        beforeEach(function () {
          statsJournal.getFailedStepCount.andReturn(0);
        });

        it("does not log failed steps", function () {
          summaryFormatter.logStepsSummary();
          expect(summaryFormatter.log).not.toHaveBeenCalledWithStringMatching(/failed/);
        });
      });

      describe("when there is one failed step", function () {
        beforeEach(function () {
          statsJournal.getFailedStepCount.andReturn(1);
        });

        it("logs one failed step", function () {
          summaryFormatter.logStepsSummary();
          expect(summaryFormatter.log).toHaveBeenCalledWithStringMatching(/1 failed/);
        });
      });

      describe("when there is two or more failed steps", function () {
        beforeEach(function () {
          statsJournal.getFailedStepCount.andReturn(2);
        });

        it("logs the number of failed steps", function () {
          summaryFormatter.logStepsSummary();
          expect(summaryFormatter.log).toHaveBeenCalledWithStringMatching(/2 failed/);
        });
      });

      it("gets the number of undefined steps", function () {
        summaryFormatter.logStepsSummary();
        expect(statsJournal.getUndefinedStepCount).toHaveBeenCalled();
      });

      describe("when there are no undefined steps", function () {
        beforeEach(function () {
          statsJournal.getUndefinedStepCount.andReturn(0);
        });

        it("does not log undefined steps", function () {
          summaryFormatter.logStepsSummary();
          expect(summaryFormatter.log).not.toHaveBeenCalledWithStringMatching(/undefined/);
        });
      });

      describe("when there is one undefined step", function () {
        beforeEach(function () {
          statsJournal.getUndefinedStepCount.andReturn(1);
        });

        it("logs one undefined steps", function () {
          summaryFormatter.logStepsSummary();
          expect(summaryFormatter.log).toHaveBeenCalledWithStringMatching(/1 undefined/);
        });
      });

      describe("when there are two or more undefined steps", function () {
        beforeEach(function () {
          statsJournal.getUndefinedStepCount.andReturn(2);
        });

        it("logs the number of undefined steps", function () {
          summaryFormatter.logStepsSummary();
          expect(summaryFormatter.log).toHaveBeenCalledWithStringMatching(/2 undefined/);
        });
      });

      it("gets the number of pending steps", function () {
        summaryFormatter.logStepsSummary();
        expect(statsJournal.getPendingStepCount).toHaveBeenCalled();
      });

      describe("when there are no pending steps", function () {
        beforeEach(function () {
          statsJournal.getPendingStepCount.andReturn(0);
        });

        it("does not log pending steps", function () {
          summaryFormatter.logStepsSummary();
          expect(summaryFormatter.log).not.toHaveBeenCalledWithStringMatching(/pending/);
        });
      });

      describe("when there is one pending step", function () {
        beforeEach(function () {
          statsJournal.getPendingStepCount.andReturn(1);
        });

        it("logs one pending steps", function () {
          summaryFormatter.logStepsSummary();
          expect(summaryFormatter.log).toHaveBeenCalledWithStringMatching(/1 pending/);
        });
      });

      describe("when there are two or more pending steps", function () {
        beforeEach(function () {
          statsJournal.getPendingStepCount.andReturn(2);
        });

        it("logs the number of pending steps", function () {
          summaryFormatter.logStepsSummary();
          expect(summaryFormatter.log).toHaveBeenCalledWithStringMatching(/2 pending/);
        });
      });

      it("gets the number of skipped steps", function () {
        summaryFormatter.logStepsSummary();
        expect(statsJournal.getSkippedStepCount).toHaveBeenCalled();
      });

      describe("when there are no skipped steps", function () {
        beforeEach(function () {
          statsJournal.getSkippedStepCount.andReturn(0);
        });

        it("does not log skipped steps", function () {
          summaryFormatter.logStepsSummary();
          expect(summaryFormatter.log).not.toHaveBeenCalledWithStringMatching(/skipped/);
        });
      });

      describe("when there is one skipped step", function () {
        beforeEach(function () {
          statsJournal.getSkippedStepCount.andReturn(1);
        });

        it("logs one skipped steps", function () {
          summaryFormatter.logStepsSummary();
          expect(summaryFormatter.log).toHaveBeenCalledWithStringMatching(/1 skipped/);
        });
      });

      describe("when there are two or more skipped steps", function () {
        beforeEach(function () {
          statsJournal.getSkippedStepCount.andReturn(2);
        });

        it("logs the number of skipped steps", function () {
          summaryFormatter.logStepsSummary();
          expect(summaryFormatter.log).toHaveBeenCalledWithStringMatching(/2 skipped/);
        });
      });

      it("gets the number of passed steps", function () {
        summaryFormatter.logStepsSummary();
        expect(statsJournal.getPassedStepCount).toHaveBeenCalled();
      });

      describe("when there are no passed steps", function () {
        beforeEach(function () {
          statsJournal.getPassedStepCount.andReturn(0);
        });

        it("does not log passed steps", function () {
          summaryFormatter.logStepsSummary();
          expect(summaryFormatter.log).not.toHaveBeenCalledWithStringMatching(/passed/);
        });
      });

      describe("when there is one passed step", function () {
        beforeEach(function () {
          statsJournal.getPassedStepCount.andReturn(1);
        });

        it("logs one passed step", function () {
          summaryFormatter.logStepsSummary();
          expect(summaryFormatter.log).toHaveBeenCalledWithStringMatching(/1 passed/);
        });
      });

      describe("when there is two or more passed steps", function () {
        beforeEach(function () {
          statsJournal.getPassedStepCount.andReturn(2);
        });

        it("logs the number of passed steps", function () {
          summaryFormatter.logStepsSummary();
          expect(summaryFormatter.log).toHaveBeenCalledWithStringMatching(/2 passed/);
        });
      });
    });
  });

  describe("logUndefinedStepSnippets()", function () {
    var undefinedStepLogBuffer;

    beforeEach(function () {
      // Undefined Step Log buffer is string
      undefinedStepLogBuffer = 'undefinedStepsLogBuffer';
      spyOn(summaryFormatter, 'getUndefinedStepLogBuffer').andReturn(undefinedStepLogBuffer);
    });

    it("logs a little explanation about the snippets", function () {
      summaryFormatter.logUndefinedStepSnippets();
      expect(summaryFormatter.log).toHaveBeenCalledWith(color.format('pending', "\nYou can implement step definitions for undefined steps with these snippets:\n\n"));
    });

    it("gets the undefined steps log buffer", function () {
      summaryFormatter.logUndefinedStepSnippets();
      expect(summaryFormatter.getUndefinedStepLogBuffer).toHaveBeenCalled();
    });

    it("logs the undefined steps", function () {
      summaryFormatter.logUndefinedStepSnippets();
      expect(summaryFormatter.log).toHaveBeenCalledWith(color.format('pending', undefinedStepLogBuffer));
    });
  });
});
