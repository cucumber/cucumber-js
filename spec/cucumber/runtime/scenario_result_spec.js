require('../../support/spec_helper');

describe("Cucumber.Runtime.ScenarioResult", function () {
  var Cucumber = requireLib('cucumber');
  var scenarioResult;

  beforeEach(function () {
    scenarioResult = Cucumber.Runtime.ScenarioResult();
  });

  it('has a status of passed', function() {
    expect(scenarioResult.getStatus()).toEqual(Cucumber.Status.PASSED);
  });

  describe('after a passing step', function () {
    beforeEach(function () {
      var stepResult = createSpyWithStubs('stepResult', {getStatus: Cucumber.Status.PASSED});
      scenarioResult.witnessStepResult(stepResult);
    });

    it('has a status of passed', function() {
      expect(scenarioResult.getStatus()).toEqual(Cucumber.Status.PASSED);
    });

    describe('after a failing step', function () {
      var failureException;

      beforeEach(function () {
        failureException = createSpy('failureException');
        var stepResult = createSpyWithStubs('stepResult', {getFailureException: failureException, getStatus: Cucumber.Status.FAILED});
        scenarioResult.witnessStepResult(stepResult);
      });

      it('has a status of failed', function() {
        expect(scenarioResult.getStatus()).toEqual(Cucumber.Status.FAILED);
      });

      it('has a failure exception', function() {
        expect(scenarioResult.getFailureException()).toBe(failureException);
      });
    });

    describe('after a pending step', function () {
      beforeEach(function () {
        var stepResult = createSpyWithStubs('stepResult', {getStatus: Cucumber.Status.PENDING});
        scenarioResult.witnessStepResult(stepResult);
      });

      it('has a status of pending', function() {
        expect(scenarioResult.getStatus()).toEqual(Cucumber.Status.PENDING);
      });
    });

    describe('after an undefined step', function () {
      beforeEach(function () {
        var stepResult = createSpyWithStubs('stepResult', {getStatus: Cucumber.Status.UNDEFINED});
        scenarioResult.witnessStepResult(stepResult);
      });

      it('has a status of undefined', function() {
        expect(scenarioResult.getStatus()).toEqual(Cucumber.Status.UNDEFINED);
      });
    });
  });

  describe('after a failing step', function () {
    var failureException;

    beforeEach(function () {
      failureException = createSpy('failureException');
      var stepResult = createSpyWithStubs('stepResult', {getFailureException: failureException, getStatus: Cucumber.Status.FAILED});
      scenarioResult.witnessStepResult(stepResult);
    });

    it('has a status of failed', function() {
      expect(scenarioResult.getStatus()).toEqual(Cucumber.Status.FAILED);
    });

    it('has a failure exception', function() {
      expect(scenarioResult.getFailureException()).toBe(failureException);
    });

    describe('after a pending step', function () {
      beforeEach(function () {
        var stepResult = createSpyWithStubs('stepResult', {getStatus: Cucumber.Status.PENDING});
        scenarioResult.witnessStepResult(stepResult);
      });

      it('has a status of failed', function() {
        expect(scenarioResult.getStatus()).toEqual(Cucumber.Status.FAILED);
      });

      it('has a failure exception', function() {
        expect(scenarioResult.getFailureException()).toBe(failureException);
      });
    });

    describe('after an undefined step', function () {
      beforeEach(function () {
        var stepResult = createSpyWithStubs('stepResult', {getStatus: Cucumber.Status.UNDEFINED});
        scenarioResult.witnessStepResult(stepResult);
      });

      it('has a status of failed', function() {
        expect(scenarioResult.getStatus()).toEqual(Cucumber.Status.FAILED);
      });

      it('has a failure exception', function() {
        expect(scenarioResult.getFailureException()).toBe(failureException);
      });
    });

    describe('after a skipped step', function () {
      beforeEach(function () {
        var stepResult = createSpyWithStubs('stepResult', {getStatus: Cucumber.Status.SKIPPED});
        scenarioResult.witnessStepResult(stepResult);
      });

      it('has a status of failed', function() {
        expect(scenarioResult.getStatus()).toEqual(Cucumber.Status.FAILED);
      });

      it('has a failure exception', function() {
        expect(scenarioResult.getFailureException()).toBe(failureException);
      });
    });
  });

  describe('after a pending step', function () {
    beforeEach(function () {
      var stepResult = createSpyWithStubs('stepResult', {getStatus: Cucumber.Status.PENDING});
      scenarioResult.witnessStepResult(stepResult);
    });

    it('has a status of pending', function() {
      expect(scenarioResult.getStatus()).toEqual(Cucumber.Status.PENDING);
    });

    describe('after a undefined step', function () {
      beforeEach(function () {
        var stepResult = createSpyWithStubs('stepResult', {getStatus: Cucumber.Status.UNDEFINED});
        scenarioResult.witnessStepResult(stepResult);
      });

      it('has a status of pending', function() {
        expect(scenarioResult.getStatus()).toEqual(Cucumber.Status.PENDING);
      });
    });

    describe('after a skipped step', function () {
      beforeEach(function () {
        var stepResult = createSpyWithStubs('stepResult', {getStatus: Cucumber.Status.SKIPPED});
        scenarioResult.witnessStepResult(stepResult);
      });

      it('has a status of pending', function() {
        expect(scenarioResult.getStatus()).toEqual(Cucumber.Status.PENDING);
      });
    });
  });

  describe('after a undefined step', function () {
    beforeEach(function () {
      var stepResult = createSpyWithStubs('stepResult', {getStatus: Cucumber.Status.UNDEFINED});
      scenarioResult.witnessStepResult(stepResult);
    });

    it('has a status of undefined', function() {
      expect(scenarioResult.getStatus()).toEqual(Cucumber.Status.UNDEFINED);
    });

    describe('after a pending step', function () {
      beforeEach(function () {
        var stepResult = createSpyWithStubs('stepResult', {getStatus: Cucumber.Status.PENDING});
        scenarioResult.witnessStepResult(stepResult);
      });

      it('has a status of undefined', function() {
        expect(scenarioResult.getStatus()).toEqual(Cucumber.Status.UNDEFINED);
      });
    });

    describe('after a skipped step', function () {
      beforeEach(function () {
        var stepResult = createSpyWithStubs('stepResult', {getStatus: Cucumber.Status.SKIPPED});
        scenarioResult.witnessStepResult(stepResult);
      });

      it('has a status of undefined', function() {
        expect(scenarioResult.getStatus()).toEqual(Cucumber.Status.UNDEFINED);
      });
    });
  });

  describe('after a skipped step', function () {
    beforeEach(function () {
      var stepResult = createSpyWithStubs('stepResult', {getStatus: Cucumber.Status.SKIPPED});
      scenarioResult.witnessStepResult(stepResult);
    });

    it('has a status of skipped', function() {
      expect(scenarioResult.getStatus()).toEqual(Cucumber.Status.SKIPPED);
    });

    describe('after a pending step', function () {
      beforeEach(function () {
        var stepResult = createSpyWithStubs('stepResult', {getStatus: Cucumber.Status.PENDING});
        scenarioResult.witnessStepResult(stepResult);
      });

      it('has a status of skipped', function() {
        expect(scenarioResult.getStatus()).toEqual(Cucumber.Status.SKIPPED);
      });
    });

    describe('after an undefined step', function () {
      beforeEach(function () {
        var stepResult = createSpyWithStubs('stepResult', {getStatus: Cucumber.Status.UNDEFINED});
        scenarioResult.witnessStepResult(stepResult);
      });

      it('has a status of skipped', function() {
        expect(scenarioResult.getStatus()).toEqual(Cucumber.Status.SKIPPED);
      });
    });
  });
});
