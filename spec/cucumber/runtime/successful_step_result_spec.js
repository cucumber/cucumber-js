require('../../support/spec_helper');

describe("Cucumber.Runtime.SuccessfulStepResult", function() {
  var Cucumber = requireLib('cucumber');
  var stepResult;

  beforeEach(function() {
    stepResult = Cucumber.Runtime.SuccessfulStepResult();
  });

  describe("isFailed()", function() {
    it("is falsy", function() {
      expect(stepResult.isFailed()).toBeFalsy();
    });
  });

  describe("isPending()", function() {
    it("is falsy", function() {
      expect(stepResult.isPending()).toBeFalsy();
    });
  });

  describe("isSkipped()", function() {
    it("is falsy", function() {
      expect(stepResult.isSkipped()).toBeFalsy();
    });
  });

  describe("isSuccessful()", function() {
    it("is truthy", function() {
      expect(stepResult.isSuccessful()).toBeTruthy();
    });
  });

  describe("isUndefined()", function() {
    it("is falsy", function() {
      expect(stepResult.isUndefined()).toBeFalsy();
    });
  });
});
