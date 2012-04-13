require('../../support/spec_helper');

describe("Cucumber.Runtime.SkippedStepResult", function() {
  var Cucumber = requireLib('cucumber');
  var stepResult, step;

  beforeEach(function() {
    step       = createSpy("step");
    stepResult = Cucumber.Runtime.SkippedStepResult({step: step});
  });

  it("is not failed", function() {
    expect(stepResult.isFailed()).toBeFalsy();
  });

  it("is not pending", function() {
    expect(stepResult.isPending()).toBeFalsy();
  });

  it("is skipped", function() {
    expect(stepResult.isSkipped()).toBeTruthy();
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
});
