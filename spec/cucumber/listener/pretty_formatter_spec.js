require('../../support/spec_helper');

describe("Cucumber.Listener.PrettyFormatter", function () {
  var Cucumber = requireLib('cucumber');
  var path     = require('path');
  var formatter, formatterHearMethod, summaryFormatter, prettyFormatter, options, colors, logged;

  beforeEach(function () {
    options             = createSpy("options");
    formatter           = createSpyWithStubs("formatter");
    logged              = '';
    spyOnStub(formatter, 'log').and.callFake(function (text) { logged += text; });
    formatterHearMethod = spyOnStub(formatter, 'hear');
    summaryFormatter    = createSpy("summary formatter");
    spyOn(Cucumber.Listener, 'Formatter').and.returnValue(formatter);
    spyOn(Cucumber.Listener, 'SummaryFormatter').and.returnValue(summaryFormatter);
    prettyFormatter = Cucumber.Listener.PrettyFormatter(options);
    colors = Cucumber.Util.Colors;
  });

  describe("constructor", function () {
    it("creates a formatter", function () {
      expect(Cucumber.Listener.Formatter).toHaveBeenCalledWith(options);
    });

    it("extends the formatter", function () {
      expect(prettyFormatter).toBe(formatter);
    });

    it("creates a summaryFormatter", function () {
      expect(Cucumber.Listener.SummaryFormatter).toHaveBeenCalledWith(jasmine.objectContaining({logToConsole: false}));
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
        prettyFormatter = Cucumber.Listener.PrettyFormatter({showSource: true});
        prettyFormatter.handleBeforeScenarioEvent(event, callback);
      });

      it('logs the keyword and name', function () {
        var expected =
          '  scenario-keyword: scenario-name ' + colors.gray('# scenario-uri:1') + '\n';
        expect(logged).toEqual(expected);
      });
    });

    // it("gets the scenario from the event payload", function () {
    //   prettyFormatter.handleBeforeScenarioEvent(event, callback);
    //   expect(event.getPayloadItem).toHaveBeenCalledWith('scenario');
    // });

    // it("gets the scenario keyword", function () {
    //   prettyFormatter.handleBeforeScenarioEvent(event, callback);
    //   expect(scenario.getKeyword).toHaveBeenCalled();
    // });

    // it("gets the scenario name", function () {
    //   prettyFormatter.handleBeforeScenarioEvent(event, callback);
    //   expect(scenario.getName).toHaveBeenCalled();
    // });

    // it("logs the scenario header, indented by one level", function () {
    //   prettyFormatter.handleBeforeScenarioEvent(event, callback);
    //   var text = colors.tag("@tag") + "\n" + prettyFormatter._pad(keyword + ": " + name, backgroundStepLength + 3) + colors.comment("# " + relativeUri + ":" + scenario.getLine()) + "\n";
    //   expect(prettyFormatter.logIndented).toHaveBeenCalledWith(text, 1);
    // });

    // it("calls back", function () {
    //   prettyFormatter.handleBeforeScenarioEvent(event, callback);
    //   expect(callback).toHaveBeenCalled();
    // });
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
      stepResult = createSpyWithStubs("step result", { getStep: step, isFailed: null });
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
        spyOnStub(step, 'isHidden').and.returnValue(false);
        prettyFormatter.handleStepResultEvent(event, callback);
        expect(prettyFormatter.logStepResult).toHaveBeenCalledWith(step, stepResult);
      });
    });

    describe("when step result is hidden and has not failed", function () {
      it("does not call logStepResult() to keep the step hidden", function () {
        spyOnStub(step, 'isHidden').and.returnValue(true);
        spyOnStub(stepResult, 'isFailed').and.returnValue(false);
        prettyFormatter.handleStepResultEvent(event, callback);
        expect(prettyFormatter.logStepResult).not.toHaveBeenCalled();
      });
    });

    describe("when step result is hidden and has failed", function () {
      it("calls logStepResult() to log the failure even though the step is supposed to be hidden", function () {
        spyOnStub(step, 'isHidden').and.returnValue(true);
        spyOnStub(stepResult, 'isFailed').and.returnValue(true);
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
    var stepResult, keyword, name, relativeUri, maxStepLength, line, step;

    beforeEach(function () {
      keyword    = "step-keyword ";
      name       = "step-name";
      relativeUri = "step-uri";
      var uri = path.join(process.cwd(), relativeUri);
      maxStepLength = 30;
      line       = 10;
      step       = createSpyWithStubs("step", { getKeyword: keyword, hasDataTable: null, getDataTable: null, hasDocString: null, getDocString: null, getName: name, hasUri: true, getUri: uri, getLine: line });
      stepResult = createSpyWithStubs("step result", { getStep: step, isFailed: null, isPending: null, isSuccessful: null, isUndefined: null, isSkipped: null });
      spyOn(prettyFormatter, 'logDataTable');
      spyOn(prettyFormatter, 'logDocString');
      spyOn(prettyFormatter, 'logIndented');
      spyOn(prettyFormatter, '_getCurrentMaxStepLength').and.returnValue(maxStepLength);
    });

    it("gets the step keyword", function () {
      prettyFormatter.logStepResult(step, stepResult);
      expect(step.getKeyword).toHaveBeenCalled();
    });

    it("gets the step name", function () {
      prettyFormatter.logStepResult(step, stepResult);
      expect(step.getName).toHaveBeenCalled();
    });

    it("logs the step header, indented by two levels", function () {
      prettyFormatter.logStepResult(step, stepResult);
      var text = prettyFormatter._pad(keyword + name, maxStepLength + 1) + colors.comment("# " + relativeUri + ":" + line) + "\n";
      expect(prettyFormatter.logIndented).toHaveBeenCalledWith(text, 2);
    });

    describe("when the step has no name", function () {
      beforeEach(function () {
        step.getName.and.returnValue(undefined);
      });

      it("logs the step header without the name, indented by two levels", function () {
        prettyFormatter.logStepResult(step, stepResult);
        var text = prettyFormatter._pad(keyword, maxStepLength + 1) + colors.comment("# " + relativeUri + ":" + line) + "\n";
        expect(prettyFormatter.logIndented).toHaveBeenCalledWith(text, 2);
      });
    });

    describe("when the step has no URI", function () {
      beforeEach(function () {
        step.hasUri.and.returnValue(false);
      });

      it("logs the step header without the URI, indented by two levels", function () {
        prettyFormatter.logStepResult(step, stepResult);
        var text = prettyFormatter._pad(keyword + name, maxStepLength + 1) + "\n";
        expect(prettyFormatter.logIndented).toHaveBeenCalledWith(text, 2);
      });
    });

    it("checks whether the step result has a data table or not", function () {
      prettyFormatter.logStepResult(step, stepResult);
      expect(step.hasDataTable).toHaveBeenCalled();
    });

    describe("when the step has a data table", function () {
      var dataTable;

      beforeEach(function () {
        dataTable = createSpy("data table");
        step.hasDataTable.and.returnValue(true);
        step.getDataTable.and.returnValue(dataTable);
      });

      it("gets the data table", function () {
        prettyFormatter.logStepResult(step, stepResult);
        expect(step.getDataTable).toHaveBeenCalled();
      });

      it("logs the data table", function () {
        prettyFormatter.logStepResult(step, stepResult);
        expect(prettyFormatter.logDataTable).toHaveBeenCalledWith(stepResult, dataTable);
      });
    });

    describe("when the step has no data table", function () {
      beforeEach(function () {
        step.hasDataTable.and.returnValue(false);
      });

      it("does no get the data table", function () {
        prettyFormatter.logStepResult(step, stepResult);
        expect(step.getDataTable).not.toHaveBeenCalled();
      });

      it("does not log the data table", function () {
        prettyFormatter.logStepResult(step, stepResult);
        expect(prettyFormatter.logDataTable).not.toHaveBeenCalled();
      });
    });

    it("checks whether the step result has a doc string or not", function () {
      prettyFormatter.logStepResult(step, stepResult);
      expect(step.hasDocString).toHaveBeenCalled();
    });

    describe("when the step has a doc string", function () {
      var docString;

      beforeEach(function () {
        docString = createSpy("doc string");
        step.hasDocString.and.returnValue(true);
        step.getDocString.and.returnValue(docString);
      });

      it("gets the doc string", function () {
        prettyFormatter.logStepResult(step, stepResult);
        expect(step.getDocString).toHaveBeenCalled();
      });

      it("logs the doc string", function () {
        prettyFormatter.logStepResult(step, stepResult);
        expect(prettyFormatter.logDocString).toHaveBeenCalledWith(stepResult, docString);
      });
    });

    describe("when the step has no doc string", function () {
      beforeEach(function () {
        step.hasDocString.and.returnValue(false);
      });

      it("does not get the doc string", function () {
        prettyFormatter.logStepResult(step, stepResult);
        expect(step.getDocString).not.toHaveBeenCalled();
      });

      it("logs the doc string", function () {
        prettyFormatter.logStepResult(step, stepResult);
        expect(prettyFormatter.logDocString).not.toHaveBeenCalled();
      });
    });

    it("checks whether the step result is failed or not", function () {
      prettyFormatter.logStepResult(step, stepResult);
      expect(stepResult.isFailed).toHaveBeenCalled();
    });

    describe("when the step failed", function () {
      var exception;

      beforeEach(function () {
        exception = createSpy("exception");
        stepResult.isFailed.and.returnValue(true);
        spyOnStub(stepResult, 'getFailureException').and.returnValue(exception);
      });

      it("gets the failure exception", function () {
        prettyFormatter.logStepResult(step, stepResult);
        expect(stepResult.getFailureException).toHaveBeenCalled();
      });

      it("logs the failure stack when there is one, indented by three levels", function () {
        var stack  = "failure stack";
        var text = stack + "\n";
        exception.stack = stack;
        prettyFormatter.logStepResult(step, stepResult);
        expect(prettyFormatter.logIndented).toHaveBeenCalledWith(text, 3);
      });

      it("logs the failure itself when there no stack, indented by three levels", function () {
        exception = "exception text";
        var text  = exception + "\n";
        stepResult.getFailureException.and.returnValue(exception);
        prettyFormatter.logStepResult(step, stepResult);
        expect(prettyFormatter.logIndented).toHaveBeenCalledWith(text, 3);
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

    it("calls back", function () {
      prettyFormatter.handleAfterFeaturesEvent(event, callback);
      expect(callback).toHaveBeenCalled();
    });
  });

  describe("logDataTable()", function () {
    var rows, step, stepResult, dataTable;

    beforeEach(function () {
      rows = [
        ["cuk", "cuke", "cukejs"],
        ["c",   "cuke", "cuke.js"],
        ["cu",  "cuke", "cucumber"]
      ];
      step       = createSpy("step");
      stepResult = createSpyWithStubs("step result", { getStep: step, isFailed: null, isPending: null, isSuccessful: null, isUndefined: null, isSkipped: null });
      dataTable  = createSpyWithStubs("data table", {raw: rows});
      spyOn(prettyFormatter, "logIndented");
    });

    it("gets the rows from the table", function () {
      prettyFormatter.logDataTable(stepResult, dataTable);
      expect(dataTable.raw).toHaveBeenCalled();
    });

    it("logs the lines with padding, indented by 3 levels", function () {
      prettyFormatter.logDataTable(stepResult, dataTable);
      expect(prettyFormatter.logIndented).toHaveBeenCalledWith("| cuk | cuke | cukejs   |\n", 3);
      expect(prettyFormatter.logIndented).toHaveBeenCalledWith("| c   | cuke | cuke.js  |\n", 3);
      expect(prettyFormatter.logIndented).toHaveBeenCalledWith("| cu  | cuke | cucumber |\n", 3);
    });
  });

  describe("logDocString()", function () {
    var contents, step, stepResult, docString;

    beforeEach(function () {
      contents   = "this is a multiline\ndoc string\n\n:-)";
      step       = createSpy("step");
      stepResult = createSpyWithStubs("step result", { getStep: step, isFailed: null, isPending: null, isSuccessful: null, isUndefined: null, isSkipped: null });
      docString  = createSpyWithStubs("doc string", {getContents: contents});
      spyOn(prettyFormatter, "logIndented");
    });

    it("gets the contents of the doc string", function () {
      prettyFormatter.logDocString(stepResult, docString);
      expect(docString.getContents).toHaveBeenCalled();
    });

    it("logs the contents of the doc string, with a 3-level indentation", function () {
      prettyFormatter.logDocString(stepResult, docString);
      expect(prettyFormatter.logIndented).toHaveBeenCalledWith('"""\n' + contents + '\n"""\n', 3);
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
