require('../../support/spec_helper');

describe("Cucumber.Runtime.ScenarioResult", function () {
  var Cucumber = requireLib('cucumber');
  var scenarioResult, step;

  beforeEach(function () {
    step = Cucumber.Ast.Step({});
    scenarioResult = Cucumber.Runtime.ScenarioResult();
  });

  it('has a status of passed', function() {
    expect(scenarioResult.getStatus()).toEqual(Cucumber.Status.PASSED);
  });

  describe('after a passing step', function () {
    beforeEach(function () {
      var stepResult = Cucumber.Runtime.StepResult({status: Cucumber.Status.PASSED, step: step});
      scenarioResult.witnessStepResult(stepResult);
    });

    it('has a status of passed', function() {
      expect(scenarioResult.getStatus()).toEqual(Cucumber.Status.PASSED);
    });

    describe('after a failing step', function () {
      var failureException;

      beforeEach(function () {
        failureException = createSpy('failureException');
        var stepResult = Cucumber.Runtime.StepResult({failureException: failureException, status: Cucumber.Status.FAILED, step: step});
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
        var stepResult = Cucumber.Runtime.StepResult({status: Cucumber.Status.PENDING, step: step});
        scenarioResult.witnessStepResult(stepResult);
      });

      it('has a status of pending', function() {
        expect(scenarioResult.getStatus()).toEqual(Cucumber.Status.PENDING);
      });
    });

    describe('after an undefined step', function () {
      beforeEach(function () {
        var stepResult = Cucumber.Runtime.StepResult({status: Cucumber.Status.UNDEFINED, step: step});
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
      var stepResult = Cucumber.Runtime.StepResult({failureException: failureException, status: Cucumber.Status.FAILED, step: step});
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
        var stepResult = Cucumber.Runtime.StepResult({status: Cucumber.Status.PENDING, step: step});
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
        var stepResult = Cucumber.Runtime.StepResult({status: Cucumber.Status.UNDEFINED, step: step});
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
        var stepResult = Cucumber.Runtime.StepResult({status: Cucumber.Status.SKIPPED, step: step});
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
      var stepResult = Cucumber.Runtime.StepResult({status: Cucumber.Status.PENDING, step: step});
      scenarioResult.witnessStepResult(stepResult);
    });

    it('has a status of pending', function() {
      expect(scenarioResult.getStatus()).toEqual(Cucumber.Status.PENDING);
    });

    describe('after a undefined step', function () {
      beforeEach(function () {
        var stepResult = Cucumber.Runtime.StepResult({status: Cucumber.Status.UNDEFINED, step: step});
        scenarioResult.witnessStepResult(stepResult);
      });

      it('has a status of pending', function() {
        expect(scenarioResult.getStatus()).toEqual(Cucumber.Status.PENDING);
      });
    });

    describe('after a skipped step', function () {
      beforeEach(function () {
        var stepResult = Cucumber.Runtime.StepResult({status: Cucumber.Status.SKIPPED, step: step});
        scenarioResult.witnessStepResult(stepResult);
      });

      it('has a status of pending', function() {
        expect(scenarioResult.getStatus()).toEqual(Cucumber.Status.PENDING);
      });
    });
  });

  describe('after a undefined step', function () {
    beforeEach(function () {
      var stepResult = Cucumber.Runtime.StepResult({status: Cucumber.Status.UNDEFINED, step: step});
      scenarioResult.witnessStepResult(stepResult);
    });

    it('has a status of undefined', function() {
      expect(scenarioResult.getStatus()).toEqual(Cucumber.Status.UNDEFINED);
    });

    describe('after a pending step', function () {
      beforeEach(function () {
        var stepResult = Cucumber.Runtime.StepResult({status: Cucumber.Status.PENDING, step: step});
        scenarioResult.witnessStepResult(stepResult);
      });

      it('has a status of undefined', function() {
        expect(scenarioResult.getStatus()).toEqual(Cucumber.Status.UNDEFINED);
      });
    });

    describe('after a skipped step', function () {
      beforeEach(function () {
        var stepResult = Cucumber.Runtime.StepResult({status: Cucumber.Status.SKIPPED, step: step});
        scenarioResult.witnessStepResult(stepResult);
      });

      it('has a status of undefined', function() {
        expect(scenarioResult.getStatus()).toEqual(Cucumber.Status.UNDEFINED);
      });
    });
  });

  describe('after a skipped step', function () {
    beforeEach(function () {
      var stepResult = Cucumber.Runtime.StepResult({status: Cucumber.Status.SKIPPED, step: step});
      scenarioResult.witnessStepResult(stepResult);
    });

    it('has a status of skipped', function() {
      expect(scenarioResult.getStatus()).toEqual(Cucumber.Status.SKIPPED);
    });

    describe('after a pending step', function () {
      beforeEach(function () {
        var stepResult = Cucumber.Runtime.StepResult({status: Cucumber.Status.PENDING, step: step});
        scenarioResult.witnessStepResult(stepResult);
      });

      it('has a status of skipped', function() {
        expect(scenarioResult.getStatus()).toEqual(Cucumber.Status.SKIPPED);
      });
    });

    describe('after an undefined step', function () {
      beforeEach(function () {
        var stepResult = Cucumber.Runtime.StepResult({status: Cucumber.Status.UNDEFINED, step: step});
        scenarioResult.witnessStepResult(stepResult);
      });

      it('has a status of skipped', function() {
        expect(scenarioResult.getStatus()).toEqual(Cucumber.Status.SKIPPED);
      });
    });
  });
});
