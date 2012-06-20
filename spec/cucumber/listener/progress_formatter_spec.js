require('../../support/spec_helper');

describe("Cucumber.Listener.ProgressFormatter", function () {
  var Cucumber = requireLib('cucumber');
  var listener, listenerHearMethod, summarizer, progressFormatter;

  beforeEach(function () {
    var ProgressFormatter = Cucumber.Listener.ProgressFormatter;
    listener           = createSpy("listener");
    listenerHearMethod = spyOnStub(listener, 'hear');
    summarizer         = createSpy("summarizer");
    spyOn(Cucumber, 'Listener').andReturn(listener);
    spyOnStub(Cucumber.Listener, 'Summarizer').andReturn(summarizer);
    Cucumber.Listener.ProgressFormatter = ProgressFormatter;
    progressFormatter                   = Cucumber.Listener.ProgressFormatter();
  });

  describe("constructor", function () {
    it("creates a listener", function() {
      expect(Cucumber.Listener).toHaveBeenCalled();
    });

    it("extends the listener", function () {
      expect(progressFormatter).toBe(listener);
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
      progressFormatter.hear(event, callback);
      expect(summarizer.hear).toHaveBeenCalled();
      expect(summarizer.hear).toHaveBeenCalledWithValueAsNthParameter(event, 1);
      expect(summarizer.hear).toHaveBeenCalledWithAFunctionAsNthParameter(2);
    });

    describe("summarizer callback", function () {
      var summarizerCallback;

      beforeEach(function () {
        progressFormatter.hear(event, callback);
        summarizerCallback = summarizer.hear.mostRecentCall.args[1];
      });

      it("tells the listener to listen to the event", function () {
        summarizerCallback();
        expect(listenerHearMethod).toHaveBeenCalledWith(event, callback);
      });
    });
  });

  describe("log()", function () {
    var logged, alsoLogged, loggedBuffer;

    beforeEach(function () {
      logged       = "this was logged";
      alsoLogged   = "this was also logged";
      loggedBuffer = logged + alsoLogged;
      spyOn(process.stdout, 'write');
    });

    it("records logged strings", function () {
      progressFormatter.log(logged);
      progressFormatter.log(alsoLogged);
      expect(progressFormatter.getLogs()).toBe(loggedBuffer);
    });

    it("outputs the logged string to STDOUT by default", function () {
        progressFormatter.log(logged);
        expect(process.stdout.write).toHaveBeenCalledWith(logged);
    });

    describe("when asked to output to STDOUT", function () {
      beforeEach(function () {
        progressFormatter = Cucumber.Listener.ProgressFormatter({logToConsole: true});
      });

      it("outputs the logged string to STDOUT", function () {
        progressFormatter.log(logged);
        expect(process.stdout.write).toHaveBeenCalledWith(logged);
      });
    });

    describe("when asked to not output to STDOUT", function () {
      beforeEach(function () {
        progressFormatter = Cucumber.Listener.ProgressFormatter({logToConsole: false});
      });

      it("does not output anything to STDOUT", function () {
        progressFormatter.log(logged);
        expect(process.stdout.write).not.toHaveBeenCalledWith(logged);
      });
    });

    describe("when asked to output to a function", function () {
      var userFunction;

      beforeEach(function () {
        userFunction      = createSpy("output user function");
        progressFormatter = Cucumber.Listener.ProgressFormatter({logToFunction: userFunction});
      });

      it("calls the function with the logged string", function () {
        progressFormatter.log(logged);
        expect(userFunction).toHaveBeenCalledWith(logged);
      });
    });
  });

  describe("getLogs()", function () {
    it("returns the logged buffer", function () {
      var logged       = "this was logged";
      var alsoLogged   = "this was also logged";
      var loggedBuffer = logged + alsoLogged;
      spyOn(process.stdout, 'write'); // prevent actual output during spec execution
      progressFormatter.log(logged);
      progressFormatter.log(alsoLogged);
      expect(progressFormatter.getLogs()).toBe(loggedBuffer);
    });

    it("returns an empty string when the progress formatter did not log anything yet", function () {
      expect(progressFormatter.getLogs()).toBe("");
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
    beforeEach(function () {
      spyOn(progressFormatter, 'log');
    });

    it("logs the passing step character", function () {
      progressFormatter.handleSuccessfulStepResult();
      expect(progressFormatter.log).toHaveBeenCalledWith(Cucumber.Listener.ProgressFormatter.PASSED_STEP_CHARACTER);
    });
  });

  describe("handlePendingStepResult()", function () {
    beforeEach(function () {
      spyOn(progressFormatter, 'log')
    });

    it("logs the pending step character", function () {
      progressFormatter.handlePendingStepResult();
      expect(progressFormatter.log).toHaveBeenCalledWith(Cucumber.Listener.ProgressFormatter.PENDING_STEP_CHARACTER);
    });
  });

  describe("handleSkippedStepResult()", function () {
    beforeEach(function () {
      spyOn(progressFormatter, 'log');
    });

    it("logs the skipped step character", function () {
      progressFormatter.handleSkippedStepResult();
      expect(progressFormatter.log).toHaveBeenCalledWith(Cucumber.Listener.ProgressFormatter.SKIPPED_STEP_CHARACTER);
    });
  });

  describe("handleUndefinedStepResult()", function () {
    var stepResult, step;

    beforeEach(function () {
      step       = createSpy("step");
      spyOn(progressFormatter, 'log');
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
      spyOn(progressFormatter, 'log');
    });

    it("logs the failed step character", function () {
      progressFormatter.handleFailedStepResult();
      expect(progressFormatter.log).toHaveBeenCalledWith(Cucumber.Listener.ProgressFormatter.FAILED_STEP_CHARACTER);
    });
  });

  describe("handleAfterFeaturesEvent()", function () {
    var features, summaryLogs, callback;

    beforeEach(function () {
      event       = createSpy("event");
      callback    = createSpy("callback");
      summaryLogs = createSpy("summary logs");
      spyOnStub(summarizer, 'getLogs').andReturn(summaryLogs);
      spyOn(progressFormatter, 'log');
    });

    it("gets the summary", function () {
      progressFormatter.handleAfterFeaturesEvent(event, callback);
      expect(summarizer.getLogs).toHaveBeenCalled();
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
