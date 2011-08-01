require('../../support/spec_helper');

describe("Cucumber.Runtime.FailedStepResult", function() {
  var Cucumber = require('cucumber');
  var stepResult, failureException;

  beforeEach(function() {
    failureException = createSpy("failure exception");
    stepResult       = Cucumber.Runtime.FailedStepResult(failureException);
  });

  describe("isSuccessful()", function() {
    it("returns false", function() {
      expect(stepResult.isSuccessful()).toBeFalsy();
    });
  });

  describe("isPending()", function() {
    it("returns false", function() {
      expect(stepResult.isPending()).toBeFalsy();
    });
  });

  describe("isFailed()", function() {
    it("returns true", function() {
      expect(stepResult.isFailed()).toBeTruthy();
    });
  });

  describe("getFailureException()", function() {
    it("returns the exception passed to the constructor", function() {
      expect(stepResult.getFailureException()).toBe(failureException);
    });
  });
});
