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

    describe('after a passing step', function () {
      beforeEach(function () {
        var stepResult = createSpyWithStubs('stepResult', {getStatus: Cucumber.Status.PASSED});
        featuresResult.witnessStepResult(stepResult);
      });

      it('is successful', function() {
        expect(featuresResult.isSuccessful()).toEqual(true);
      });
    });

    describe('after a failing step', function () {
      beforeEach(function () {
        var stepResult = createSpyWithStubs('stepResult', {getStatus: Cucumber.Status.FAILED});
        featuresResult.witnessStepResult(stepResult);
      });

      it('is not successful', function() {
        expect(featuresResult.isSuccessful()).toEqual(false);
      });
    });

    describe('after an ambiguous step', function () {
      beforeEach(function () {
        var stepResult = createSpyWithStubs('stepResult', {getStatus: Cucumber.Status.AMBIGUOUS});
        featuresResult.witnessStepResult(stepResult);
      });

      it('is not successful', function() {
        expect(featuresResult.isSuccessful()).toEqual(false);
      });
    });

    describe('after a pending step', function () {
      beforeEach(function () {
        var stepResult = createSpyWithStubs('stepResult', {getStatus: Cucumber.Status.PENDING});
        featuresResult.witnessStepResult(stepResult);
      });

      it('is not successful', function() {
        expect(featuresResult.isSuccessful()).toEqual(false);
      });
    });

    describe('after an undefined step', function () {
      beforeEach(function () {
        var stepResult = createSpyWithStubs('stepResult', {getStatus: Cucumber.Status.UNDEFINED});
        featuresResult.witnessStepResult(stepResult);
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

    describe('after a passing step', function () {
      beforeEach(function () {
        var stepResult = createSpyWithStubs('stepResult', {getStatus: Cucumber.Status.PASSED});
        featuresResult.witnessStepResult(stepResult);
      });

      it('is successful', function() {
        expect(featuresResult.isSuccessful()).toEqual(true);
      });
    });

    describe('after a failing step', function () {
      beforeEach(function () {
        var stepResult = createSpyWithStubs('stepResult', {getStatus: Cucumber.Status.FAILED});
        featuresResult.witnessStepResult(stepResult);
      });

      it('is not successful', function() {
        expect(featuresResult.isSuccessful()).toEqual(false);
      });
    });

    describe('after an ambiguous step', function () {
      beforeEach(function () {
        var stepResult = createSpyWithStubs('stepResult', {getStatus: Cucumber.Status.AMBIGUOUS});
        featuresResult.witnessStepResult(stepResult);
      });

      it('is not successful', function() {
        expect(featuresResult.isSuccessful()).toEqual(false);
      });
    });

    describe('after a pending step', function () {
      beforeEach(function () {
        var stepResult = createSpyWithStubs('stepResult', {getStatus: Cucumber.Status.PENDING});
        featuresResult.witnessStepResult(stepResult);
      });

      it('is successful', function() {
        expect(featuresResult.isSuccessful()).toEqual(true);
      });
    });

    describe('after an undefined step', function () {
      beforeEach(function () {
        var stepResult = createSpyWithStubs('stepResult', {getStatus: Cucumber.Status.UNDEFINED});
        featuresResult.witnessStepResult(stepResult);
      });

      it('is successful', function() {
        expect(featuresResult.isSuccessful()).toEqual(true);
      });
    });
  });
});
