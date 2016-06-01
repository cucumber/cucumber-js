require('../../support/spec_helper');

describe("Cucumber.Runtime.FeaturesResult", function () {
  var Cucumber = requireLib('cucumber');
  var featuresResult, scenarioResult, step;

  beforeEach(function() {
    step = Cucumber.Ast.Step({});
    scenarioResult = Cucumber.Runtime.ScenarioResult();
  });

  describe('strict', function () {
    beforeEach(function () {
      featuresResult = Cucumber.Runtime.FeaturesResult(true);
    });

    it('is successful by default', function() {
      expect(featuresResult.isSuccessful()).toEqual(true);
    });

    describe('after a passing scenario', function () {
      beforeEach(function () {
        var stepResult = Cucumber.Runtime.StepResult({status: Cucumber.Status.PASSED, step: step});
        scenarioResult.witnessStepResult(stepResult);
        featuresResult.witnessScenarioResult(scenarioResult);
      });

      it('is successful', function() {
        expect(featuresResult.isSuccessful()).toEqual(true);
      });
    });

    describe('after a failing scenario', function () {
      beforeEach(function () {
        var stepResult = Cucumber.Runtime.StepResult({status: Cucumber.Status.FAILED, step: step});
        scenarioResult.witnessStepResult(stepResult);
        featuresResult.witnessScenarioResult(scenarioResult);
      });

      it('is not successful', function() {
        expect(featuresResult.isSuccessful()).toEqual(false);
      });
    });

    describe('after an ambiguous scenario', function () {
      beforeEach(function () {
        var stepResult = Cucumber.Runtime.StepResult({status: Cucumber.Status.AMBIGUOUS, step: step});
        scenarioResult.witnessStepResult(stepResult);
        featuresResult.witnessScenarioResult(scenarioResult);
      });

      it('is not successful', function() {
        expect(featuresResult.isSuccessful()).toEqual(false);
      });
    });

    describe('after a pending scenario', function () {
      beforeEach(function () {
        var stepResult = Cucumber.Runtime.StepResult({status: Cucumber.Status.PENDING, step: step});
        scenarioResult.witnessStepResult(stepResult);
        featuresResult.witnessScenarioResult(scenarioResult);
      });

      it('is not successful', function() {
        expect(featuresResult.isSuccessful()).toEqual(false);
      });
    });

    describe('after an undefined step', function () {
      beforeEach(function () {
        var stepResult = Cucumber.Runtime.StepResult({status: Cucumber.Status.UNDEFINED, step: step});
        scenarioResult.witnessStepResult(stepResult);
        featuresResult.witnessScenarioResult(scenarioResult);
      });

      it('is not successful', function() {
        expect(featuresResult.isSuccessful()).toEqual(false);
      });
    });
  });

  describe('not strict', function () {
    beforeEach(function () {
      featuresResult = Cucumber.Runtime.FeaturesResult(false);
    });

    it('is successful by default', function() {
      expect(featuresResult.isSuccessful()).toEqual(true);
    });

    describe('after a passing scenario', function () {
      beforeEach(function () {
        var stepResult = Cucumber.Runtime.StepResult({status: Cucumber.Status.PASSING, step: step});
        scenarioResult.witnessStepResult(stepResult);
        featuresResult.witnessScenarioResult(scenarioResult);
      });

      it('is successful', function() {
        expect(featuresResult.isSuccessful()).toEqual(true);
      });
    });

    describe('after a failing scenario', function () {
      beforeEach(function () {
        var stepResult = Cucumber.Runtime.StepResult({status: Cucumber.Status.FAILED, step: step});
        scenarioResult.witnessStepResult(stepResult);
        featuresResult.witnessScenarioResult(scenarioResult);
      });

      it('is not successful', function() {
        expect(featuresResult.isSuccessful()).toEqual(false);
      });
    });

    describe('after an ambiguous scenario', function () {
      beforeEach(function () {
        var stepResult = Cucumber.Runtime.StepResult({status: Cucumber.Status.AMBIGUOUS, step: step});
        scenarioResult.witnessStepResult(stepResult);
        featuresResult.witnessScenarioResult(scenarioResult);
      });

      it('is not successful', function() {
        expect(featuresResult.isSuccessful()).toEqual(false);
      });
    });

    describe('after a pending scenario', function () {
      beforeEach(function () {
        var stepResult = Cucumber.Runtime.StepResult({status: Cucumber.Status.PENDING, step: step});
        scenarioResult.witnessStepResult(stepResult);
        featuresResult.witnessScenarioResult(scenarioResult);
      });

      it('is successful', function() {
        expect(featuresResult.isSuccessful()).toEqual(true);
      });
    });

    describe('after an undefined scenario', function () {
      beforeEach(function () {
        var stepResult = Cucumber.Runtime.StepResult({status: Cucumber.Status.UNDEFINED, step: step});
        scenarioResult.witnessStepResult(stepResult);
        featuresResult.witnessScenarioResult(scenarioResult);
      });

      it('is successful', function() {
        expect(featuresResult.isSuccessful()).toEqual(true);
      });
    });
  });
});
