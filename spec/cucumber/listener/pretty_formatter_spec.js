require('../../support/spec_helper');

describe("Cucumber.Listener.PrettyFormatter", function () {
  var Cucumber = requireLib('cucumber');
  var formatter, formatterHearMethod, summaryFormatter, prettyFormatter, options;

  beforeEach(function () {
    options             = createSpy("options");
    formatter           = createSpyWithStubs("formatter", {log: null});
    formatterHearMethod = spyOnStub(formatter, 'hear');
    summaryFormatter    = createSpy("summary formatter");
    spyOn(Cucumber.Listener, 'Formatter').andReturn(formatter);
    spyOn(Cucumber.Listener, 'SummaryFormatter').andReturn(summaryFormatter);
    prettyFormatter = Cucumber.Listener.PrettyFormatter(options);
    color = Cucumber.Util.ConsoleColor;
  });

  describe("constructor", function () {
    it("creates a formatter", function() {
      expect(Cucumber.Listener.Formatter).toHaveBeenCalledWith(options);
    });

    it("extends the formatter", function () {
      expect(prettyFormatter).toBe(formatter);
    });

    it("creates a summaryFormatter", function () {
      expect(Cucumber.Listener.SummaryFormatter).toHaveBeenCalledWith({logToConsole: false});
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
        summaryFormatterCallback = summaryFormatter.hear.mostRecentCall.args[1];
      });

      it("tells the formatter to listen to the event", function () {
        summaryFormatterCallback();
        expect(formatterHearMethod).toHaveBeenCalledWith(event, callback);
      });
    });
  });

  describe("handleBeforeFeatureEvent()", function () {
    var event, feature, keyword, name, callback;

    beforeEach(function () {
      keyword  = "feature-keyword";
      name     = "feature-name";
      description = "feature-description";
      tags = [createSpyWithStubs("tags", {getName: '@tag'})];
      feature  = createSpyWithStubs("feature", { getKeyword: keyword, getName: name, getDescription: description, getTags: tags });
      event    = createSpyWithStubs("event", { getPayloadItem: feature });
      callback = createSpy("callback");
      spyOn(prettyFormatter, 'logIndented');
    });

    it("gets the feature from the event payload", function () {
      prettyFormatter.handleBeforeFeatureEvent(event, callback);
      expect(event.getPayloadItem).toHaveBeenCalledWith('feature');
    });

    it("gets the feature keyword", function () {
      prettyFormatter.handleBeforeFeatureEvent(event, callback);
      expect(feature.getKeyword).toHaveBeenCalled();
    });

    it("gets the feature name", function () {
      prettyFormatter.handleBeforeFeatureEvent(event, callback);
      expect(feature.getName).toHaveBeenCalled();
    });

    it("logs the feature header", function () {
      prettyFormatter.handleBeforeFeatureEvent(event, callback);
      var text = color.format('tag', '@tag') + "\n" +keyword + ": " + name + "\n";
      expect(prettyFormatter.log).toHaveBeenCalledWith(text);
    });

    it("logs the feature description", function() {
      prettyFormatter.handleBeforeFeatureEvent(event, callback);
      var text = description + "\n\n";
      expect(prettyFormatter.logIndented).toHaveBeenCalledWith(text,1);
    });

    it("calls back", function () {
      prettyFormatter.handleBeforeFeatureEvent(event, callback);
      expect(callback).toHaveBeenCalled();
    });
  });

  describe("handleBeforeScenarioEvent()", function () {
    var event, scenario, keyword, name, callback;

    beforeEach(function () {
      keyword  = "scenario-keyword";
      name     = "scenario-name";
      //Background step assumed to be the longest
      backgroundStepLength = 50;
      scenarioStepLength = 20;
      tags = [createSpyWithStubs("tags", {getName: '@tag'})];
      line = 10
      uri = "scenario-uri";
      background = createSpyWithStubs("background", { getMaxStepLength: backgroundStepLength})
      scenario = createSpyWithStubs("scenario", { getKeyword: keyword, getName: name, getMaxStepLength: scenarioStepLength, getUri: uri, getLine: line, getBackground: background, getOwnTags: tags });
      event    = createSpyWithStubs("event", { getPayloadItem: scenario });
      spyOn(prettyFormatter, 'logIndented');
      callback = createSpy("callback");
    });

    it("gets the scenario from the event payload", function () {
      prettyFormatter.handleBeforeScenarioEvent(event, callback);
      expect(event.getPayloadItem).toHaveBeenCalledWith('scenario');
    });

    it("gets the scenario keyword", function () {
      prettyFormatter.handleBeforeScenarioEvent(event, callback);
      expect(scenario.getKeyword).toHaveBeenCalled();
    });

    it("gets the scenario name", function () {
      prettyFormatter.handleBeforeScenarioEvent(event, callback);
      expect(scenario.getName).toHaveBeenCalled();
    });

    it("logs the scenario header, indented by one level", function () {
      prettyFormatter.handleBeforeScenarioEvent(event, callback);
      var text = color.format('tag', "@tag") + "\n" + prettyFormatter._pad(keyword + ": " + name, backgroundStepLength + 3) + color.format('comment', "# " + scenario.getUri().slice(1) + ":" + scenario.getLine()) + "\n";
      expect(prettyFormatter.logIndented).toHaveBeenCalledWith(text, 1);
    });

    it("calls back", function () {
      prettyFormatter.handleBeforeScenarioEvent(event, callback);
      expect(callback).toHaveBeenCalled();
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
    var event, stepResult, keyword, name, step, callback;

    beforeEach(function () {
      keyword    = "step-keyword ";
      name       = "step-name";
      uri        = "/step-uri";
      maxStepLength = 10;
      line       = 10;
      step       = createSpyWithStubs("step", { getKeyword: keyword, hasDataTable: null, getDataTable: null, hasDocString: null, getDocString: null, getName: name, getUri: uri, getLine: line });
      stepResult = createSpyWithStubs("step result", { getStep: step, isFailed: null, isPending: null, isSuccessful: null, isUndefined: null, isSkipped: null });
      event      = createSpyWithStubs("event", { getPayloadItem: stepResult });
      spyOn(prettyFormatter, 'logDataTable');
      spyOn(prettyFormatter, 'logDocString');
      spyOn(prettyFormatter, 'logIndented');
      callback   = createSpy("callback");
    });

    it("gets the step result from the event payload", function () {
      prettyFormatter.handleStepResultEvent(event, callback);
      expect(event.getPayloadItem).toHaveBeenCalledWith('stepResult');
    });

    it("gets the step from the step result", function () {
      prettyFormatter.handleStepResultEvent(event, callback);
      expect(stepResult.getStep).toHaveBeenCalled();
    });

    it("gets the step keyword", function () {
      prettyFormatter.handleStepResultEvent(event, callback);
      expect(step.getKeyword).toHaveBeenCalled();
    });

    it("gets the step name", function () {
      prettyFormatter.handleStepResultEvent(event, callback);
      expect(step.getName).toHaveBeenCalled();
    });

    it("logs the step header, indented by two levels", function () {
      prettyFormatter.handleStepResultEvent(event, callback);
      var text = keyword + name + "\n";
      var text = prettyFormatter._pad(keyword + name, maxStepLength + 10) + color.format('comment', "# " + uri.slice(1) + ":" + line) + "\n";
      expect(prettyFormatter.logIndented).toHaveBeenCalledWith(text, 2);
    });

    it("checks whether the step result has a data table or not", function () {
      prettyFormatter.handleStepResultEvent(event, callback);
      expect(step.hasDataTable).toHaveBeenCalled();
    });

    describe("when the step has a data table", function () {
      var dataTable;

      beforeEach(function () {
        dataTable = createSpy("data table");
        step.hasDataTable.andReturn(true);
        step.getDataTable.andReturn(dataTable);
      });

      it("gets the data table", function () {
        prettyFormatter.handleStepResultEvent(event, callback);
        expect(step.getDataTable).toHaveBeenCalled();
      });

      it("logs the data table", function () {
        prettyFormatter.handleStepResultEvent(event, callback);
        expect(prettyFormatter.logDataTable).toHaveBeenCalledWith(stepResult, dataTable);
      });
    });

    describe("when the step has no data table", function () {
      beforeEach(function () {
        step.hasDataTable.andReturn(false);
      });

      it("does no get the data table", function () {
        prettyFormatter.handleStepResultEvent(event, callback);
        expect(step.getDataTable).not.toHaveBeenCalled();
      });

      it("does not log the data table", function () {
        prettyFormatter.handleStepResultEvent(event, callback);
        expect(prettyFormatter.logDataTable).not.toHaveBeenCalled();
      });
    });

    it("checks whether the step result has a doc string or not", function () {
      prettyFormatter.handleStepResultEvent(event, callback);
      expect(step.hasDocString).toHaveBeenCalled();
    });

    describe("when the step has a doc string", function () {
      var docString;

      beforeEach(function () {
        docString = createSpy("doc string");
        step.hasDocString.andReturn(true);
        step.getDocString.andReturn(docString);
      });

      it("gets the doc string", function () {
        prettyFormatter.handleStepResultEvent(event, callback);
        expect(step.getDocString).toHaveBeenCalled();
      });

      it("logs the doc string", function () {
        prettyFormatter.handleStepResultEvent(event, callback);
        expect(prettyFormatter.logDocString).toHaveBeenCalledWith(stepResult, docString);
      });
    });

    describe("when the step has no doc string", function () {
      beforeEach(function () {
        step.hasDocString.andReturn(false);
      });

      it("does not get the doc string", function () {
        prettyFormatter.handleStepResultEvent(event, callback);
        expect(step.getDocString).not.toHaveBeenCalled();
      });

      it("logs the doc string", function () {
        prettyFormatter.handleStepResultEvent(event, callback);
        expect(prettyFormatter.logDocString).not.toHaveBeenCalled();
      });
    });

    it("checks whether the step result is failed or not", function () {
      prettyFormatter.handleStepResultEvent(event, callback);
      expect(stepResult.isFailed).toHaveBeenCalled();
    });

    describe("when the step failed", function () {
      var exception;

      beforeEach(function () {
        exception = createSpy("exception");
        stepResult.isFailed.andReturn(true);
        spyOnStub(stepResult, 'getFailureException').andReturn(exception);
      });

      it("gets the failure exception", function () {
        prettyFormatter.handleStepResultEvent(event, callback);
        expect(stepResult.getFailureException).toHaveBeenCalled();
      });

      it("logs the failure stack when there is one, indented by three levels", function () {
        var stack  = "failure stack";
        var text = stack + "\n";
        exception.stack = stack;
        prettyFormatter.handleStepResultEvent(event, callback);
        expect(prettyFormatter.logIndented).toHaveBeenCalledWith(text, 3);
      });

      it("logs the failure itself when there no stack, indented by three levels", function () {
        exception = "exception text";
        var text  = exception + "\n";
        stepResult.getFailureException.andReturn(exception);
        prettyFormatter.handleStepResultEvent(event, callback);
        expect(prettyFormatter.logIndented).toHaveBeenCalledWith(text, 3);
      });
    });

    it("calls back", function () {
      prettyFormatter.handleStepResultEvent(event, callback);
      expect(callback).toHaveBeenCalled();
    });
  });

  describe("handleAfterFeaturesEvent()", function () {
    var event, callback, summary;

    beforeEach(function () {
      event    = createSpy("event");
      callback = createSpy("callback");
      summary  = createSpy("summary logs");
      spyOnStub(summaryFormatter, 'getLogs').andReturn(summary);
    });

    it("gets the summary from the summaryFormatter", function () {
      prettyFormatter.handleAfterFeaturesEvent(event, callback);
      expect(summaryFormatter.getLogs).toHaveBeenCalled();
    });

    it("logs one line feed", function () {
      prettyFormatter.handleAfterFeaturesEvent(event, callback);
      expect(prettyFormatter.log).toHaveBeenCalledWith("\n");
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
    var dataTable, rows;

    beforeEach(function () {
      rows = [
        ["cuk", "cuke", "cukejs"],
        ["c",   "cuke", "cuke.js"],
        ["cu",  "cuke", "cucumber"]
      ];
      stepResult = createSpyWithStubs("step result", { getStep: step, isFailed: null, isPending: null, isSuccessful: null, isUndefined: null, isSkipped: null });
      dataTable = createSpyWithStubs("data table", {raw: rows});
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
    var docString, contents;

    beforeEach(function () {
      contents  = "this is a multiline\ndoc string\n\n:-)";
      stepResult = createSpyWithStubs("step result", { getStep: step, isFailed: null, isPending: null, isSuccessful: null, isUndefined: null, isSkipped: null });
      docString = createSpyWithStubs("doc string", {getContents: contents});
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
      spyOn(prettyFormatter, 'indent').andReturn(indented);
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
