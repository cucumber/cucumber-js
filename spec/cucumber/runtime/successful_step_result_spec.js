require('../../support/spec_helper');

describe("Cucumber.Runtime.SuccessfulStepResult", function() {
  var Cucumber = requireLib('cucumber');
  var stepResult;

  beforeEach(function() {
    stepResult = Cucumber.Runtime.SuccessfulStepResult();
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

  it("is successful", function () {
    expect(stepResult.isSuccessful()).toBeTruthy();
  });

  it("is not undefined", function() {
    expect(stepResult.isUndefined()).toBeFalsy();
  });
});
