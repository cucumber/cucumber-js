require('../../support/spec_helper');

describe("Cucumber.Listener.PrettyFormatter", function () {
  var Cucumber = requireLib('cucumber');
  var formatter, formatterHearMethod, summarizer, prettyFormatter, options;

  beforeEach(function () {
    options             = createSpy(options);
    formatter           = createSpyWithStubs("formatter", {log: null});
    formatterHearMethod = spyOnStub(formatter, 'hear');
    summarizer          = createSpy("summarizer");
    spyOn(Cucumber.Listener, 'Formatter').andReturn(formatter);
    spyOn(Cucumber.Listener, 'Summarizer').andReturn(summarizer);
    prettyFormatter = Cucumber.Listener.PrettyFormatter(options);
  });

  describe("constructor", function () {
    it("creates a formatter", function() {
      expect(Cucumber.Listener.Formatter).toHaveBeenCalledWith(options);
    });

    it("extends the formatter", function () {
      expect(prettyFormatter).toBe(formatter);
    });

    it("creates a summarizer", function () {
      expect(Cucumber.Listener.Summarizer).toHaveBeenCalled();
    });
  });

  describe("hear()", function () {
    var event, callback;

    beforeEach(function () {
      event    = createSpy("event");
      callback = createSpy("callback");
      spyOnStub(summarizer, 'hear');
    });

    it("tells the summarizer to listen to the event", function () {
      prettyFormatter.hear(event, callback);
      expect(summarizer.hear).toHaveBeenCalled();
      expect(summarizer.hear).toHaveBeenCalledWithValueAsNthParameter(event, 1);
      expect(summarizer.hear).toHaveBeenCalledWithAFunctionAsNthParameter(2);
    });

    describe("summarizer callback", function () {
      var summarizerCallback;

      beforeEach(function () {
        prettyFormatter.hear(event, callback);
        summarizerCallback = summarizer.hear.mostRecentCall.args[1];
      });

      it("tells the formatter to listen to the event", function () {
        summarizerCallback();
        expect(formatterHearMethod).toHaveBeenCalledWith(event, callback);
      });
    });
  });

  describe("handleBeforeFeatureEvent()", function () {
    var event, feature, keyword, name, callback;

    beforeEach(function () {
      keyword  = "feature-keyword";
      name     = "feature-name";
      feature  = createSpyWithStubs("feature", { getKeyword: keyword, getName: name });
      event    = createSpyWithStubs("event", { getPayloadItem: feature });
      callback = createSpy("callback");
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
      var text = keyword + ": " + name + "\n\n";
      expect(prettyFormatter.log).toHaveBeenCalledWith(text);
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
      scenario = createSpyWithStubs("scenario", { getKeyword: keyword, getName: name });
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
      var text = keyword + ": " + name + "\n";
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
      step       = createSpyWithStubs("step", { getKeyword: keyword, getName: name });
      stepResult = createSpyWithStubs("step result", { getStep: step, isFailed: null });
      event      = createSpyWithStubs("event", { getPayloadItem: stepResult });
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
      expect(prettyFormatter.logIndented).toHaveBeenCalledWith(text, 2);
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
      spyOnStub(summarizer, 'getLogs').andReturn(summary);
    });

    it("gets the summary from the summarizer", function () {
      prettyFormatter.handleAfterFeaturesEvent(event, callback);
      expect(summarizer.getLogs).toHaveBeenCalled();
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
