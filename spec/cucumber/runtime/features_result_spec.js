require('../../support/spec_helper');

describe("Cucumber.Runtime.FeaturesResult", function () {
  var Cucumber = requireLib('cucumber');
  var featuresResult;

  describe('strict', function () {
    beforeEach(function () {
      featuresResult = Cucumber.Runtime.FeaturesResult(true);
    });

    it('is successful by default', function() {
      expect(featuresResult.isSuccessful()).toEqual(true);
    });

    describe('after a passing scenario', function () {
      beforeEach(function () {
        var scenarioResult = createSpyWithStubs('scenario result', {getStatus: Cucumber.Status.PASSED});
        featuresResult.witnessScenarioResult(scenarioResult);
      });

      it('is successful', function() {
        expect(featuresResult.isSuccessful()).toEqual(true);
      });
    });

    describe('after a failing scenario', function () {
      beforeEach(function () {
        var scenarioResult = createSpyWithStubs('scenario result', {getStatus: Cucumber.Status.FAILED});
        featuresResult.witnessScenarioResult(scenarioResult);
      });

      it('is not successful', function() {
        expect(featuresResult.isSuccessful()).toEqual(false);
      });
    });

    describe('after an ambiguous scenario', function () {
      beforeEach(function () {
        var scenarioResult = createSpyWithStubs('scenario result', {getStatus: Cucumber.Status.AMBIGUOUS});
        featuresResult.witnessScenarioResult(scenarioResult);
      });

      it('is not successful', function() {
        expect(featuresResult.isSuccessful()).toEqual(false);
      });
    });

    describe('after a pending scenario', function () {
      beforeEach(function () {
        var scenarioResult = createSpyWithStubs('scenario result', {getStatus: Cucumber.Status.PENDING});
        featuresResult.witnessScenarioResult(scenarioResult);
      });

      it('is not successful', function() {
        expect(featuresResult.isSuccessful()).toEqual(false);
      });
    });

    describe('after an undefined step', function () {
      beforeEach(function () {
        var scenarioResult = createSpyWithStubs('scenario result', {getStatus: Cucumber.Status.UNDEFINED});
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
        var scenarioResult = createSpyWithStubs('scenario result', {getStatus: Cucumber.Status.PASSING});
        featuresResult.witnessScenarioResult(scenarioResult);
      });

      it('is successful', function() {
        expect(featuresResult.isSuccessful()).toEqual(true);
      });
    });

    describe('after a failing scenario', function () {
      beforeEach(function () {
        var scenarioResult = createSpyWithStubs('scenario result', {getStatus: Cucumber.Status.FAILED});
        featuresResult.witnessScenarioResult(scenarioResult);
      });

      it('is not successful', function() {
        expect(featuresResult.isSuccessful()).toEqual(false);
      });
    });

    describe('after an ambiguous scenario', function () {
      beforeEach(function () {
        var scenarioResult = createSpyWithStubs('scenario result', {getStatus: Cucumber.Status.AMBIGUOUS});
        featuresResult.witnessScenarioResult(scenarioResult);
      });

      it('is not successful', function() {
        expect(featuresResult.isSuccessful()).toEqual(false);
      });
    });

    describe('after a pending scenario', function () {
      beforeEach(function () {
        var scenarioResult = createSpyWithStubs('scenario result', {getStatus: Cucumber.Status.PENDING});
        featuresResult.witnessScenarioResult(scenarioResult);
      });

      it('is successful', function() {
        expect(featuresResult.isSuccessful()).toEqual(true);
      });
    });

    describe('after an undefined scenario', function () {
      beforeEach(function () {
        var scenarioResult = createSpyWithStubs('scenario result', {getStatus: Cucumber.Status.UNDEFINED});
        featuresResult.witnessScenarioResult(scenarioResult);
      });

      it('is successful', function() {
        expect(featuresResult.isSuccessful()).toEqual(true);
      });
    });
  });
});
