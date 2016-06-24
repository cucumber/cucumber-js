require('../../support/spec_helper');

describe("Cucumber.Listener.ProgressFormatter", function () {
  var Cucumber = requireLib('cucumber');
  var colors = require('colors/safe');
  colors.enabled = true;
  var formatter, formatterHearMethod, summaryFormatter, progressFormatter, options;

  beforeEach(function () {
    options             = {useColors: true};
    formatter           = createSpyWithStubs("formatter", {finish: null, log: null});
    formatterHearMethod = spyOnStub(formatter, 'hear');
    summaryFormatter    = createSpy("summaryFormatter");
    spyOn(Cucumber.Listener, 'Formatter').and.returnValue(formatter);
    spyOn(Cucumber.Listener, 'SummaryFormatter').and.returnValue(summaryFormatter);
    progressFormatter = Cucumber.Listener.ProgressFormatter(options);
  });

  describe("constructor", function () {
    it("creates a formatter", function () {
      expect(Cucumber.Listener.Formatter).toHaveBeenCalledWith(options);
    });

    it("extends the formatter", function () {
      expect(progressFormatter).toBe(formatter);
    });

    it("creates a summary formatter", function () {
      expect(Cucumber.Listener.SummaryFormatter).toHaveBeenCalled();
    });
  });

  describe("hear()", function () {
    var event, defaultTimeout, callback;

    beforeEach(function () {
      event = createSpy("event");
      defaultTimeout = createSpy("defaultTimeout");
      callback = createSpy("callback");
      spyOnStub(summaryFormatter, 'hear');
    });

    it("tells the summary formatter to listen to the event", function () {
      progressFormatter.hear(event, defaultTimeout, callback);
      expect(summaryFormatter.hear).toHaveBeenCalled();
      expect(summaryFormatter.hear).toHaveBeenCalledWithValueAsNthParameter(event, 1);
      expect(summaryFormatter.hear).toHaveBeenCalledWithValueAsNthParameter(defaultTimeout, 2);
      expect(summaryFormatter.hear).toHaveBeenCalledWithAFunctionAsNthParameter(3);
    });

    describe("summary formatter callback", function () {
      var summaryFormatterCallback;

      beforeEach(function () {
        progressFormatter.hear(event, defaultTimeout, callback);
        summaryFormatterCallback = summaryFormatter.hear.calls.mostRecent().args[2];
      });

      it("tells the formatter to listen to the event", function () {
        summaryFormatterCallback();
        expect(formatterHearMethod).toHaveBeenCalledWith(event, defaultTimeout, callback);
      });
    });
  });

  describe("handleStepResultEvent()", function () {
    var step, stepResult;

    beforeEach(function () {
      step       = createSpyWithStubs("step", {isHidden: false});
      stepResult = createSpyWithStubs("step result", {getStatus: undefined, getStep: step});
    });

    describe("when the is step hidden", function () {
      beforeEach(function () {
        step.isHidden.and.returnValue(true);
      });

      describe("when the step failed", function () {
        beforeEach(function () {
          stepResult.getStatus.and.returnValue(Cucumber.Status.FAILED);
          progressFormatter.handleStepResultEvent(stepResult);
        });

        it("logs the step result", function () {
          expect(progressFormatter.log).toHaveBeenCalledWith(colors.red('F'));
        });
      });

      describe("when the step passed", function () {
        beforeEach(function () {
          stepResult.getStatus.and.returnValue(Cucumber.Status.PASSED);
          progressFormatter.handleStepResultEvent(stepResult);
        });

        it("does not log", function () {
          expect(progressFormatter.log).not.toHaveBeenCalled();
        });
      });
    });

    describe("when the is step not hidden", function () {
      beforeEach(function () {
        step.isHidden.and.returnValue(false);
      });

      describe("when the step failed", function () {
        beforeEach(function () {
          stepResult.getStatus.and.returnValue(Cucumber.Status.FAILED);
          progressFormatter.handleStepResultEvent(stepResult);
        });

        it("logs the step result", function () {
          expect(progressFormatter.log).toHaveBeenCalledWith(colors.red('F'));
        });
      });

      describe("when the step passed", function () {
        beforeEach(function () {
          stepResult.getStatus.and.returnValue(Cucumber.Status.PASSED);
          progressFormatter.handleStepResultEvent(stepResult);
        });

        it("logs the step result", function () {
          expect(progressFormatter.log).toHaveBeenCalledWith(colors.green('.'));
        });
      });

      describe("when the step is pending", function () {
        beforeEach(function () {
          stepResult.getStatus.and.returnValue(Cucumber.Status.PENDING);
          progressFormatter.handleStepResultEvent(stepResult);
        });

        it("logs the step result", function () {
          expect(progressFormatter.log).toHaveBeenCalledWith(colors.yellow('P'));
        });
      });

      describe("when the step was skipped", function () {
        beforeEach(function () {
          stepResult.getStatus.and.returnValue(Cucumber.Status.SKIPPED);
          progressFormatter.handleStepResultEvent(stepResult);
        });

        it("logs the step result", function () {
          expect(progressFormatter.log).toHaveBeenCalledWith(colors.cyan('-'));
        });
      });

      describe("when the step was undefined", function () {
        beforeEach(function () {
          stepResult.getStatus.and.returnValue(Cucumber.Status.UNDEFINED);
          progressFormatter.handleStepResultEvent(stepResult);
        });

        it("logs the step result", function () {
          expect(progressFormatter.log).toHaveBeenCalledWith(colors.yellow('U'));
        });
      });
    });
  });

  describe("handleAfterFeaturesEvent()", function () {
    var summaryLogs, callback;

    beforeEach(function () {
      callback    = createSpy("callback");
      summaryLogs = createSpy("summary logs");
      spyOnStub(summaryFormatter, 'getLogs').and.returnValue(summaryLogs);
    });

    it("gets the summary", function () {
      progressFormatter.handleAfterFeaturesEvent([], callback);
      expect(summaryFormatter.getLogs).toHaveBeenCalled();
    });

    it("logs two line feeds", function () {
      progressFormatter.handleAfterFeaturesEvent([], callback);
      expect(progressFormatter.log).toHaveBeenCalledWith("\n\n");
    });

    it("logs the summary", function () {
      progressFormatter.handleAfterFeaturesEvent([], callback);
      expect(progressFormatter.log).toHaveBeenCalledWith(summaryLogs);
    });

    it("calls finish with the callback", function () {
      progressFormatter.handleAfterFeaturesEvent([], callback);
      expect(progressFormatter.finish).toHaveBeenCalledWith(callback);
    });
  });
});
