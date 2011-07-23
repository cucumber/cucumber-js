require('../../support/spec_helper');

describe("Cucumber.Runtime.FailedStepResult", function() {
  var Cucumber = require('cucumber');
  var stepResult;

  beforeEach(function() {
    stepResult = Cucumber.Runtime.FailedStepResult();
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
});
