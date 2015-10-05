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
    spyOn(Cucumber.Type, 'Collection').and.returnValue(failedStepResults);
    spyOn(Cucumber.Listener, 'Formatter').and.returnValue(formatter);
    spyOn(Cucumber.Listener, 'StatsJournal').and.returnValue(statsJournal);
    summaryFormatter = Cucumber.Listener.SummaryFormatter(options);
  });

  describe("constructor", function () {
    it("creates a formatter", function () {
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
      summaryFormatter.hear(event, callback);
      expect(statsJournal.hear).toHaveBeenCalled();
      expect(statsJournal.hear).toHaveBeenCalledWithValueAsNthParameter(event, 1);
      expect(statsJournal.hear).toHaveBeenCalledWithAFunctionAsNthParameter(2);
    });

    describe("stats journal callback", function () {
      var statsJournalCallback;

      beforeEach(function () {
        summaryFormatter.hear(event, callback);
        statsJournalCallback = statsJournal.hear.calls.mostRecent().args[1];
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
        stepResult.isUndefined.and.returnValue(true);
        spyOn(summaryFormatter, 'handleUndefinedStepResult');
      });

      it("handles the undefined step result", function () {
        summaryFormatter.handleStepResultEvent(event, callback);
        expect(summaryFormatter.handleUndefinedStepResult).toHaveBeenCalledWith(stepResult);
      });
    });

    describe("when the step was not undefined", function () {
      beforeEach(function () {
        stepResult.isUndefined.and.returnValue(false);
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
          stepResult.isFailed.and.returnValue(true);
        });

        it("handles the failed step result", function () {
          summaryFormatter.handleStepResultEvent(event, callback);
          expect(summaryFormatter.handleFailedStepResult).toHaveBeenCalledWith(stepResult);
        });
      });

      describe("when the step did not fail", function () {
        beforeEach(function () {
          stepResult.isFailed.and.returnValue(false);
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
      spyOn(summaryFormatter, 'storeUndefinedStepResult');
    });

    it("gets the step from the step result", function () {
      summaryFormatter.handleUndefinedStepResult(stepResult);
      expect(stepResult.getStep).toHaveBeenCalled();
    });

    it("stores the undefined step", function () {
      summaryFormatter.handleUndefinedStepResult(stepResult);
      expect(summaryFormatter.storeUndefinedStepResult).toHaveBeenCalledWith(step);
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
        statsJournal.isCurrentScenarioFailing.and.returnValue(true);
        spyOn(summaryFormatter, 'storeFailedScenario');
        spyOnStub(event, 'getPayloadItem').and.returnValue(scenario);
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
        statsJournal.isCurrentScenarioFailing.and.returnValue(false);
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
    var path = require('path');

    var failedScenario, name, relativeUri, uri, line, string;

    beforeEach(function () {
      name           = "some failed scenario";
      relativeUri    = path.normalize("path/to/some.feature");
      uri            = path.join(process.cwd(), relativeUri);
      line           = "123";
      string         = relativeUri + ":" + line + " # Scenario: " + name;
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

  describe("storeUndefinedStepResult()", function () {
    var snippetBuilderSyntax, numberMatchingGroup, snippetBuilder, snippet, step;

    beforeEach(function () {
      numberMatchingGroup  = createSpy("snippet number matching group");
      snippetBuilderSyntax = createSpyWithStubs("snippet builder syntax", {getNumberMatchingGroup: numberMatchingGroup});
      step           = createSpy("step");
      snippet        = createSpy("step definition snippet");
      snippetBuilder = createSpyWithStubs("snippet builder", {buildSnippet: snippet});
      spyOn(Cucumber.SupportCode, 'StepDefinitionSnippetBuilder').and.returnValue(snippetBuilder);
      spyOn(summaryFormatter, 'appendStringToUndefinedStepLogBuffer');
      spyOn(summaryFormatter, 'getStepDefinitionSyntax').and.returnValue(snippetBuilderSyntax);
    });

    it("creates a new step definition snippet builder", function () {
      summaryFormatter.storeUndefinedStepResult(step, snippetBuilderSyntax);
      expect(Cucumber.SupportCode.StepDefinitionSnippetBuilder).toHaveBeenCalledWith(step, snippetBuilderSyntax);
    });

    it("builds the step definition", function () {
      summaryFormatter.storeUndefinedStepResult(step, snippetBuilderSyntax);
      expect(snippetBuilder.buildSnippet).toHaveBeenCalled();
    });

    it("appends the snippet to the undefined step log buffer", function () {
      summaryFormatter.storeUndefinedStepResult(step, snippetBuilderSyntax);
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
        statsJournal.witnessedAnyFailedStep.and.returnValue(true);
      });

      it("logs the failed steps", function () {
        summaryFormatter.logSummary();
        expect(summaryFormatter.logFailedStepResults).toHaveBeenCalled();
      });
    });

    describe("when there are no failed steps", function () {
      beforeEach(function () {
        statsJournal.witnessedAnyFailedStep.and.returnValue(false);
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
        statsJournal.witnessedAnyUndefinedStep.and.returnValue(true);
      });

      it("logs the undefined step snippets", function () {
        summaryFormatter.logSummary();
        expect(summaryFormatter.logUndefinedStepSnippets).toHaveBeenCalled();
      });
    });

    describe("when there are no undefined steps", function () {
      beforeEach(function () {
        statsJournal.witnessedAnyUndefinedStep.and.returnValue(false);
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
      spyOnStub(failedStepResults, 'forEach');
      spyOn(summaryFormatter, 'getFailedScenarioLogBuffer').and.returnValue(failedScenarioLogBuffer);
    });

    it("logs a failed steps header", function () {
      summaryFormatter.logFailedStepResults();
      expect(summaryFormatter.log).toHaveBeenCalledWith("(::) failed steps (::)\n\n");
    });

    it("iterates synchronously over the failed step results", function () {
      summaryFormatter.logFailedStepResults();
      expect(failedStepResults.forEach).toHaveBeenCalled();
      expect(failedStepResults.forEach).toHaveBeenCalledWithAFunctionAsNthParameter(1);
    });

    describe("for each failed step result", function () {
      var userFunction, failedStepResult;

      beforeEach(function () {
        summaryFormatter.logFailedStepResults();
        userFunction     = failedStepResults.forEach.calls.mostRecent().args[0];
        failedStepResult = createSpy("failed step result");
        spyOn(summaryFormatter, 'logFailedStepResult');
      });

      it("tells the visitor to visit the feature and call back when finished", function () {
        userFunction (failedStepResult);
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

  describe("logCountSummary()", function () {
    var counts;

    beforeEach(function () {
      counts = {
        failed: 0,
        passed: 0,
        pending: 0,
        skipped: 0,
        undefined: 0
      };
    });

    describe("when the total is 0", function () {
      beforeEach(function () {
        summaryFormatter.logCountSummary('item', counts);
      });

      it("logs 0 items", function () {
        expect(summaryFormatter.log).toHaveBeenCalledWithStringMatching(/0 items/);
      });

      it("does not log any details", function () {
        expect(summaryFormatter.log).not.toHaveBeenCalledWithStringMatching(/\(.*\)/);
      });
    });

    describe("when the total is 1", function () {
      beforeEach(function () {
        counts.passed = 1;
        summaryFormatter.logCountSummary('item', counts);
      });

      it("logs 1 item", function () {
        expect(summaryFormatter.log).toHaveBeenCalledWithStringMatching(/1 item/);
      });
    });

    describe("when the total is 2", function () {
      beforeEach(function () {
        counts.passed = 2;
        summaryFormatter.logCountSummary('item', counts);
      });

      it("logs 2 items", function () {
        expect(summaryFormatter.log).toHaveBeenCalledWithStringMatching(/2 items/);
      });
    });

    describe("when there are no failed items", function () {
      it("does not log failed items", function () {
        summaryFormatter.logCountSummary('item', counts);
        expect(summaryFormatter.log).not.toHaveBeenCalledWithStringMatching(/failed/);
      });
    });

    describe("when there is one failed item", function () {
      beforeEach(function () { counts.failed = 1; });

      it("logs a failed item", function () {
        summaryFormatter.logCountSummary('item', counts);
        expect(summaryFormatter.log).toHaveBeenCalledWithStringMatching(/1 failed/);
      });
    });

    describe("when there are no passed items", function () {
      it("does not log passed items", function () {
        summaryFormatter.logCountSummary('item', counts);
        expect(summaryFormatter.log).not.toHaveBeenCalledWithStringMatching(/passed/);
      });
    });

    describe("when there is one passed item", function () {
      beforeEach(function () { counts.passed = 1; });

      it("logs a passed item", function () {
        summaryFormatter.logCountSummary('item', counts);
        expect(summaryFormatter.log).toHaveBeenCalledWithStringMatching(/1 passed/);
      });
    });

    describe("when there are no pending items", function () {
      it("does not log pending items", function () {
        summaryFormatter.logCountSummary('item', counts);
        expect(summaryFormatter.log).not.toHaveBeenCalledWithStringMatching(/pending/);
      });
    });

    describe("when there is one pending item", function () {
      beforeEach(function () { counts.pending = 1; });

      it("logs a pending item", function () {
        summaryFormatter.logCountSummary('item', counts);
        expect(summaryFormatter.log).toHaveBeenCalledWithStringMatching(/1 pending/);
      });
    });

    describe("when there are no skipped items", function () {
      it("does not log skipped items", function () {
        summaryFormatter.logCountSummary('item', counts);
        expect(summaryFormatter.log).not.toHaveBeenCalledWithStringMatching(/skipped/);
      });
    });

    describe("when there is one skipped item", function () {
      beforeEach(function () { counts.skipped = 1; });

      it("logs a skipped item", function () {
        summaryFormatter.logCountSummary('item', counts);
        expect(summaryFormatter.log).toHaveBeenCalledWithStringMatching(/1 skipped/);
      });
    });

    describe("when there are no undefined items", function () {
      it("does not log undefined items", function () {
        summaryFormatter.logCountSummary('item', counts);
        expect(summaryFormatter.log).not.toHaveBeenCalledWithStringMatching(/undefined/);
      });
    });

    describe("when there is one undefined item", function () {
      beforeEach(function () { counts.undefined = 1; });

      it("logs a undefined item", function () {
        summaryFormatter.logCountSummary('item', counts);
        expect(summaryFormatter.log).toHaveBeenCalledWithStringMatching(/1 undefined/);
      });
    });
  });

  describe("logUndefinedStepSnippets()", function () {
    var undefinedStepLogBuffer;

    beforeEach(function () {
      // Undefined Step Log buffer is string
      undefinedStepLogBuffer = 'undefinedStepsLogBuffer';
      spyOn(summaryFormatter, 'getUndefinedStepLogBuffer').and.returnValue(undefinedStepLogBuffer);
      // switch snippet output on
      options.snippets = true;
    });

    it("logs a little explanation about the snippets", function () {
      summaryFormatter.logUndefinedStepSnippets();
      var expectedString = Cucumber.Util.Colors.pending("\nYou can implement step definitions for undefined steps with these snippets:\n\n");
      expect(summaryFormatter.log).toHaveBeenCalledWith(expectedString);
    });

    it("gets the undefined steps log buffer", function () {
      summaryFormatter.logUndefinedStepSnippets();
      expect(summaryFormatter.getUndefinedStepLogBuffer).toHaveBeenCalled();
    });

    it("logs the undefined steps", function () {
      summaryFormatter.logUndefinedStepSnippets();
      var expectedString = Cucumber.Util.Colors.pending(undefinedStepLogBuffer);
      expect(summaryFormatter.log).toHaveBeenCalledWith(expectedString);
    });
  });
});
