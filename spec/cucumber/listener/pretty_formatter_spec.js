require('../../support/spec_helper');

describe("Cucumber.Listener.PrettyFormatter", function () {
  var Cucumber = requireLib('cucumber');
  var path     = require('path');
  var colors   = require('colors/safe');
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
    var event, callback;

    beforeEach(function () {
      event    = createSpy("event");
      callback = createSpy("callback");
      spyOnStub(summaryFormatter, 'hear');
    });

    it("tells the summary formatter to listen to the event", function () {
      prettyFormatter.hear(event, callback);
      expect(summaryFormatter.hear).toHaveBeenCalled();
      expect(summaryFormatter.hear).toHaveBeenCalledWithValueAsNthParameter(event, 1);
      expect(summaryFormatter.hear).toHaveBeenCalledWithAFunctionAsNthParameter(2);
    });

    describe("summary formatter callback", function () {
      var summaryFormatterCallback;

      beforeEach(function () {
        prettyFormatter.hear(event, callback);
        summaryFormatterCallback = summaryFormatter.hear.calls.mostRecent().args[1];
      });

      it("tells the formatter to listen to the event", function () {
        summaryFormatterCallback();
        expect(formatterHearMethod).toHaveBeenCalledWith(event, callback);
      });
    });
  });

  describe("handleBeforeFeatureEvent()", function () {
    var event, feature, callback;

    beforeEach(function () {
      feature = createSpyWithStubs("feature", {
        getKeyword: "feature-keyword",
        getName: "feature-name",
        getDescription: '',
        getTags: []
      });
      event = createSpyWithStubs("event", { getPayloadItem: feature });
      callback = createSpy("callback");
    });

    describe('no tags or description', function () {
      beforeEach(function (){
        prettyFormatter.handleBeforeFeatureEvent(event, callback);
      });

      it('logs the keyword and name', function () {
        expect(logged).toEqual('feature-keyword: feature-name\n\n');
      });

      it("calls back", function () {
        expect(callback).toHaveBeenCalled();
      });
    });

    describe('with tags', function () {
      beforeEach(function (){
        feature.getTags.and.returnValue([
          createSpyWithStubs("tag1", {getName: '@tag1'}),
          createSpyWithStubs("tag2", {getName: '@tag2'})
        ]);
        prettyFormatter.handleBeforeFeatureEvent(event, callback);
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
        prettyFormatter.handleBeforeFeatureEvent(event, callback);
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
    var event, scenario, callback;

    beforeEach(function () {
      scenario = createSpyWithStubs("scenario", {
        getKeyword: "scenario-keyword",
        getName: "scenario-name",
        getUri: path.join(process.cwd(), "scenario-uri"),
        getLine: 1,
        getBackground: undefined,
        getOwnTags: [],
        getSteps: []
      });
      event = createSpyWithStubs("event", { getPayloadItem: scenario });
      callback = createSpy("callback");
    });

    describe('no tags, not showing source', function () {
      beforeEach(function (){
        prettyFormatter.handleBeforeScenarioEvent(event, callback);
      });

      it('logs the keyword and name', function () {
        expect(logged).toEqual('  scenario-keyword: scenario-name\n');
      });

      it("calls back", function () {
        expect(callback).toHaveBeenCalled();
      });
    });

    describe('with tags', function () {
      beforeEach(function (){
        scenario.getOwnTags.and.returnValue([
          createSpyWithStubs("tag1", {getName: '@tag1'}),
          createSpyWithStubs("tag2", {getName: '@tag2'})
        ]);
        prettyFormatter.handleBeforeScenarioEvent(event, callback);
      });

      it('logs the keyword and name', function () {
        var expected =
          '  ' + colors.cyan('@tag1 @tag2') + '\n' +
          '  scenario-keyword: scenario-name' + '\n';
        expect(logged).toEqual(expected);
      });
    });

    describe('showing source', function () {
      beforeEach(function (){
        options.showSource = true;
        prettyFormatter.handleBeforeScenarioEvent(event, callback);
      });

      it('logs the keyword and name', function () {
        var expected =
          '  scenario-keyword: scenario-name   ' + colors.gray('# scenario-uri:1') + '\n';
        expect(logged).toEqual(expected);
      });
    });
  });

  describe("handleAfterScenarioEvent()", function () {
    var event, callback;

    beforeEach(function () {
      event    = createSpy("event");
      callback = createSpy("callback");
    });

    it("logs a new line", function () {
      prettyFormatter.handleAfterScenarioEvent(event, callback);
      expect(prettyFormatter.log).toHaveBeenCalledWith("\n");
    });

    it("calls back", function () {
      prettyFormatter.handleAfterScenarioEvent(event, callback);
      expect(callback).toHaveBeenCalled();
    });
  });

  describe("handleStepResultEvent()", function () {
    var step, stepResult, event, callback;

    beforeEach(function () {
      step       = createSpyWithStubs("step", { isHidden: null });
      stepResult = createSpyWithStubs("step result", { getStep: step, getStatus: undefined });
      event      = createSpyWithStubs("event", { getPayloadItem: stepResult });
      callback   = createSpy("callback");
      spyOnStub(prettyFormatter, 'logStepResult');
    });

    it("gets the step result from the event payload", function () {
      prettyFormatter.handleStepResultEvent(event, callback);
      expect(event.getPayloadItem).toHaveBeenCalledWith('stepResult');
    });

    describe("when step result is not hidden", function () {
      it("calls logStepResult() as the step is not hidden", function () {
        step.isHidden.and.returnValue(false);
        prettyFormatter.handleStepResultEvent(event, callback);
        expect(prettyFormatter.logStepResult).toHaveBeenCalledWith(step, stepResult);
      });
    });

    describe("when step result is hidden and has not failed", function () {
      it("does not call logStepResult() to keep the step hidden", function () {
        step.isHidden.and.returnValue(true);
        stepResult.getStatus.and.returnValue(Cucumber.Status.PASSED);
        prettyFormatter.handleStepResultEvent(event, callback);
        expect(prettyFormatter.logStepResult).not.toHaveBeenCalled();
      });
    });

    describe("when step result is hidden and has failed", function () {
      it("calls logStepResult() to log the failure even though the step is supposed to be hidden", function () {
        step.isHidden.and.returnValue(true);
        stepResult.getStatus.and.returnValue(Cucumber.Status.FAILED);
        prettyFormatter.handleStepResultEvent(event, callback);
        expect(prettyFormatter.logStepResult).toHaveBeenCalledWith(step, stepResult);
      });
    });

    it("calls back", function () {
      prettyFormatter.handleStepResultEvent(event, callback);
      expect(callback).toHaveBeenCalled();
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
        getDataTable: null,
        getDocString: null,
        getKeyword: "step-keyword ",
        getName: "step-name",
        hasDataTable: null,
        hasDocString: null,
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
          '    ' + colors.green('step-keyword step-name') + '\n';
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
          '    ' + colors.yellow('step-keyword step-name') + '\n';
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
          '    ' + colors.cyan('step-keyword step-name') + '\n';
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
          '    ' + colors.yellow('step-keyword step-name') + '\n';
        expect(logged).toEqual(expected);
      });
    });

    describe("failed step", function () {
      beforeEach(function () {
        stepResult.getStatus.and.returnValue(Cucumber.Status.FAILED);
        stepResult.getFailureException.and.returnValue({stack: 'stack error\n  stacktrace1\n  stacktrace2'});
        prettyFormatter.logStepResult(step, stepResult);
      });

      it('logs the keyword and name and failure', function () {
        var expected =
          '    ' + colors.red('step-keyword step-name') + '\n' +
          '      stack error' + '\n' +
          '        stacktrace1' + '\n' +
          '        stacktrace2' + '\n';
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
          '    step-keyword ' + '\n';
        expect(colors.strip(logged)).toEqual(expected);
      });
    });

    describe("showing source", function () {
      beforeEach(function() {
        options.showSource = true;
        prettyFormatter.logStepResult(step, stepResult);
      });

      it('logs the keyword and name', function () {
        var expected =
          '    step-keyword step-name# step-definition-uri:1' + '\n';
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
        var dataTable = createSpyWithStubs("data table", {raw: rows});
        step.getDataTable.and.returnValue(dataTable);
        step.hasDataTable.and.returnValue(true);
        prettyFormatter.logStepResult(step, stepResult);
      });

      it('logs the keyword and name and data table', function () {
        var expected =
          '    step-keyword step-name' + '\n' +
          '      | cuk | cuke | cukejs   |' + '\n' +
          '      | c   | cuke | cuke.js  |' + '\n' +
          '      | cu  | cuke | cucumber |' + '\n';
        expect(colors.strip(logged)).toEqual(expected);
      });
    });

    describe("with doc string", function () {
      beforeEach(function () {
        var contents = "this is a multiline\ndoc string\n\n:-)";
        var docString = createSpyWithStubs("doc string", {getContents: contents});
        step.getDocString.and.returnValue(docString);
        step.hasDocString.and.returnValue(true);
        prettyFormatter.logStepResult(step, stepResult);
      });

      it('logs the keyword and name and doc string', function () {
        var expected =
          '    step-keyword step-name' + '\n' +
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
    var event, callback, summary;

    beforeEach(function () {
      event    = createSpy("event");
      callback = createSpy("callback");
      summary  = createSpy("summary logs");
      spyOnStub(summaryFormatter, 'getLogs').and.returnValue(summary);
    });

    it("gets the summary from the summaryFormatter", function () {
      prettyFormatter.handleAfterFeaturesEvent(event, callback);
      expect(summaryFormatter.getLogs).toHaveBeenCalled();
    });

    it("logs the summary", function () {
      prettyFormatter.handleAfterFeaturesEvent(event, callback);
      expect(prettyFormatter.log).toHaveBeenCalledWith(summary);
    });

    it("calls finish with the callback", function () {
      prettyFormatter.handleAfterFeaturesEvent(event, callback);
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

  describe("determineMaxStepLengthForElement()", function () {
    var steps, element;

    beforeEach(function () {
      steps = Cucumber.Type.Collection();
      element = createSpyWithStubs("element", { getSteps: steps });
    });

    it("returns zero when there are no steps", function () {
      var maxStepLength = prettyFormatter.determineMaxStepLengthForElement(element);
      expect(maxStepLength).toEqual(0);
    });

    it("returns the combined length of a step's keyword and name when there is one step", function () {
      var step = createSpyWithStubs("step", { getKeyword: 'step-keyword', getName: 'step-name' });
      steps.add(step);
      var maxStepLength = prettyFormatter.determineMaxStepLengthForElement(element);
      expect(maxStepLength).toEqual(21);
    });

    it("returns the maximum length of all the steps", function () {
      var step = createSpyWithStubs("step", { getKeyword: 'step-keyword', getName: 'step-name' });
      var step2 = createSpyWithStubs("step", { getKeyword: 'step-keyword-2', getName: 'step-name-2' });
      steps.add(step);
      steps.add(step2);
      var maxStepLength = prettyFormatter.determineMaxStepLengthForElement(element);
      expect(maxStepLength).toEqual(25);
    });
  });
});
