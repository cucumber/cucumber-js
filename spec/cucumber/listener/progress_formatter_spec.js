require('../../support/spec_helper');

describe("Cucumber.Listener.ProgressFormatter", function () {
  var Cucumber = requireLib('cucumber');
  var formatter, formatterHearMethod, summaryFormatter, progressFormatter, options;

  beforeEach(function () {
    options             = createSpy("options");
    formatter           = createSpyWithStubs("formatter", {log: null});
    formatterHearMethod = spyOnStub(formatter, 'hear');
    summaryFormatter    = createSpy("summaryFormatter");
    spyOn(Cucumber.Listener, 'Formatter').andReturn(formatter);
    spyOn(Cucumber.Listener, 'SummaryFormatter').andReturn(summaryFormatter);
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
      progressFormatter.hear(event, callback);
      expect(summaryFormatter.hear).toHaveBeenCalled();
      expect(summaryFormatter.hear).toHaveBeenCalledWithValueAsNthParameter(event, 1);
      expect(summaryFormatter.hear).toHaveBeenCalledWithAFunctionAsNthParameter(2);
    });

    describe("summary formatter callback", function () {
      var summaryFormatterCallback;

      beforeEach(function () {
        progressFormatter.hear(event, callback);
        summaryFormatterCallback = summaryFormatter.hear.mostRecentCall.args[1];
      });

      it("tells the formatter to listen to the event", function () {
        summaryFormatterCallback();
        expect(formatterHearMethod).toHaveBeenCalledWith(event, callback);
      });
    });
  });

  describe("handleStepResultEvent()", function () {
    var event, callback, stepResult;

    beforeEach(function () {
      stepResult = createSpyWithStubs("step result", {
        isSuccessful: undefined,
        isPending:    undefined,
        isFailed:     undefined,
        isSkipped:    undefined,
        isUndefined:  undefined
      });
      event      = createSpyWithStubs("event", {getPayloadItem: stepResult});
      callback   = createSpy("Callback");
      spyOn(progressFormatter, 'handleFailedStepResult');
    });

    it("gets the step result from the event payload", function () {
      progressFormatter.handleStepResultEvent(event, callback);
      expect(event.getPayloadItem).toHaveBeenCalledWith('stepResult');
    });

    it("checks whether the step was successful or not", function () {
      progressFormatter.handleStepResultEvent(event, callback);
      expect(stepResult.isSuccessful).toHaveBeenCalled();
    });

    describe("when the step passed", function () {
      beforeEach(function () {
        stepResult.isSuccessful.andReturn(true);
        spyOn(progressFormatter, 'handleSuccessfulStepResult');
      });

      it("handles the successful step result", function () {
        progressFormatter.handleStepResultEvent(event, callback);
        expect(progressFormatter.handleSuccessfulStepResult).toHaveBeenCalled();
      });
    });

    describe("when the step did not pass", function () {
      beforeEach(function () {
        stepResult.isSuccessful.andReturn(false);
        spyOn(progressFormatter, 'handleSuccessfulStepResult');
      });

      it("does not handle a successful step result", function () {
        progressFormatter.handleStepResultEvent(event, callback);
        expect(progressFormatter.handleSuccessfulStepResult).not.toHaveBeenCalled();
      });

      it("checks whether the step is pending", function () {
        progressFormatter.handleStepResultEvent(event, callback);
        expect(stepResult.isPending).toHaveBeenCalled();
      });

      describe("when the step was pending", function () {
        beforeEach(function () {
          stepResult.isPending.andReturn(true);
          spyOn(progressFormatter, 'handlePendingStepResult');
        });

        it("handles the pending step result", function () {
          progressFormatter.handleStepResultEvent(event, callback);
          expect(progressFormatter.handlePendingStepResult).toHaveBeenCalled();
        });
      });

      describe("when the step was not pending", function () {
        beforeEach(function () {
          stepResult.isPending.andReturn(false);
          spyOn(progressFormatter, 'handlePendingStepResult');
        });

        it("does not handle a pending step result", function () {
          progressFormatter.handleStepResultEvent(event, callback);
          expect(progressFormatter.handlePendingStepResult).not.toHaveBeenCalled();
        });

        it("checks whether the step was skipped", function () {
          progressFormatter.handleStepResultEvent(event, callback);
          expect(stepResult.isSkipped).toHaveBeenCalled();
        });

        describe("when the step was skipped", function () {
          beforeEach(function () {
            stepResult.isSkipped.andReturn(true);
            spyOn(progressFormatter, 'handleSkippedStepResult');
          });

          it("handles the skipped step result", function () {
            progressFormatter.handleStepResultEvent(event, callback);
            expect(progressFormatter.handleSkippedStepResult).toHaveBeenCalled();
          });
        });

        describe("when the step was not skipped", function () {
          beforeEach(function () {
            stepResult.isSkipped.andReturn(false);
            spyOn(progressFormatter, 'handleSkippedStepResult');
          });

          it("does not handle a skipped step result", function () {
            progressFormatter.handleStepResultEvent(event, callback);
            expect(progressFormatter.handleSkippedStepResult).not.toHaveBeenCalled();
          });

          it("checks whether the step was undefined", function () {
            progressFormatter.handleStepResultEvent(event, callback);
            expect(stepResult.isUndefined).toHaveBeenCalled();
          });

          describe("when the step was undefined", function () {
            beforeEach(function () {
              stepResult.isUndefined.andReturn(true);
              spyOn(progressFormatter, 'handleUndefinedStepResult');
            });

            it("handles the undefined step result", function () {
              progressFormatter.handleStepResultEvent(event, callback);
              expect(progressFormatter.handleUndefinedStepResult).toHaveBeenCalled();
            });
          });

          describe("when the step was not undefined", function () {
            beforeEach(function () {
              stepResult.isUndefined.andReturn(false);
              spyOn(progressFormatter, 'handleUndefinedStepResult');
            });

            it("does not handle a skipped step result", function () {
              progressFormatter.handleStepResultEvent(event, callback);
              expect(progressFormatter.handleSkippedStepResult).not.toHaveBeenCalled();
            });

            it("handles a failed step result", function () {
              progressFormatter.handleStepResultEvent(event, callback);
              expect(progressFormatter.handleFailedStepResult).toHaveBeenCalled();
            });
          });
        });
      });
    });

    it("calls back", function () {
      progressFormatter.handleStepResultEvent(event, callback);
      expect(callback).toHaveBeenCalled();
    });
  });

  describe("handleSuccessfulStepResult()", function () {
    it("logs the passing step character", function () {
      progressFormatter.handleSuccessfulStepResult();
      expect(progressFormatter.log).toHaveBeenCalledWith(Cucumber.Listener.ProgressFormatter.PASSED_STEP_CHARACTER);
    });
  });

  describe("handlePendingStepResult()", function () {
    it("logs the pending step character", function () {
      progressFormatter.handlePendingStepResult();
      expect(progressFormatter.log).toHaveBeenCalledWith(Cucumber.Listener.ProgressFormatter.PENDING_STEP_CHARACTER);
    });
  });

  describe("handleSkippedStepResult()", function () {
    it("logs the skipped step character", function () {
      progressFormatter.handleSkippedStepResult();
      expect(progressFormatter.log).toHaveBeenCalledWith(Cucumber.Listener.ProgressFormatter.SKIPPED_STEP_CHARACTER);
    });
  });

  describe("handleUndefinedStepResult()", function () {
    var step;

    beforeEach(function () {
      step = createSpy("step");
    });

    it("logs the undefined step character", function () {
      progressFormatter.handleUndefinedStepResult();
      expect(progressFormatter.log).toHaveBeenCalledWith(Cucumber.Listener.ProgressFormatter.UNDEFINED_STEP_CHARACTER);
    });
  });

  describe("handleFailedStepResult()", function () {
    var stepResult;

    beforeEach(function () {
      stepResult = createSpy("failed step result");
    });

    it("logs the failed step character", function () {
      progressFormatter.handleFailedStepResult();
      expect(progressFormatter.log).toHaveBeenCalledWith(Cucumber.Listener.ProgressFormatter.FAILED_STEP_CHARACTER);
    });
  });

  describe("handleAfterFeaturesEvent()", function () {
    var event, summaryLogs, callback;

    beforeEach(function () {
      event       = createSpy("event");
      callback    = createSpy("callback");
      summaryLogs = createSpy("summary logs");
      spyOnStub(summaryFormatter, 'getLogs').andReturn(summaryLogs);
    });

    it("gets the summary", function () {
      progressFormatter.handleAfterFeaturesEvent(event, callback);
      expect(summaryFormatter.getLogs).toHaveBeenCalled();
    });

    it("logs two line feeds", function () {
      progressFormatter.handleAfterFeaturesEvent(event, callback);
      expect(progressFormatter.log).toHaveBeenCalledWith("\n\n");
    });

    it("logs the summary", function () {
      progressFormatter.handleAfterFeaturesEvent(event, callback);
      expect(progressFormatter.log).toHaveBeenCalledWith(summaryLogs);
    });

    it("calls back", function () {
      progressFormatter.handleAfterFeaturesEvent(event, callback);
      expect(callback).toHaveBeenCalled();
    });
  });
});
