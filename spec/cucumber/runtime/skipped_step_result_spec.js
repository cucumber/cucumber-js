require('../../support/spec_helper');

describe("Cucumber.Runtime.SkippedStepResult", function() {
  var Cucumber = requireLib('cucumber');
  var stepResult, step;

  beforeEach(function() {
    step       = createSpy("step");
    stepResult = Cucumber.Runtime.SkippedStepResult({step: step});
  });

  describe("isFailed()", function() {
    it("is falsy", function() {
      expect(stepResult.isFailed()).toBeFalsy();
    });
  });

  describe("isPending()", function() {
    it("is falsy", function() {
      expect(stepResult.isPending()).toBeFalsy();
    });
  });

  describe("isSkipped()", function() {
    it("is truthy", function() {
      expect(stepResult.isSkipped()).toBeTruthy();
    });
  });

  describe("isSuccessful()", function() {
    it("is falsy", function() {
      expect(stepResult.isSuccessful()).toBeFalsy();
    });
  });

  describe("isUndefined()", function() {
    it("is falsy", function() {
      expect(stepResult.isUndefined()).toBeFalsy();
    });
  });

  describe("getStep()", function() {
    it("returns the step passed to the constructor", function() {
      expect(stepResult.getStep()).toBe(step);
    });
  });
});
