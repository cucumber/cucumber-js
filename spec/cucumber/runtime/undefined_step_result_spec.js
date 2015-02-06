require('../../support/spec_helper');

describe("Cucumber.Runtime.UndefinedStepResult", function () {
  var Cucumber = requireLib('cucumber');
  var undefinedStepResult, step, payload;

  beforeEach(function () {
    undefinedStepResult = createSpy("base step result");
    spyOn(Cucumber.Runtime, 'StepResult').andReturn(undefinedStepResult);
    step                = createSpy("step");
    payload             = {step: step};
    undefinedStepResult = Cucumber.Runtime.UndefinedStepResult(payload);
  });

  it("is undefined", function () {
    expect(undefinedStepResult.isUndefined()).toBeTruthy();
  });

  describe("constructor", function () {
    it("instantiates a step result", function () {
      expect(Cucumber.Runtime.StepResult).toHaveBeenCalledWith(payload);
    });
  });
});
