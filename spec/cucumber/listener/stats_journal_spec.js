require('../../support/spec_helper');

describe("Cucumber.Listener.StatsJournal", function () {
  var Cucumber = requireLib('cucumber');
  var statsJournal, listener;

  beforeEach(function () {
    var StatsJournal   = Cucumber.Listener.StatsJournal;
    listener           = createSpyWithStubs("listener");
    spyOn(Cucumber, 'Listener').andReturn(listener);
    Cucumber.Listener.StatsJournal = StatsJournal;
    statsJournal = Cucumber.Listener.StatsJournal();
  });

  it("is based on the listener", function () {
    expect(statsJournal).toBe(listener);
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
      spyOn(statsJournal, 'handleFailedStepResult');
    });

    it("gets the step result from the event payload", function () {
      statsJournal.handleStepResultEvent(event, callback);
      expect(event.getPayloadItem).toHaveBeenCalledWith('stepResult');
    });

    it("checks whether the step was successful or not", function () {
      statsJournal.handleStepResultEvent(event, callback);
      expect(stepResult.isSuccessful).toHaveBeenCalled();
    });

    describe("when the step passed", function () {
      beforeEach(function () {
        stepResult.isSuccessful.andReturn(true);
        spyOn(statsJournal, 'handleSuccessfulStepResult');
      });

      it("handles the successful step result", function () {
        statsJournal.handleStepResultEvent(event, callback);
        expect(statsJournal.handleSuccessfulStepResult).toHaveBeenCalled();
      });
    });

    describe("when the step did not pass", function () {
      beforeEach(function () {
        stepResult.isSuccessful.andReturn(false);
        spyOn(statsJournal, 'handleSuccessfulStepResult');
      });

      it("does not handle a successful step result", function () {
        statsJournal.handleStepResultEvent(event, callback);
        expect(statsJournal.handleSuccessfulStepResult).not.toHaveBeenCalled();
      });

      it("checks whether the step is pending", function () {
        statsJournal.handleStepResultEvent(event, callback);
        expect(stepResult.isPending).toHaveBeenCalled();
      });

      describe("when the step was pending", function () {
        beforeEach(function () {
          stepResult.isPending.andReturn(true);
          spyOn(statsJournal, 'handlePendingStepResult');
        });

        it("handles the pending step result", function () {
          statsJournal.handleStepResultEvent(event, callback);
          expect(statsJournal.handlePendingStepResult).toHaveBeenCalled();
        });
      });

      describe("when the step was not pending", function () {
        beforeEach(function () {
          stepResult.isPending.andReturn(false);
          spyOn(statsJournal, 'handlePendingStepResult');
        });

        it("does not handle a pending step result", function () {
          statsJournal.handleStepResultEvent(event, callback);
          expect(statsJournal.handlePendingStepResult).not.toHaveBeenCalled();
        });

        it("checks whether the step was skipped", function () {
          statsJournal.handleStepResultEvent(event, callback);
          expect(stepResult.isSkipped).toHaveBeenCalled();
        });

        describe("when the step was skipped", function () {
          beforeEach(function () {
            stepResult.isSkipped.andReturn(true);
            spyOn(statsJournal, 'handleSkippedStepResult');
          });

          it("handles the skipped step result", function () {
            statsJournal.handleStepResultEvent(event, callback);
            expect(statsJournal.handleSkippedStepResult).toHaveBeenCalled();
          });
        });

        describe("when the step was not skipped", function () {
          beforeEach(function () {
            stepResult.isSkipped.andReturn(false);
            spyOn(statsJournal, 'handleSkippedStepResult');
          });

          it("does not handle a skipped step result", function () {
            statsJournal.handleStepResultEvent(event, callback);
            expect(statsJournal.handleSkippedStepResult).not.toHaveBeenCalled();
          });

          it("checks whether the step was undefined", function () {
            statsJournal.handleStepResultEvent(event, callback);
            expect(stepResult.isUndefined).toHaveBeenCalled();
          });

          describe("when the step was undefined", function () {
            beforeEach(function () {
              stepResult.isUndefined.andReturn(true);
              spyOn(statsJournal, 'handleUndefinedStepResult');
            });

            it("handles the undefined step result", function () {
              statsJournal.handleStepResultEvent(event, callback);
              expect(statsJournal.handleUndefinedStepResult).toHaveBeenCalledWith(stepResult);
            });
          });

          describe("when the step was not undefined", function () {
            beforeEach(function () {
              stepResult.isUndefined.andReturn(false);
              spyOn(statsJournal, 'handleUndefinedStepResult');
            });

            it("does not handle a skipped step result", function () {
              statsJournal.handleStepResultEvent(event, callback);
              expect(statsJournal.handleSkippedStepResult).not.toHaveBeenCalled();
            });

            it("handles a failed step result", function () {
              statsJournal.handleStepResultEvent(event, callback);
              expect(statsJournal.handleFailedStepResult).toHaveBeenCalledWith(stepResult);
            });
          });
        });
      });
    });

    it("calls back", function () {
      statsJournal.handleStepResultEvent(event, callback);
      expect(callback).toHaveBeenCalled();
    });
  });

  describe("handleSuccessfulStepResult()", function () {
    beforeEach(function () {
      spyOn(statsJournal, 'witnessPassedStep');
    });

    it("witnesses a passed step", function () {
      statsJournal.handleSuccessfulStepResult();
      expect(statsJournal.witnessPassedStep).toHaveBeenCalled();
    });
  });

  describe("handlePendingStepResult()", function () {
    beforeEach(function () {
      spyOn(statsJournal, 'witnessPendingStep');
      spyOn(statsJournal, 'markCurrentScenarioAsPending');
    });

    it("witnesses a pending step", function () {
      statsJournal.handlePendingStepResult();
      expect(statsJournal.witnessPendingStep).toHaveBeenCalled();
    });

    it("marks the current scenario as pending", function () {
      statsJournal.handlePendingStepResult();
      expect(statsJournal.markCurrentScenarioAsPending).toHaveBeenCalled();
    });
  });

  describe("handleSkippedStepResult()", function () {
    beforeEach(function () {
      spyOn(statsJournal, 'witnessSkippedStep');
    });

    it("witnesses more skipped step", function () {
      statsJournal.handleSkippedStepResult();
      expect(statsJournal.witnessSkippedStep).toHaveBeenCalled();
    });
  });

  describe("handleUndefinedStepResult()", function () {
    var stepResult, step;

    beforeEach(function () {
      step       = createSpy("step");
      stepResult = createSpyWithStubs("step result", {getStep: step});
      spyOn(statsJournal, 'witnessUndefinedStep');
      spyOn(statsJournal, 'markCurrentScenarioAsUndefined');
    });

    it("gets the step from the step result", function () {
      statsJournal.handleUndefinedStepResult(stepResult);
      expect(stepResult.getStep).toHaveBeenCalled();
    });

    it("witnesses an undefined step", function () {
      statsJournal.handleUndefinedStepResult(stepResult);
      expect(statsJournal.witnessUndefinedStep).toHaveBeenCalled();
    });

    it("marks the current scenario as undefined", function () {
      statsJournal.handleUndefinedStepResult(stepResult);
      expect(statsJournal.markCurrentScenarioAsUndefined).toHaveBeenCalled();
    });
  });

  describe("handleFailedStepResult()", function () {
    var stepResult;

    beforeEach(function () {
      stepResult = createSpy("failed step result");
      spyOn(statsJournal, 'witnessFailedStep');
      spyOn(statsJournal, 'markCurrentScenarioAsFailing');
    });

    it("witnesses a failed step", function () {
      statsJournal.handleFailedStepResult(stepResult);
      expect(statsJournal.witnessFailedStep).toHaveBeenCalled();
    });

    it("marks the current scenario as failing", function () {
      statsJournal.handleFailedStepResult(stepResult);
      expect(statsJournal.markCurrentScenarioAsFailing).toHaveBeenCalled();
    });
  });

  describe("handleBeforeScenarioEvent", function () {
    var event, callback;

    beforeEach(function () {
      event    = createSpy("event");
      callback = createSpy("callback");
      spyOn(statsJournal, 'prepareBeforeScenario');
    });

    it("prepares for a new scenario", function () {
      statsJournal.handleBeforeScenarioEvent(event, callback);
      expect(statsJournal.prepareBeforeScenario).toHaveBeenCalled();
    });

    it("calls back", function () {
      statsJournal.handleBeforeScenarioEvent(event, callback);
      expect(callback).toHaveBeenCalled();
    });
  });

  describe("handleAfterScenarioEvent()", function () {
    var event, callback;

    beforeEach(function () {
      event    = createSpy("event");
      callback = createSpy("callback");
      spyOn(statsJournal, 'isCurrentScenarioFailing');
      spyOn(statsJournal, 'witnessPassedScenario');
      spyOn(statsJournal, 'witnessUndefinedScenario');
      spyOn(statsJournal, 'witnessPendingScenario');
      spyOn(statsJournal, 'witnessFailedScenario');
    });

    it("checks whether the current scenario failed", function () {
      statsJournal.handleAfterScenarioEvent(event, callback);
      expect(statsJournal.isCurrentScenarioFailing).toHaveBeenCalled();
    });

    describe("when the current scenario failed", function () {
      var scenario;

      beforeEach(function () {
        scenario = createSpy("scenario");
        statsJournal.isCurrentScenarioFailing.andReturn(true);
        spyOnStub(event, 'getPayloadItem').andReturn(scenario);
      });

      it("witnesses a failed scenario", function () {
        statsJournal.handleAfterScenarioEvent(event, callback);
        expect(statsJournal.witnessFailedScenario).toHaveBeenCalled();
      });

      it("gets the scenario from the payload", function () {
        statsJournal.handleAfterScenarioEvent(event, callback);
        expect(event.getPayloadItem).toHaveBeenCalledWith('scenario');
      });
    });

    describe("when the current scenario did not fail", function () {
      beforeEach(function () {
        statsJournal.isCurrentScenarioFailing.andReturn(false);
        spyOn(statsJournal, 'isCurrentScenarioUndefined');
      });

      it("checks whether the current scenario is undefined", function () {
        statsJournal.handleAfterScenarioEvent(event, callback);
        expect(statsJournal.isCurrentScenarioUndefined).toHaveBeenCalled();
      });

      describe("when the current scenario is undefined", function () {
        beforeEach(function () {
          statsJournal.isCurrentScenarioUndefined.andReturn(true);
        });

        it("witnesses an undefined scenario", function () {
          statsJournal.handleAfterScenarioEvent(event, callback);
          expect(statsJournal.witnessUndefinedScenario).toHaveBeenCalled();
        });
      });

      describe("when the current scenario is not undefined", function () {
        beforeEach(function () {
          statsJournal.isCurrentScenarioUndefined.andReturn(false);
          spyOn(statsJournal, 'isCurrentScenarioPending');
        });

        it("checks whether the current scenario is pending", function () {
          statsJournal.handleAfterScenarioEvent(event, callback);
          expect(statsJournal.isCurrentScenarioPending).toHaveBeenCalled();
        });

        describe("when the current scenario is pending", function () {
          beforeEach(function () {
            statsJournal.isCurrentScenarioPending.andReturn(true);
          });

          it("witnesses a pending scenario", function () {
            statsJournal.handleAfterScenarioEvent(event, callback);
            expect(statsJournal.witnessPendingScenario).toHaveBeenCalled();
          });
        });

        describe("when the current scenario is not pending (passed)", function () {
          beforeEach(function () {
            statsJournal.isCurrentScenarioPending.andReturn(false);
          });

          it("witnesses a passed scenario", function () {
            statsJournal.handleAfterScenarioEvent(event, callback);
            expect(statsJournal.witnessPassedScenario).toHaveBeenCalled();
          });
        });
      });
    });
    it("calls back", function () {
      statsJournal.handleAfterScenarioEvent(event, callback);
      expect(callback).toHaveBeenCalled();
    });
  });

  describe("isCurrentScenarioFailing()", function () {
    it("returns false when the current scenario did not fail yet", function () {
      expect(statsJournal.isCurrentScenarioFailing()).toBeFalsy();
    });

    it("returns true when a step in the current scenario failed", function () {
      statsJournal.markCurrentScenarioAsFailing();
      expect(statsJournal.isCurrentScenarioFailing()).toBeTruthy();
    });
  });

  describe("isCurrentScenarioPending()", function () {
    it("returns false when the current scenario was not set pending yet", function () {
      expect(statsJournal.isCurrentScenarioPending()).toBeFalsy();
    });

    it("returns true when the current scenario was set pending", function () {
      statsJournal.markCurrentScenarioAsPending();
      expect(statsJournal.isCurrentScenarioPending()).toBeTruthy();
    });
  });

  describe("isCurrentScenarioUndefined()", function () {
    it("returns false when the current scenario was not set undefined yet", function () {
      expect(statsJournal.isCurrentScenarioUndefined()).toBeFalsy();
    });

    it("returns true when the current scenario was set undefined", function () {
      statsJournal.markCurrentScenarioAsUndefined();
      expect(statsJournal.isCurrentScenarioUndefined()).toBeTruthy();
    });
  });

  describe("prepareBeforeScenario()", function () {
    it("unmarks the current scenario as pending", function () {
      statsJournal.markCurrentScenarioAsPending();
      statsJournal.prepareBeforeScenario();
      expect(statsJournal.isCurrentScenarioPending()).toBeFalsy();
    });

    it("unmarks the current scenario as failing", function () {
      statsJournal.markCurrentScenarioAsFailing();
      statsJournal.prepareBeforeScenario();
      expect(statsJournal.isCurrentScenarioFailing()).toBeFalsy();
    });

    it("unmarks the current scenario as undefined", function () {
      statsJournal.markCurrentScenarioAsUndefined();
      statsJournal.prepareBeforeScenario();
      expect(statsJournal.isCurrentScenarioUndefined()).toBeFalsy();
    });
  });

  describe("getScenarioCount()", function () {
    var passedScenarioCount, undefinedScenarioCount, pendingScenarioCount, failedScenarioCount;

    beforeEach(function () {
      passedScenarioCount    = Math.floor(Math.random()*11) + 1;
      undefinedScenarioCount = Math.floor(Math.random()*11) + 1;
      pendingScenarioCount   = Math.floor(Math.random()*11) + 1;
      failedScenarioCount    = Math.floor(Math.random()*11) + 1;
      spyOn(statsJournal, 'getPassedScenarioCount').andReturn(passedScenarioCount);
      spyOn(statsJournal, 'getUndefinedScenarioCount').andReturn(undefinedScenarioCount);
      spyOn(statsJournal, 'getPendingScenarioCount').andReturn(pendingScenarioCount);
      spyOn(statsJournal, 'getFailedScenarioCount').andReturn(failedScenarioCount);
    });

    it("gets the number of passed scenarios", function () {
      statsJournal.getScenarioCount();
      expect(statsJournal.getPassedScenarioCount).toHaveBeenCalled();
    });

    it("gets the number of undefined scenarios", function () {
      statsJournal.getScenarioCount();
      expect(statsJournal.getUndefinedScenarioCount).toHaveBeenCalled();
    });

    it("gets the number of pending scenarios", function () {
      statsJournal.getScenarioCount();
      expect(statsJournal.getPendingScenarioCount).toHaveBeenCalled();
    });

    it("gets the number of failed scenarios", function () {
      statsJournal.getScenarioCount();
      expect(statsJournal.getFailedScenarioCount).toHaveBeenCalled();
    });

    it("returns the sum of passed, undefined, pending aand failed scenarios", function () {
      expect(statsJournal.getScenarioCount()).toBe(passedScenarioCount + undefinedScenarioCount + pendingScenarioCount + failedScenarioCount);
    });
  });

  describe("getStepCount()", function () {
    var passedStepCount, undefinedStepCount, skippedStepCount, pendingStepCount, failedStepCount, stepCount;

    beforeEach(function () {
      passedStepCount    = Math.floor(Math.random()*11) + 1;
      undefinedStepCount = Math.floor(Math.random()*11) + 1;
      skippedStepCount   = Math.floor(Math.random()*11) + 1;
      pendingStepCount   = Math.floor(Math.random()*11) + 1;
      failedStepCount    = Math.floor(Math.random()*11) + 1;
      stepCount          =
        undefinedStepCount +
        passedStepCount    +
        skippedStepCount   +
        pendingStepCount   +
        failedStepCount;
      spyOn(statsJournal, 'getPassedStepCount').andReturn(passedStepCount);
      spyOn(statsJournal, 'getUndefinedStepCount').andReturn(undefinedStepCount);
      spyOn(statsJournal, 'getSkippedStepCount').andReturn(skippedStepCount);
      spyOn(statsJournal, 'getPendingStepCount').andReturn(pendingStepCount);
      spyOn(statsJournal, 'getFailedStepCount').andReturn(failedStepCount);
    });

    it("gets the number of passed steps", function () {
      statsJournal.getStepCount();
      expect(statsJournal.getPassedStepCount).toHaveBeenCalled();
    });

    it("gets the number of undefined steps", function () {
      statsJournal.getStepCount();
      expect(statsJournal.getUndefinedStepCount).toHaveBeenCalled();
    });

    it("gets the number of skipped steps", function () {
      statsJournal.getStepCount();
      expect(statsJournal.getSkippedStepCount).toHaveBeenCalled();
    });

    it("gets the number of pending steps", function () {
      statsJournal.getStepCount();
      expect(statsJournal.getPendingStepCount).toHaveBeenCalled();
    });

    it("gets the number of failed steps", function () {
      statsJournal.getStepCount();
      expect(statsJournal.getFailedStepCount).toHaveBeenCalled();
    });

    it("returns the sum of passed steps and failed steps", function () {
      expect(statsJournal.getStepCount()).toBe(stepCount);
    });
  });

  describe("passed scenario counting", function () {
    describe("witnessPassedScenario()", function () {
      it("counts one more passed scenario", function () {
        var beforeCountOne = statsJournal.getPassedScenarioCount();
        statsJournal.witnessPassedScenario();
        expect(statsJournal.getPassedScenarioCount()).toBe(beforeCountOne + 1);
      });
    });

    describe("getPassedScenarioCount()", function () {
      it("returns 0 when no scenario passed", function () {
        expect(statsJournal.getPassedScenarioCount()).toBe(0);
      });

      it("returns 1 when one scenario passed", function () {
        statsJournal.witnessPassedScenario();
        expect(statsJournal.getPassedScenarioCount()).toBe(1);
      });

      it("returns 2 when two scenarios passed", function () {
        statsJournal.witnessPassedScenario();
        statsJournal.witnessPassedScenario();
        expect(statsJournal.getPassedScenarioCount()).toBe(2);
      });

      it("returns 3 when three scenarios passed", function () {
        statsJournal.witnessPassedScenario();
        statsJournal.witnessPassedScenario();
        statsJournal.witnessPassedScenario();
        expect(statsJournal.getPassedScenarioCount()).toBe(3);
      });
    });
  });

  describe("undefined scenario counting", function () {
    describe("getUndefinedScenarioCount()", function () {
      it("returns 0 when no scenarios undefined", function () {
        expect(statsJournal.getUndefinedScenarioCount()).toBe(0);
      });

      it("returns 1 when one scenario passed", function () {
        statsJournal.witnessUndefinedScenario();
        expect(statsJournal.getUndefinedScenarioCount()).toBe(1);
      });

      it("returns 2 when two scenarios passed", function () {
        statsJournal.witnessUndefinedScenario();
        statsJournal.witnessUndefinedScenario();
        expect(statsJournal.getUndefinedScenarioCount()).toBe(2);
      });

      it("returns 3 when two scenarios passed", function () {
        statsJournal.witnessUndefinedScenario();
        statsJournal.witnessUndefinedScenario();
        statsJournal.witnessUndefinedScenario();
        expect(statsJournal.getUndefinedScenarioCount()).toBe(3);
      });
    });
  });

  describe("pending scenario counting", function () {
    describe("getPendingScenarioCount()", function () {
      it("returns 0 when no scenarios pending", function () {
        expect(statsJournal.getPendingScenarioCount()).toBe(0);
      });

      it("returns 1 when one scenario passed", function () {
        statsJournal.witnessPendingScenario();
        expect(statsJournal.getPendingScenarioCount()).toBe(1);
      });

      it("returns 2 when two scenarios passed", function () {
        statsJournal.witnessPendingScenario();
        statsJournal.witnessPendingScenario();
        expect(statsJournal.getPendingScenarioCount()).toBe(2);
      });

      it("returns 3 when two scenarios passed", function () {
        statsJournal.witnessPendingScenario();
        statsJournal.witnessPendingScenario();
        statsJournal.witnessPendingScenario();
        expect(statsJournal.getPendingScenarioCount()).toBe(3);
      });
    });
  });

  describe("failed scenario counting", function () {
    describe("getFailedScenarioCount()", function () {
      it("returns 0 when no scenarios failed", function () {
        expect(statsJournal.getFailedScenarioCount()).toBe(0);
      });

      it("returns 1 when one scenario passed", function () {
        statsJournal.witnessFailedScenario();
        expect(statsJournal.getFailedScenarioCount()).toBe(1);
      });

      it("returns 2 when two scenarios passed", function () {
        statsJournal.witnessFailedScenario();
        statsJournal.witnessFailedScenario();
        expect(statsJournal.getFailedScenarioCount()).toBe(2);
      });

      it("returns 3 when two scenarios passed", function () {
        statsJournal.witnessFailedScenario();
        statsJournal.witnessFailedScenario();
        statsJournal.witnessFailedScenario();
        expect(statsJournal.getFailedScenarioCount()).toBe(3);
      });
    });
  });

  describe("passed step counting", function () {
    describe("witnessPassedStep()", function () {
      it("counts one more passed step", function () {
        var beforeCountOne = statsJournal.getPassedStepCount();
        statsJournal.witnessPassedStep();
        expect(statsJournal.getPassedStepCount()).toBe(beforeCountOne + 1);
      });
    });

    describe("getPassedStepCount()", function () {
      it("returns 0 when no step passed", function () {
        expect(statsJournal.getPassedStepCount()).toBe(0);
      });

      it("returns 1 when one step passed", function () {
        statsJournal.witnessPassedStep();
        expect(statsJournal.getPassedStepCount()).toBe(1);
      });

      it("returns 2 when two steps passed", function () {
        statsJournal.witnessPassedStep();
        statsJournal.witnessPassedStep();
        expect(statsJournal.getPassedStepCount()).toBe(2);
      });

      it("returns 3 when three steps passed", function () {
        statsJournal.witnessPassedStep();
        statsJournal.witnessPassedStep();
        statsJournal.witnessPassedStep();
        expect(statsJournal.getPassedStepCount()).toBe(3);
      });
    });
  });

  describe("failed step counting", function () {
    describe("getFailedStepCount()", function () {
      it("returns 0 when no steps failed", function () {
        expect(statsJournal.getFailedStepCount()).toBe(0);
      });

      it("returns 1 when one step passed", function () {
        statsJournal.witnessFailedStep();
        expect(statsJournal.getFailedStepCount()).toBe(1);
      });

      it("returns 2 when two steps passed", function () {
        statsJournal.witnessFailedStep();
        statsJournal.witnessFailedStep();
        expect(statsJournal.getFailedStepCount()).toBe(2);
      });

      it("returns 3 when two steps passed", function () {
        statsJournal.witnessFailedStep();
        statsJournal.witnessFailedStep();
        statsJournal.witnessFailedStep();
        expect(statsJournal.getFailedStepCount()).toBe(3);
      });
    });
  });

  describe("skipped step counting", function () {
    describe("getSkippedStepCount()", function () {
      it("returns 0 when no steps skipped", function () {
        expect(statsJournal.getSkippedStepCount()).toBe(0);
      });

      it("returns 1 when one step passed", function () {
        statsJournal.witnessSkippedStep();
        expect(statsJournal.getSkippedStepCount()).toBe(1);
      });

      it("returns 2 when two steps passed", function () {
        statsJournal.witnessSkippedStep();
        statsJournal.witnessSkippedStep();
        expect(statsJournal.getSkippedStepCount()).toBe(2);
      });

      it("returns 3 when two steps passed", function () {
        statsJournal.witnessSkippedStep();
        statsJournal.witnessSkippedStep();
        statsJournal.witnessSkippedStep();
        expect(statsJournal.getSkippedStepCount()).toBe(3);
      });
    });
  });

  describe("undefined step counting", function () {
    describe("getUndefinedStepCount()", function () {
      it("returns 0 when no steps undefined", function () {
        expect(statsJournal.getUndefinedStepCount()).toBe(0);
      });

      it("returns 1 when one step passed", function () {
        statsJournal.witnessUndefinedStep();
        expect(statsJournal.getUndefinedStepCount()).toBe(1);
      });

      it("returns 2 when two steps passed", function () {
        statsJournal.witnessUndefinedStep();
        statsJournal.witnessUndefinedStep();
        expect(statsJournal.getUndefinedStepCount()).toBe(2);
      });

      it("returns 3 when two steps passed", function () {
        statsJournal.witnessUndefinedStep();
        statsJournal.witnessUndefinedStep();
        statsJournal.witnessUndefinedStep();
        expect(statsJournal.getUndefinedStepCount()).toBe(3);
      });
    });
  });

  describe("pending step counting", function () {
    describe("getPendingStepCount()", function () {
      it("returns 0 when no steps pending", function () {
        expect(statsJournal.getPendingStepCount()).toBe(0);
      });

      it("returns 1 when one step passed", function () {
        statsJournal.witnessPendingStep();
        expect(statsJournal.getPendingStepCount()).toBe(1);
      });

      it("returns 2 when two steps passed", function () {
        statsJournal.witnessPendingStep();
        statsJournal.witnessPendingStep();
        expect(statsJournal.getPendingStepCount()).toBe(2);
      });

      it("returns 3 when two steps passed", function () {
        statsJournal.witnessPendingStep();
        statsJournal.witnessPendingStep();
        statsJournal.witnessPendingStep();
        expect(statsJournal.getPendingStepCount()).toBe(3);
      });
    });
  });

  describe("witnessedAnyFailedStep()", function () {
    it("returns false when no failed step were encountered", function () {
      expect(statsJournal.witnessedAnyFailedStep()).toBeFalsy();
    });

    it("returns true when one or more steps were witnessed", function () {
      statsJournal.witnessFailedStep();
      expect(statsJournal.witnessedAnyFailedStep()).toBeTruthy();
    });
  });

  describe("witnessedAnyUndefinedStep()", function () {
    it("returns false when no undefined step were encountered", function () {
      expect(statsJournal.witnessedAnyUndefinedStep()).toBeFalsy();
    });

    it("returns true when one or more steps were witnessed", function () {
      statsJournal.witnessUndefinedStep();
      expect(statsJournal.witnessedAnyUndefinedStep()).toBeTruthy();
    });
  });
});
