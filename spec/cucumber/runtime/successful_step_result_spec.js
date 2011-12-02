require('../../support/spec_helper');

describe("Cucumber.Runtime.SuccessfulStepResult", function() {
  var Cucumber = requireLib('cucumber');
  var stepResult;

  beforeEach(function() {
    stepResult = Cucumber.Runtime.SuccessfulStepResult();
  });

  describe("isSuccessful()", function() {
    it("returns true", function() {
      expect(stepResult.isSuccessful()).toBeTruthy();
    });
  });

  describe("isPending()", function() {
    it("returns false", function() {
      expect(stepResult.isPending()).toBeFalsy();
    });
  });

  describe("isFailed()", function() {
    it("returns false", function() {
      expect(stepResult.isFailed()).toBeFalsy();
    });
  });
});
