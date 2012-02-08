require('../../support/spec_helper');

describe("Cucumber.Runtime.PendingStepResult", function() {
  var Cucumber = requireLib('cucumber');
  var stepResult;

  beforeEach(function() {
    stepResult = Cucumber.Runtime.PendingStepResult();
  });

  describe("isFailed()", function() {
    it("is falsy", function() {
      expect(stepResult.isFailed()).toBeFalsy();
    });
  });

  describe("isPending()", function() {
    it("is truthy", function() {
      expect(stepResult.isPending()).toBeTruthy();
    });
  });

  describe("isSkipped()", function() {
    it("is falsy", function() {
      expect(stepResult.isSkipped()).toBeFalsy();
    });
  });

  describe("isSuccessful()", function() {
    it("is falsy", function() {
      expect(stepResult.isSuccessful()).toBeFalsy();
    });
  });

  describe("isUndefined()", function() {
    it("is falsy", function() {
      expect(stepResult.isUndefined()).toBeFalsy();
    });
  });
});
