require('../../support/spec_helper');

describe("Cucumber.Listener.PrettyFormatter", function () {
  var Cucumber = requireLib('cucumber');
  var path     = require('path');
  var colors   = require('colors/safe');
  var figures  = require('figures');
  colors.enabled = true;
  var formatter, formatterHearMethod, summaryFormatter, prettyFormatter, options, logged;

  beforeEach(function () {
    options             = {useColors: true};
    formatter           = createSpyWithStubs("formatter", {finish: null});
    logged              = '';
    spyOnStub(formatter, 'log').and.callFake(function (text) { logged += text; });
    formatterHearMethod = spyOnStub(formatter, 'hear');
    summaryFormatter    = createSpy("summary formatter");
    spyOn(Cucumber.Listener, 'Formatter').and.returnValue(formatter);
    spyOn(Cucumber.Listener, 'SummaryFormatter').and.returnValue(summaryFormatter);
    prettyFormatter = Cucumber.Listener.PrettyFormatter(options);
  });

  describe("constructor", function () {
    it("creates a formatter", function () {
      expect(Cucumber.Listener.Formatter).toHaveBeenCalledWith(options);
    });

    it("extends the formatter", function () {
      expect(prettyFormatter).toBe(formatter);
    });

    it("creates a summaryFormatter", function () {
      expect(Cucumber.Listener.SummaryFormatter).toHaveBeenCalled();
    });
  });

  describe("hear()", function () {
    var event, defaultTimeout, callback;

    beforeEach(function () {
      event = createSpy("event");
      defaultTimeout = createSpy("default timeout");
      callback = createSpy("callback");
      spyOnStub(summaryFormatter, 'hear');
    });

    it("tells the summary formatter to listen to the event", function () {
      prettyFormatter.hear(event, defaultTimeout, callback);
      expect(summaryFormatter.hear).toHaveBeenCalled();
      expect(summaryFormatter.hear).toHaveBeenCalledWithValueAsNthParameter(event, 1);
      expect(summaryFormatter.hear).toHaveBeenCalledWithValueAsNthParameter(defaultTimeout, 2);
      expect(summaryFormatter.hear).toHaveBeenCalledWithAFunctionAsNthParameter(3);
    });

    describe("summary formatter callback", function () {
      var summaryFormatterCallback;

      beforeEach(function () {
        prettyFormatter.hear(event, defaultTimeout, callback);
        summaryFormatterCallback = summaryFormatter.hear.calls.mostRecent().args[2];
      });

      it("tells the formatter to listen to the event", function () {
        summaryFormatterCallback();
        expect(formatterHearMethod).toHaveBeenCalledWith(event, defaultTimeout, callback);
      });
    });
  });

  describe("handleBeforeFeatureEvent()", function () {
    var feature;

    beforeEach(function () {
      feature = createSpyWithStubs("feature", {
        getKeyword: "feature-keyword",
        getName: "feature-name",
        getDescription: '',
        getTags: []
      });
    });

    describe('no tags or description', function () {
      beforeEach(function (){
        prettyFormatter.handleBeforeFeatureEvent(feature);
      });

      it('logs the keyword and name', function () {
        expect(logged).toEqual('feature-keyword: feature-name\n\n');
      });
    });

    describe('with tags', function () {
      beforeEach(function (){
        feature.getTags.and.returnValue([
          createSpyWithStubs("tag1", {getName: '@tag1'}),
          createSpyWithStubs("tag2", {getName: '@tag2'})
        ]);
        prettyFormatter.handleBeforeFeatureEvent(feature);
      });

      it('logs the keyword and name', function () {
        var expected =
          colors.cyan('@tag1 @tag2') + '\n' +
          'feature-keyword: feature-name' + '\n\n';
        expect(logged).toEqual(expected);
      });
    });

    describe('with feature description', function () {
      beforeEach(function (){
        feature.getDescription.and.returnValue('line1\nline2');
        prettyFormatter.handleBeforeFeatureEvent(feature);
      });

      it('logs the keyword and name', function () {
        var expected =
          'feature-keyword: feature-name' + '\n\n' +
          '  line1' + '\n' +
          '  line2' + '\n\n';

        expect(logged).toEqual(expected);
      });
    });
  });

  describe("handleBeforeScenarioEvent()", function () {
    var scenario;

    beforeEach(function () {
      scenario = createSpyWithStubs("scenario", {
        getKeyword: "scenario-keyword",
        getName: "scenario-name",
        getUri: path.join(process.cwd(), "scenario-uri"),
        getLine: 1,
        getBackground: undefined,
        getTags: [],
        getSteps: []
      });
    });

    describe('no tags', function () {
      beforeEach(function (){
        prettyFormatter.handleBeforeScenarioEvent(scenario);
      });

      it('logs the keyword and name', function () {
        expect(logged).toEqual('  scenario-keyword: scenario-name\n');
      });
    });

    describe('with tags', function () {
      beforeEach(function (){
        scenario.getTags.and.returnValue([
          createSpyWithStubs("tag1", {getName: '@tag1'}),
          createSpyWithStubs("tag2", {getName: '@tag2'})
        ]);
        prettyFormatter.handleBeforeScenarioEvent(scenario);
      });

      it('logs the keyword and name', function () {
        var expected =
          '  ' + colors.cyan('@tag1 @tag2') + '\n' +
          '  scenario-keyword: scenario-name' + '\n';
        expect(logged).toEqual(expected);
      });
    });
  });

  describe("handleAfterScenarioEvent()", function () {
    it("logs a new line", function () {
      prettyFormatter.handleAfterScenarioEvent();
      expect(prettyFormatter.log).toHaveBeenCalledWith("\n");
    });
  });

  describe("handleStepResultEvent()", function () {
    var step, stepResult;

    beforeEach(function () {
      step       = createSpyWithStubs("step", { isHidden: null });
      stepResult = createSpyWithStubs("step result", { getStep: step, getStatus: undefined });
      spyOnStub(prettyFormatter, 'logStepResult');
    });

    describe("when step result is not hidden", function () {
      it("calls logStepResult() as the step is not hidden", function () {
        step.isHidden.and.returnValue(false);
        prettyFormatter.handleStepResultEvent(stepResult);
        expect(prettyFormatter.logStepResult).toHaveBeenCalledWith(step, stepResult);
      });
    });

    describe("when step result is hidden", function () {
      it("does not call logStepResult() to keep the step hidden", function () {
        step.isHidden.and.returnValue(true);
        stepResult.getStatus.and.returnValue(Cucumber.Status.PASSED);
        prettyFormatter.handleStepResultEvent(stepResult);
        expect(prettyFormatter.logStepResult).not.toHaveBeenCalled();
      });
    });
  });

  describe("logStepResult()", function () {
    var stepResult, step, stepDefinition;

    beforeEach(function () {
      stepDefinition = createSpyWithStubs("step definition", {
        getLine: 1,
        getUri: path.join(process.cwd(), 'step-definition-uri')
      });
      step = createSpyWithStubs("step", {
        getArguments: [],
        getLine: 1,
        getKeyword: "step-keyword ",
        getName: "step-name",
        getUri: path.join(process.cwd(), "step-uri"),
        hasUri: true
      });
      stepResult = createSpyWithStubs("step result", {
        getFailureException: null,
        getStep: step,
        getStepDefinition: stepDefinition,
        getStatus: Cucumber.Status.PASSED
      });
    });

    describe("passing step", function () {
      beforeEach(function () {
        prettyFormatter.logStepResult(step, stepResult);
      });

      it('logs the keyword and name', function () {
        var expected =
          '  ' + colors.green(figures.tick + ' step-keyword step-name') + '\n';
        expect(logged).toEqual(expected);
      });
    });

    describe("pending step", function () {
      beforeEach(function () {
        stepResult.getStatus.and.returnValue(Cucumber.Status.PENDING);
        prettyFormatter.logStepResult(step, stepResult);
      });

      it('logs the keyword and name', function () {
        var expected =
          '  ' + colors.yellow('? step-keyword step-name') + '\n';
        expect(logged).toEqual(expected);
      });
    });

    describe("skipped step", function () {
      beforeEach(function () {
        stepResult.getStatus.and.returnValue(Cucumber.Status.SKIPPED);
        prettyFormatter.logStepResult(step, stepResult);
      });

      it('logs the keyword and name', function () {
        var expected =
          '  ' + colors.cyan('- step-keyword step-name') + '\n';
        expect(logged).toEqual(expected);
      });
    });

    describe("undefined step", function () {
      beforeEach(function () {
        stepResult.getStatus.and.returnValue(Cucumber.Status.UNDEFINED);
        prettyFormatter.logStepResult(step, stepResult);
      });

      it('logs the keyword and name', function () {
        var expected =
          '  ' + colors.yellow('? step-keyword step-name') + '\n';
        expect(logged).toEqual(expected);
      });
    });

    describe("failed step", function () {
      beforeEach(function () {
        stepResult.getStatus.and.returnValue(Cucumber.Status.FAILED);
        stepResult.getFailureException.and.returnValue({stack: 'stack error\n  stacktrace1\n  stacktrace2'});
        prettyFormatter.logStepResult(step, stepResult);
      });

      it('logs the keyword and name', function () {
        var expected =
          '  ' + colors.red(figures.cross + ' step-keyword step-name') + '\n';
        expect(logged).toEqual(expected);
      });
    });

    describe("without name", function () {
      beforeEach(function () {
        step.getName.and.returnValue(undefined);
        prettyFormatter.logStepResult(step, stepResult);
      });

      it('logs the keyword', function () {
        var expected =
          '  ' + figures.tick + ' step-keyword ' + '\n';
        expect(colors.strip(logged)).toEqual(expected);
      });
    });

    describe("with data table", function () {
      beforeEach(function() {
        var rows = [
          ["cuk", "cuke", "cukejs"],
          ["c",   "cuke", "cuke.js"],
          ["cu",  "cuke", "cucumber"]
        ];
        var dataTable = createSpyWithStubs("data table", {getType: 'DataTable', raw: rows});
        step.getArguments.and.returnValue([dataTable]);
        prettyFormatter.logStepResult(step, stepResult);
      });

      it('logs the keyword and name and data table', function () {
        var expected =
          '  ' + figures.tick + ' step-keyword step-name' + '\n' +
          '      | cuk | cuke | cukejs   |' + '\n' +
          '      | c   | cuke | cuke.js  |' + '\n' +
          '      | cu  | cuke | cucumber |' + '\n';
        expect(colors.strip(logged)).toEqual(expected);
      });
    });

    describe("with doc string", function () {
      beforeEach(function () {
        var content = "this is a multiline\ndoc string\n\n:-)";
        var docString = createSpyWithStubs("doc string", {getType: 'DocString', getContent: content});
        step.getArguments.and.returnValue([docString]);
        prettyFormatter.logStepResult(step, stepResult);
      });

      it('logs the keyword and name and doc string', function () {
        var expected =
          '  ' + figures.tick + ' step-keyword step-name' + '\n' +
          '      """' + '\n' +
          '      this is a multiline' + '\n' +
          '      doc string' + '\n' +
          '\n' +
          '      :-)' + '\n' +
          '      """' + '\n';
        expect(colors.strip(logged)).toEqual(expected);
      });
    });
  });

  describe("handleAfterFeaturesEvent()", function () {
    var callback, summary;

    beforeEach(function () {
      callback = createSpy("callback");
      summary  = createSpy("summary logs");
      spyOnStub(summaryFormatter, 'getLogs').and.returnValue(summary);
    });

    it("gets the summary from the summaryFormatter", function () {
      prettyFormatter.handleAfterFeaturesEvent([], callback);
      expect(summaryFormatter.getLogs).toHaveBeenCalled();
    });

    it("logs the summary", function () {
      prettyFormatter.handleAfterFeaturesEvent([], callback);
      expect(prettyFormatter.log).toHaveBeenCalledWith(summary);
    });

    it("calls finish with the callback", function () {
      prettyFormatter.handleAfterFeaturesEvent([], callback);
      expect(prettyFormatter.finish).toHaveBeenCalledWith(callback);
    });
  });

  describe("logIndented()", function () {
    var text, level, indented;

    beforeEach(function () {
      text     = createSpy("text");
      level    = createSpy("level");
      indented = createSpy("indented text");
      spyOn(prettyFormatter, 'indent').and.returnValue(indented);
    });

    it("indents the text", function () {
      prettyFormatter.logIndented(text, level);
      expect(prettyFormatter.indent).toHaveBeenCalledWith(text, level);
    });

    it("logs the indented text", function () {
      prettyFormatter.logIndented(text, level);
      expect(prettyFormatter.log).toHaveBeenCalledWith(indented);
    });
  });

  describe("indent()", function () {
    it("returns the original text on a 0-indentation level", function () {
      var original = "cuke\njavascript";
      var expected = original;
      var actual   = prettyFormatter.indent(original, 0);
      expect(actual).toEqual(expected);
    });

    it("returns the 1-level indented text", function () {
      var original = "cuke\njavascript";
      var expected = "  cuke\n  javascript";
      var actual   = prettyFormatter.indent(original, 1);
      expect(actual).toEqual(expected);
    });

    it("returns the 2-level indented text", function () {
      var original = "cuke\njavascript";
      var expected = "    cuke\n    javascript";
      var actual   = prettyFormatter.indent(original, 2);
      expect(actual).toEqual(expected);
    });

    it("returns the 3-level indented text", function () {
      var original = "cuke\njavascript";
      var expected = "      cuke\n      javascript";
      var actual   = prettyFormatter.indent(original, 3);
      expect(actual).toEqual(expected);
    });
  });
});
