require('../../support/spec_helper');

describe("Cucumber.Runtime.FailedStepResult", function() {
  var Cucumber = requireLib('cucumber');
  var failedStepResult, failureException, stepResult, step, payload;

  beforeEach(function() {
    stepResult       = createSpy("base step result");
    spyOn(Cucumber.Runtime, 'StepResult').andReturn(stepResult);
    step             = createSpy("step");
    failureException = createSpy("failure exception");
    payload          = { step: step, failureException: failureException };
    failedStepResult = Cucumber.Runtime.FailedStepResult(payload);
  });

  it("is failed", function() {
    expect(failedStepResult.isFailed()).toBeTruthy();
  });

  describe("constructor", function() {
    it("instantiates a step result", function() {
      expect(Cucumber.Runtime.StepResult).toHaveBeenCalledWith(payload);
    });
  });

  describe("getFailureException()", function() {
    it("returns the exception passed to the constructor", function() {
      expect(failedStepResult.getFailureException()).toBe(failureException);
    });
  });
});
