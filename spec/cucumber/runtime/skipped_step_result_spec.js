require('../../support/spec_helper');

describe("Cucumber.Runtime.SkippedStepResult", function() {
  var Cucumber = requireLib('cucumber');
  var skippedStepResult, stepResult, step, payload;;

  beforeEach(function() {
    skippedStepResult = createSpy("base step result");
    spyOn(Cucumber.Runtime, 'StepResult').andReturn(skippedStepResult);
    step              = createSpy("step");
    payload           = {step: step};
    skippedStepResult = Cucumber.Runtime.SkippedStepResult(payload);
  });

  it("is skipped", function() {
    expect(skippedStepResult.isSkipped()).toBeTruthy();
  });

  describe("constructor", function() {
    it("instantiates a step result", function() {
      expect(Cucumber.Runtime.StepResult).toHaveBeenCalledWith(payload);
    });
  });
});
