require('../../support/spec_helper');

describe("Cucumber.Runtime.PendingStepResult", function() {
  var Cucumber = requireLib('cucumber');
  var stepResult;

  beforeEach(function() {
    stepResult = Cucumber.Runtime.PendingStepResult();
  });

  describe("isSuccessful()", function() {
    it("returns false", function() {
      expect(stepResult.isSuccessful()).toBeFalsy();
    });
  });

  describe("isPending()", function() {
    it("returns true", function() {
      expect(stepResult.isPending()).toBeTruthy();
    });
  });

  describe("isFailed()", function() {
    it("returns false", function() {
      expect(stepResult.isFailed()).toBeFalsy();
    });
  });
});
