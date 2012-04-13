require('../../support/spec_helper');

describe("Cucumber.Runtime.FailedStepResult", function() {
  var Cucumber = requireLib('cucumber');
  var stepResult, failureException;

  beforeEach(function() {
    failureException = createSpy("failure exception");
    stepResult       = Cucumber.Runtime.FailedStepResult(failureException);
  });

  it("is failed", function() {
    expect(stepResult.isFailed()).toBeTruthy();
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

  describe("getFailureException()", function() {
    it("returns the exception passed to the constructor", function() {
      expect(stepResult.getFailureException()).toBe(failureException);
    });
  });
});
