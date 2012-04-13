require('../../support/spec_helper');

describe("Cucumber.Runtime.PendingStepResult", function() {
  var Cucumber = requireLib('cucumber');
  var pendingStepResult, stepResult, step, payload;;

  beforeEach(function() {
    pendingStepResult = createSpy("base step result");
    spyOn(Cucumber.Runtime, 'StepResult').andReturn(pendingStepResult);
    step              = createSpy("step");
    payload           = {step: step};
    pendingStepResult = Cucumber.Runtime.PendingStepResult(payload);
  });

  it("is pending", function() {
    expect(pendingStepResult.isPending()).toBeTruthy();
  });

  describe("constructor", function() {
    it("instantiates a step result", function() {
      expect(Cucumber.Runtime.StepResult).toHaveBeenCalledWith(payload);
    });
  });
});
