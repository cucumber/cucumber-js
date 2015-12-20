require('../../support/spec_helper');

describe("Cucumber.Listener.SummaryFormatter", function () {
  var Cucumber = requireLib('cucumber');
  var colors = require('colors/safe');
  colors.enabled = true;
  var formatter, formatterHearMethod, summaryFormatter, options;

  beforeEach(function () {
    options              = {useColors: true};
    formatter            = createSpyWithStubs("formatter", {finish: null, log: null});
    formatterHearMethod  = spyOnStub(formatter, 'hear');
    spyOn(Cucumber.Listener, 'Formatter').and.returnValue(formatter);
    summaryFormatter = Cucumber.Listener.SummaryFormatter(options);
  });

  describe("constructor", function () {
    it("creates a formatter", function () {
      expect(Cucumber.Listener.Formatter).toHaveBeenCalledWith(options);
    });

    it("extends the formatter", function () {
      expect(summaryFormatter).toBe(formatter);
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

  describe("handleScenarioResultEvent()", function () {
    var scenario, scenarioResult, event, callback;

    beforeEach(function () {
      scenario = createSpy("scenario");
      scenarioResult = createSpyWithStubs("scenario result", {getScenario: scenario, getStatus: undefined});
      event = createSpyWithStubs("event", {getPayloadItem: scenarioResult});
      callback = createSpy("callback");
      spyOn(summaryFormatter, 'storeFailedScenario');
    });

    describe("when the current scenario failed", function () {
      beforeEach(function () {
        scenarioResult.getStatus.and.returnValue(Cucumber.Status.FAILED);
        summaryFormatter.handleScenarioResultEvent(event, callback);
      });

      it("stores the failed scenario", function () {
        expect(summaryFormatter.storeFailedScenario).toHaveBeenCalledWith(scenario);
      });
    });

    describe("when the current scenario did not fail", function () {
      beforeEach(function () {
        scenarioResult.getStatus.and.returnValue(Cucumber.Status.PASSED);
        summaryFormatter.handleScenarioResultEvent(event, callback);
      });

      it("does not store the failed scenario", function () {
        expect(summaryFormatter.storeFailedScenario).not.toHaveBeenCalled();
      });
    });

    it("calls back", function () {
      summaryFormatter.handleScenarioResultEvent(event, callback);
      expect(callback).toHaveBeenCalled();
    });
  });

  describe("handleFeaturesResultEvent()", function () {
    var featuresResult, callback, event;

    beforeEach(function () {
      featuresResult = createSpy("features result");
      event = createSpyWithStubs("event", {getPayloadItem: featuresResult});
      callback = createSpy("callback");
      spyOn(summaryFormatter, 'logSummary');
      summaryFormatter.handleFeaturesResultEvent(event, callback);
    });

    it("logs the summary", function () {
      expect(summaryFormatter.logSummary).toHaveBeenCalledWith(featuresResult);
    });

    it("calls finish with the callback", function () {
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
    var featuresResult;

    beforeEach(function () {
      featuresResult = createSpy('features result');
      spyOn(summaryFormatter, 'logScenariosSummary');
      spyOn(summaryFormatter, 'logStepsSummary');
      spyOn(summaryFormatter, 'logDuration');
      spyOn(summaryFormatter, 'logFailedStepResults');
      spyOn(summaryFormatter, 'logUndefinedStepSnippets');
      spyOn(summaryFormatter, 'logFailedScenarios');
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
        summaryFormatter.logSummary(featuresResult);
        expect(summaryFormatter.logFailedStepResults).toHaveBeenCalled();
      });

      it("logs the failed scenarions", function () {
        summaryFormatter.logSummary(featuresResult);
        expect(summaryFormatter.logFailedScenarios).toHaveBeenCalled();
      });

      describe("when hiding failed steps", function () {
        beforeEach(function () {
          options.hideFailedStepResults = true;
        });

        it("does not log the failed steps", function () {
          summaryFormatter.logSummary(featuresResult);
          expect(summaryFormatter.logFailedStepResults).not.toHaveBeenCalled();
        });
      });
    });

    describe("when there are no failed steps", function () {
      it("does not log failed steps", function () {
        summaryFormatter.logSummary(featuresResult);
        expect(summaryFormatter.logFailedStepResults).not.toHaveBeenCalled();
      });
    });

    it("logs the scenarios summary", function () {
      summaryFormatter.logSummary(featuresResult);
      expect(summaryFormatter.logScenariosSummary).toHaveBeenCalledWith(featuresResult);
    });

    it("logs the steps summary", function () {
      summaryFormatter.logSummary(featuresResult);
      expect(summaryFormatter.logStepsSummary).toHaveBeenCalledWith(featuresResult);
    });

    it("logs the duration", function () {
      summaryFormatter.logSummary(featuresResult);
      expect(summaryFormatter.logDuration).toHaveBeenCalledWith(featuresResult);
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
        summaryFormatter.logSummary(featuresResult);
        expect(summaryFormatter.logUndefinedStepSnippets).toHaveBeenCalled();
      });
    });

    describe("when there are no undefined steps", function () {
      it("does not log the undefined step snippets", function () {
        summaryFormatter.logSummary(featuresResult);
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
    var featuresResult;

    beforeEach(function () {
      featuresResult = createSpyWithStubs('features result', {getDuration: null});
    });

    describe('with duration less than a second', function (){
      beforeEach(function () {
        featuresResult.getDuration.and.returnValue(1e6);
      });

      it("logs the duration", function () {
        summaryFormatter.logDuration(featuresResult);
        expect(summaryFormatter.log).toHaveBeenCalledWith('0m00.001s\n');
      });
    });

    describe('with duration that is a few seconds', function (){
      beforeEach(function () {
        featuresResult.getDuration.and.returnValue(12345 * 1e6);
      });

      it("logs the duration", function () {
        summaryFormatter.logDuration(featuresResult);
        expect(summaryFormatter.log).toHaveBeenCalledWith('0m12.345s\n');
      });
    });

    describe('with duration that is a few minutes', function (){
      beforeEach(function () {
        featuresResult.getDuration.and.returnValue(12 * 60 * 1e9 + 34567 * 1e6);
      });

      it("logs the duration", function () {
        summaryFormatter.logDuration(featuresResult);
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
