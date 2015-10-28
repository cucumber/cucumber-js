require('../../support/spec_helper');

describe("Cucumber.Runtime.StepResult", function () {
  var Cucumber = requireLib('cucumber');
  var stepResult, step, attachments, failureException, status;

  beforeEach(function () {
    step        = createSpy("step");
    attachments = [];
    failureException = new Error('some error');
    status = Cucumber.Status.PASSED;
    stepResult = Cucumber.Runtime.StepResult({
      step: step,
      duration: 123,
      attachments: attachments,
      status: status,
      failureException: failureException
    });
  });

  describe("getStep()", function () {
    it("returns the step passed to the constructor", function () {
      expect(stepResult.getStep()).toBe(step);
    });
  });

  describe("getDuration()", function () {
    it("returns the duration passed to the constructor", function () {
      expect(stepResult.getDuration()).toBe(123);
    });
  });

  describe("getStatus()", function () {
    it("returns the step passed to the constructor", function () {
      expect(stepResult.getStatus()).toBe(status);
    });
  });

  describe("getFailureException()", function () {
    it("returns the step passed to the constructor", function () {
      expect(stepResult.getFailureException()).toBe(failureException);
    });
  });

  describe("hasAttachments()", function () {
    describe("when there are no attachments", function () {
      it("returns false", function () {
        expect(stepResult.hasAttachments()).toBeFalsy();
      });
    });

    describe("when there are attachments", function () {
      beforeEach(function () {
        attachments.push(1);
      });

      it("returns true", function () {
        expect(stepResult.hasAttachments()).toBeTruthy();
      });
    });
  });

  describe("getAttachments()", function () {
    it("returns the attachments passed to the constructor", function () {
      expect(stepResult.getAttachments()).toBe(attachments);
    });
  });
});
