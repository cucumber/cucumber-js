require('../../support/spec_helper');

describe("Cucumber.Runtime.PendingStepResult", function() {
  var Cucumber = requireLib('cucumber');
  var stepResult;

  beforeEach(function() {
    stepResult = Cucumber.Runtime.PendingStepResult();
  });

  it("is not failed", function() {
    expect(stepResult.isFailed()).toBeFalsy();
  });

  it("is pending", function() {
    expect(stepResult.isPending()).toBeTruthy();
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
});
