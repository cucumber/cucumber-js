require('../../support/spec_helper');

describe("Cucumber.Runtime.StepResult", function() {
  var Cucumber = require('cucumber');
  var stepResult, status;
  
  describe("isSuccessful()", function() {
    it("returns true when the step invocation was successful", function() {
      stepResult = Cucumber.Runtime.StepResult(true);
      expect(stepResult.isSuccessful()).toBeTruthy();
    });

    it("returns false when the step invocation was not successful", function() {
      stepResult = Cucumber.Runtime.StepResult(false);
      expect(stepResult.isSuccessful()).toBeFalsy();
    });
  });
});
