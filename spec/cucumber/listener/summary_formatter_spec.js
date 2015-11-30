require('../../support/spec_helper');

describe("Cucumber.Listener.SummaryFormatter", function () {
  var Cucumber = requireLib('cucumber');
  var colors = require('colors/safe');
  colors.enabled = true;
  var formatter, formatterHearMethod, summaryFormatter, statsJournal, options;

  beforeEach(function () {
    options              = {useColors: true};
    formatter            = createSpyWithStubs("formatter", {finish: null, log: null});
    formatterHearMethod  = spyOnStub(formatter, 'hear');
    statsJournal         = createSpy("stats journal");
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
      stepResult = createSpyWithStubs("step result", {getStatus: undefined});
      event      = createSpyWithStubs("event", {getPayloadItem: stepResult});
      callback   = createSpy("Callback");
    });

    it("gets the step result from the event payload", function () {
      summaryFormatter.handleStepResultEvent(event, callback);
      expect(event.getPayloadItem).toHaveBeenCalledWith('stepResult');
    });

    describe("when the step was ambiguous", function () {
      beforeEach(function () {
        stepResult.getStatus.and.returnValue(Cucumber.Status.AMBIGUOUS);
        spyOn(summaryFormatter, 'storeAmbiguousStepResult');
      });

      it("handles the undefined step result", function () {
        summaryFormatter.handleStepResultEvent(event, callback);
        expect(summaryFormatter.storeAmbiguousStepResult).toHaveBeenCalledWith(stepResult);
      });
    });

    describe("when the step was undefined", function () {
      beforeEach(function () {
        stepResult.getStatus.and.returnValue(Cucumber.Status.UNDEFINED);
        spyOn(summaryFormatter, 'storeUndefinedStepResult');
      });

      it("handles the undefined step result", function () {
        summaryFormatter.handleStepResultEvent(event, callback);
        expect(summaryFormatter.storeUndefinedStepResult).toHaveBeenCalledWith(stepResult);
      });
    });

    describe("when the step failed", function () {
      beforeEach(function () {
        stepResult.getStatus.and.returnValue(Cucumber.Status.FAILED);
        spyOn(summaryFormatter, 'storeFailedStepResult');
      });

      it("handles the failed step result", function () {
        summaryFormatter.handleStepResultEvent(event, callback);
        expect(summaryFormatter.storeFailedStepResult).toHaveBeenCalledWith(stepResult);
      });
    });

    it("calls back", function () {
      summaryFormatter.handleStepResultEvent(event, callback);
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

    it("calls finish with the callback", function () {
      summaryFormatter.handleAfterFeaturesEvent(event, callback);
      expect(summaryFormatter.finish).toHaveBeenCalledWith(callback);
    });
  });


  describe("storeFailedStepResult()", function () {
    var failureException, stepResult;

    beforeEach(function () {
      spyOn(summaryFormatter, 'appendStringToFailedStepResultLogBuffer');
    });

    describe("when the failure exception has a stack", function () {
      beforeEach(function () {
        failureException = {stack: 'failure exception stack'};
        stepResult       = createSpyWithStubs("failed step result", { getFailureException: failureException });
      });

      it("appends the stack to the failed step results log buffer", function () {
        summaryFormatter.storeFailedStepResult(stepResult);
        expect(summaryFormatter.appendStringToFailedStepResultLogBuffer).toHaveBeenCalledWith('failure exception stack');
      });
    });

    describe("when the failure exception has no stack", function () {
      beforeEach(function () {
        failureException = 'failure exception';
        stepResult       = createSpyWithStubs("failed step result", { getFailureException: failureException });
      });

      it("appends the expception to the failed step results log buffer", function () {
        summaryFormatter.storeFailedStepResult(stepResult);
        expect(summaryFormatter.appendStringToFailedStepResultLogBuffer).toHaveBeenCalledWith('failure exception');
      });
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
    var snippetSyntax, snippetBuilder, snippet, step, stepResult;

    beforeEach(function () {
      snippetSyntax  = createSpyWithStubs("snippet syntax");
      step           = createSpy("step");
      stepResult     = createSpyWithStubs("step result", {getStep: step});
      snippet        = createSpy("step definition snippet");
      snippetBuilder = createSpyWithStubs("snippet builder", {buildSnippet: snippet});
      spyOn(Cucumber.SupportCode, 'StepDefinitionSnippetBuilder').and.returnValue(snippetBuilder);
      spyOn(summaryFormatter, 'appendStringToUndefinedStepLogBuffer');
      options.snippetSyntax = snippetSyntax;
    });

    it("creates a new step definition snippet builder", function () {
      summaryFormatter.storeUndefinedStepResult(stepResult);
      expect(Cucumber.SupportCode.StepDefinitionSnippetBuilder).toHaveBeenCalledWith(step, snippetSyntax);
    });

    it("builds the step definition", function () {
      summaryFormatter.storeUndefinedStepResult(stepResult);
      expect(snippetBuilder.buildSnippet).toHaveBeenCalled();
    });

    it("appends the snippet to the undefined step log buffer", function () {
      summaryFormatter.storeUndefinedStepResult(stepResult);
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
      spyOn(summaryFormatter, 'logDuration');
      spyOn(summaryFormatter, 'logFailedStepResults');
      spyOn(summaryFormatter, 'logUndefinedStepSnippets');
      spyOn(summaryFormatter, 'logFailedScenarios');
      spyOnStub(statsJournal, 'witnessedAnyFailedStep');
      spyOnStub(statsJournal, 'witnessedAnyUndefinedStep');
    });

    describe("when there are failed steps", function () {
      beforeEach(function () {
        var name           = "some failed scenario";
        var uri            = "some uri";
        var line           = "123";
        var failedScenario = createSpyWithStubs("failedScenario", {getName: name, getUri: uri, getLine: line});
        summaryFormatter.storeFailedScenario(failedScenario);
      });

      it("logs the failed steps", function () {
        summaryFormatter.logSummary();
        expect(summaryFormatter.logFailedStepResults).toHaveBeenCalled();
      });

      it("logs the failed scenarions", function () {
        summaryFormatter.logSummary();
        expect(summaryFormatter.logFailedScenarios).toHaveBeenCalled();
      });

      describe("when hiding failed steps", function () {
        beforeEach(function () {
          options.hideFailedStepResults = true;
        });

        it("does not log the failed steps", function () {
          summaryFormatter.logSummary();
          expect(summaryFormatter.logFailedStepResults).not.toHaveBeenCalled();
        });
      });
    });

    describe("when there are no failed steps", function () {
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

    it("logs the duration", function () {
      summaryFormatter.logSummary();
      expect(summaryFormatter.logDuration).toHaveBeenCalled();
    });

    describe("when there are undefined steps", function () {
      beforeEach(function () {
        var step = createSpy("step");
        var stepResult = createSpy("step result", {getStep: step});
        var snippet = createSpy("step definition snippet");
        var snippetBuilder = createSpyWithStubs("snippet builder", {buildSnippet: snippet});
        spyOn(Cucumber.SupportCode, 'StepDefinitionSnippetBuilder').and.returnValue(snippetBuilder);
        summaryFormatter.storeUndefinedStepResult(stepResult);
      });

      it("logs the undefined step snippets", function () {
        summaryFormatter.logSummary();
        expect(summaryFormatter.logUndefinedStepSnippets).toHaveBeenCalled();
      });
    });

    describe("when there are no undefined steps", function () {
      it("does not log the undefined step snippets", function () {
        summaryFormatter.logSummary();
        expect(summaryFormatter.logUndefinedStepSnippets).not.toHaveBeenCalled();
      });
    });
  });

  describe("logFailedStepResults()", function () {
    var failedStepResultLogBuffer;

    beforeEach(function () {
      failedStepResultLogBuffer = "failed step result log buffer";
      spyOn(summaryFormatter, 'getFailedStepResultLogBuffer').and.returnValue(failedStepResultLogBuffer);
      summaryFormatter.logFailedStepResults();
    });

    it("logs a failed step results header", function () {
      expect(summaryFormatter.log).toHaveBeenCalledWith('(::) failed steps (::)\n\n');
    });

    it("logs the failed step results details", function () {
      expect(summaryFormatter.log).toHaveBeenCalledWith(failedStepResultLogBuffer);
    });
  });

  describe("logFailedScenarios()", function () {
    var failedScenarioLogBuffer;

    beforeEach(function () {
      failedScenarioLogBuffer = createSpy("failed scenario log buffer");
      spyOn(summaryFormatter, 'getFailedScenarioLogBuffer').and.returnValue(failedScenarioLogBuffer);
      summaryFormatter.logFailedScenarios();
    });

    it("logs a failed scenarios header", function () {
      expect(summaryFormatter.log).toHaveBeenCalledWith("Failing scenarios:\n");
    });

    it("gets the failed scenario details from its log buffer", function () {
      expect(summaryFormatter.getFailedScenarioLogBuffer).toHaveBeenCalled();
    });

    it("logs the failed scenario details", function () {
      expect(summaryFormatter.log).toHaveBeenCalledWith(failedScenarioLogBuffer);
    });

    it("logs a line break", function () {
      expect(summaryFormatter.log).toHaveBeenCalledWith("\n");
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

  describe("logDuration()", function () {
    describe('with duration less than a second', function (){
      beforeEach(function () {
        spyOnStub(statsJournal, 'getDuration').and.returnValue(1e6);
      });

      it("logs the duration", function () {
        summaryFormatter.logDuration();
        expect(summaryFormatter.log).toHaveBeenCalledWith('0m00.001s\n');
      });
    });

    describe('with duration that is a few seconds', function (){
      beforeEach(function () {
        spyOnStub(statsJournal, 'getDuration').and.returnValue(12345 * 1e6);
      });

      it("logs the duration", function () {
        summaryFormatter.logDuration();
        expect(summaryFormatter.log).toHaveBeenCalledWith('0m12.345s\n');
      });
    });

    describe('with duration that is a few minutes', function (){
      beforeEach(function () {
        spyOnStub(statsJournal, 'getDuration').and.returnValue(12 * 60 * 1e9 + 34567 * 1e6);
      });

      it("logs the duration", function () {
        summaryFormatter.logDuration();
        expect(summaryFormatter.log).toHaveBeenCalledWith('12m34.567s\n');
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
      var expectedString = colors.yellow("\nYou can implement step definitions for undefined steps with these snippets:\n\n");
      expect(summaryFormatter.log).toHaveBeenCalledWith(expectedString);
    });

    it("gets the undefined steps log buffer", function () {
      summaryFormatter.logUndefinedStepSnippets();
      expect(summaryFormatter.getUndefinedStepLogBuffer).toHaveBeenCalled();
    });

    it("logs the undefined steps", function () {
      summaryFormatter.logUndefinedStepSnippets();
      var expectedString = colors.yellow(undefinedStepLogBuffer);
      expect(summaryFormatter.log).toHaveBeenCalledWith(expectedString);
    });
  });
});
