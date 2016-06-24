var path = require('path');
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
    var stepResult;

    beforeEach(function () {
      stepResult = createSpyWithStubs("step result", {getStatus: undefined});
    });

    describe("when the step was ambiguous", function () {
      beforeEach(function () {
        stepResult.getStatus.and.returnValue(Cucumber.Status.AMBIGUOUS);
        spyOn(summaryFormatter, 'storeAmbiguousStepResult');
      });

      it("handles the undefined step result", function () {
        summaryFormatter.handleStepResultEvent(stepResult);
        expect(summaryFormatter.storeAmbiguousStepResult).toHaveBeenCalledWith(stepResult);
      });
    });

    describe("when the step was undefined", function () {
      beforeEach(function () {
        stepResult.getStatus.and.returnValue(Cucumber.Status.UNDEFINED);
        spyOn(summaryFormatter, 'storeUndefinedStepResult');
      });

      it("handles the undefined step result", function () {
        summaryFormatter.handleStepResultEvent(stepResult);
        expect(summaryFormatter.storeUndefinedStepResult).toHaveBeenCalledWith(stepResult);
      });
    });

    describe("when the step failed", function () {
      beforeEach(function () {
        stepResult.getStatus.and.returnValue(Cucumber.Status.FAILED);
        spyOn(summaryFormatter, 'storeFailedStepResult');
      });

      it("handles the failed step result", function () {
        summaryFormatter.handleStepResultEvent(stepResult);
        expect(summaryFormatter.storeFailedStepResult).toHaveBeenCalledWith(stepResult);
      });
    });
  });

  describe("handleFeaturesResultEvent()", function () {
    var featuresResult, callback;

    beforeEach(function () {
      featuresResult = createSpy("features result");
      callback = createSpy("callback");
      spyOn(summaryFormatter, 'logSummary');
      summaryFormatter.handleFeaturesResultEvent(featuresResult, callback);
    });

    it("logs the summary", function () {
      expect(summaryFormatter.logSummary).toHaveBeenCalledWith(featuresResult);
    });

    it("calls finish with the callback", function () {
      expect(summaryFormatter.finish).toHaveBeenCalledWith(callback);
    });
  });

  describe("logSummary()", function () {
    var featuresResult;

    beforeEach(function () {
      featuresResult = createSpy('features result');
      spyOn(summaryFormatter, 'logScenariosSummary');
      spyOn(summaryFormatter, 'logStepsSummary');
      spyOn(summaryFormatter, 'logDuration');
      spyOn(summaryFormatter, 'logFailures');
      spyOn(summaryFormatter, 'logWarnings');
    });

    describe("without failures or warnings", function () {
      beforeEach(function() {
        summaryFormatter.logSummary(featuresResult);
      });

      it("does not log failures", function () {
        expect(summaryFormatter.logFailures).not.toHaveBeenCalled();
      });

      it("does not log warnings", function () {
        expect(summaryFormatter.logWarnings).not.toHaveBeenCalled();
      });
    });

    describe("when there is a failed step", function () {
      beforeEach(function () {
        var failureException = {stack: 'failure exception stack'};
        var stepResult = createSpyWithStubs("failed step result", { getFailureException: failureException });
        summaryFormatter.storeFailedStepResult(stepResult);
        summaryFormatter.logSummary(featuresResult);
      });

      it("logs the failures", function () {
        expect(summaryFormatter.logFailures).toHaveBeenCalled();
      });
    });

    describe("when there is an ambiguous step", function () {
      beforeEach(function () {
        var stepDefintion1 = createSpyWithStubs('step defintion', {getPattern: 'a', getUri: 'path/1', getLine: 1});
        var stepDefintion2 = createSpyWithStubs('step defintion', {getPattern: 'b', getUri: 'path/2', getLine: 2});
        var stepResult = createSpyWithStubs("step result", {getAmbiguousStepDefinitions: [stepDefintion1, stepDefintion2]});
        summaryFormatter.storeAmbiguousStepResult(stepResult);
        summaryFormatter.logSummary(featuresResult);
      });

      it("logs the failures", function () {
        expect(summaryFormatter.logFailures).toHaveBeenCalled();
      });
    });

    describe("when there is an undefined step", function () {
      beforeEach(function () {
        var step = createSpy("step");
        var stepResult = createSpy("step result", {getStep: step});
        var snippetBuilder = createSpyWithStubs("snippet builder", {buildSnippet: 'snippet'});
        spyOn(Cucumber.SupportCode, 'StepDefinitionSnippetBuilder').and.returnValue(snippetBuilder);
        summaryFormatter.storeUndefinedStepResult(stepResult);
        summaryFormatter.logSummary(featuresResult);
      });

      it("logs the warnings", function () {
        expect(summaryFormatter.logWarnings).toHaveBeenCalled();
      });
    });

    describe("when there is a pending step", function () {
      beforeEach(function () {
        var stepResult = createSpyWithStubs("step result", {getPendingReason: 'not ready'});
        summaryFormatter.storePendingStepResult(stepResult);
        summaryFormatter.logSummary(featuresResult);
      });

      it("logs warnings", function () {
        expect(summaryFormatter.logWarnings).toHaveBeenCalled();
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
  });

  describe("logFailures()", function () {
    var scenario, step;

    beforeEach(function() {
      scenario = createSpyWithStubs('step', {getName: 'scenarioName', getUri: 'path/to/scenario', getLine: 1, hasUri: true});
      step = createSpyWithStubs('step', {getKeyword: 'stepKeyword ', getName: 'stepName', getUri: 'path/to/step', getLine: 2, getScenario: scenario, hasUri: true});
    });

    describe("when there is a failed step", function () {
      beforeEach(function () {
        var stepDefintion = createSpyWithStubs('step defintion', {getPattern: 'a', getUri: 'path/to/stepDefintion', getLine: 3});
        var failureException = {stack: 'failure exception stack'};
        var stepResult = createSpyWithStubs("failed step result", {getFailureException: failureException, getStatus: Cucumber.Status.FAILED, getStepDefinition: stepDefintion, getStep: step});
        summaryFormatter.storeFailedStepResult(stepResult);
      });

      it("logs the failures", function () {
        summaryFormatter.logFailures();
        expect(summaryFormatter.log).toHaveBeenCalledWith('Failures:\n\n');
        var expected =
          '1) Scenario: ' + colors.bold('scenarioName') + ' - ' + colors.gray(path.normalize('path/to/scenario:1')) + '\n' +
          '   Step: ' + colors.bold('stepKeyword stepName') + ' - ' + colors.gray(path.normalize('path/to/step:2')) + '\n' +
          '   Step Definition: ' + colors.gray(path.normalize('path/to/stepDefintion:3')) + '\n' +
          '   Message:' + '\n' +
          '     ' + colors.red('failure exception stack') + '\n\n';
        expect(summaryFormatter.log).toHaveBeenCalledWith(expected);
      });
    });

    describe("when there is an ambiguous step", function () {
      beforeEach(function () {
        var stepDefinition1 = createSpyWithStubs('step definition', {getPattern: 'pattern 1', getUri: 'path/to/stepDefinition1', getLine: 3});
        var stepDefinition2 = createSpyWithStubs('step definition', {getPattern: 'longer pattern 2', getUri: 'path/to/stepDefinition2', getLine: 4});
        var stepResult = createSpyWithStubs("step result", {getAmbiguousStepDefinitions: [stepDefinition1, stepDefinition2], getStatus: Cucumber.Status.AMBIGUOUS, getStep: step, getStepDefinition: null});
        summaryFormatter.storeAmbiguousStepResult(stepResult);
      });

      it("logs the failures", function () {
        summaryFormatter.logFailures();
        expect(summaryFormatter.log).toHaveBeenCalledWith('Failures:\n\n');
        var expected =
          '1) Scenario: ' + colors.bold('scenarioName') + ' - ' + colors.gray(path.normalize('path/to/scenario:1')) + '\n' +
          '   Step: ' + colors.bold('stepKeyword stepName') + ' - ' + colors.gray(path.normalize('path/to/step:2')) + '\n' +
          '   Message:' + '\n' +
          '     ' + colors.red('Multiple step definitions match:' + '\n' +
          '       pattern 1        - ' + path.normalize('path/to/stepDefinition1:3') + '\n' +
          '       longer pattern 2 - ' + path.normalize('path/to/stepDefinition2:4')) + '\n\n';
        expect(summaryFormatter.log).toHaveBeenCalledWith(expected);
      });
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
});
