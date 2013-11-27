require('../../support/spec_helper');

describe("Cucumber.Runtime.StepResult", function() {
  var Cucumber = requireLib('cucumber');
  var stepResult, step;

  beforeEach(function() {
    step = createSpy("step");
    stepResult = Cucumber.Runtime.StepResult({ step: step, duration: 123 });
  });

  it("is not failed", function() {
    expect(stepResult.isFailed()).toBeFalsy();
  });

  it("is not pending", function() {
    expect(stepResult.isPending()).toBeFalsy();
  });

  it("is not skipped", function() {
    expect(stepResult.isSkipped()).toBeFalsy();
  });

  it("is not successful", function () {
    expect(stepResult.isSuccessful()).toBeFalsy();
  });

  it("is not undefined", function() {
    expect(stepResult.isUndefined()).toBeFalsy();
  });

  describe("getStep()", function() {
    it("returns the step passed to the constructor", function() {
      expect(stepResult.getStep()).toBe(step);
    });
  });

  describe("getDuration()", function() {
    it("returns the duration passed to the constructor", function() {
      expect(stepResult.getDuration()).toBe(123);
    });
  });
});