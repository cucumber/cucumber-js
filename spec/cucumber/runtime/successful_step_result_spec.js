require('../../support/spec_helper');

describe("Cucumber.Runtime.SuccessfulStepResult", function() {
  var Cucumber = requireLib('cucumber');
  var successfulStepResult, stepResult, step, payload;

  beforeEach(function() {
    stepResult           = createSpy("base step result");
    spyOn(Cucumber.Runtime, 'StepResult').andReturn(stepResult);
    step                 = createSpy("step");
    payload              = {step: step, duration: 1};
    successfulStepResult = Cucumber.Runtime.SuccessfulStepResult(payload);
  });

  it("is successful", function () {
    expect(successfulStepResult.isSuccessful()).toBeTruthy();
  });

  describe("constructor", function() {
    it("instantiates a step result", function() {
      expect(Cucumber.Runtime.StepResult).toHaveBeenCalledWith(payload);
    });
  });

  describe("getDuration()", function() {
    it("returns the duration passed to the constructor", function() {
      expect(successfulStepResult.getDuration()).toBe(1);
    });
  });
});
