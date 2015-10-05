require('../../support/spec_helper');

describe("Cucumber.Listener.StatsJournal", function () {
  var Cucumber = requireLib('cucumber');
  var async = require('async');
  var _ = require('underscore');
  var statsJournal;

  function createStepResult (opts) {
    var stubs = _.extend({}, {
      isSuccessful: false,
      isPending: false,
      isUndefined: false,
      isSkipped: false,
      getStep: undefined
    }, opts);
    return createSpyWithStubs('stepResult', stubs);
  }

  function handleScenarioWithStepResults (stepResults, callback) {
    var actions = [];
    actions.push(function (next) {
      statsJournal.handleBeforeScenarioEvent('BeforeScenario', next);
    });
    actions = actions.concat(stepResults.map(function (stepResult) {
      return function (next) {
        var event = createSpyWithStubs("event", {getPayloadItem: stepResult});
        statsJournal.handleStepResultEvent(event, next);
      };
    }));
    actions.push(function (next) {
      statsJournal.handleAfterScenarioEvent('AfterScenario', next);
    });
    async.series(actions, callback);
  }

  beforeEach(function () {
    statsJournal = Cucumber.Listener.StatsJournal();
  });

  // it("is based on the listener", function () {
  //   expect(statsJournal).toBe(Cucumber.Listener);
  // });

  describe('scenario with passing step', function() {
    beforeEach(function (callback) {
      var step = createSpyWithStubs('step', {isHidden: false});
      var stepResult = createStepResult({isSuccessful: true, getStep: step});
      handleScenarioWithStepResults([stepResult], callback);
    });

    it('records a passed step', function() {
      expect(statsJournal.getStepCounts()).toEqual({
        failed: 0, passed: 1, pending: 0, skipped: 0, undefined: 0
      });
    });

    it('records a passed scenario', function() {
      expect(statsJournal.getScenarioCounts()).toEqual({
        failed: 0, passed: 1, pending: 0, skipped: 0, undefined: 0
      });
    });
  });

  describe('scenario with failing step', function() {
    beforeEach(function (callback) {
      var stepResult = createStepResult({});
      handleScenarioWithStepResults([stepResult], callback);
    });

    it('records a failed step', function() {
      expect(statsJournal.getStepCounts()).toEqual({
        failed: 1, passed: 0, pending: 0, skipped: 0, undefined: 0
      });
    });

    it('records a failed scenario', function() {
      expect(statsJournal.getScenarioCounts()).toEqual({
        failed: 1, passed: 0, pending: 0, skipped: 0, undefined: 0
      });
    });
  });

  describe('scenario with pending step', function () {
    beforeEach(function (callback) {
      var stepResult = createStepResult({isPending: true});
      handleScenarioWithStepResults([stepResult], callback);
    });

    it('records a pending step', function() {
      expect(statsJournal.getStepCounts()).toEqual({
        failed: 0, passed: 0, pending: 1, skipped: 0, undefined: 0
      });
    });

    it('records a pending scenario', function() {
      expect(statsJournal.getScenarioCounts()).toEqual({
        failed: 0, passed: 0, pending: 1, skipped: 0, undefined: 0
      });
    });
  });

  describe('scenario with undefined step', function () {
    beforeEach(function (callback) {
      var stepResult = createStepResult({isUndefined: true});
      handleScenarioWithStepResults([stepResult], callback);
    });

    it('records a undefined step', function() {
      expect(statsJournal.getStepCounts()).toEqual({
        failed: 0, passed: 0, pending: 0, skipped: 0, undefined: 1
      });
    });

    it('records a undefined scenario', function() {
      expect(statsJournal.getScenarioCounts()).toEqual({
        failed: 0, passed: 0, pending: 0, skipped: 0, undefined: 1
      });
    });
  });

  describe('scenario with skipped step', function () {
    beforeEach(function (callback) {
      var stepResult = createStepResult({isSkipped: true});
      handleScenarioWithStepResults([stepResult], callback);
    });

    it('records a skipped step', function() {
      expect(statsJournal.getStepCounts()).toEqual({
        failed: 0, passed: 0, pending: 0, skipped: 1, undefined: 0
      });
    });

    it('records a skipped scenario', function() {
      expect(statsJournal.getScenarioCounts()).toEqual({
        failed: 0, passed: 0, pending: 0, skipped: 1, undefined: 0
      });
    });
  });

  describe('scenario with failing and pending step', function () {
    beforeEach(function (callback) {
      var failedStepResult = createStepResult({});
      var pendingStepResult = createStepResult({isPending: true});
      handleScenarioWithStepResults([failedStepResult, pendingStepResult], callback);
    });

    it('records a failed step and a pending step', function() {
      expect(statsJournal.getStepCounts()).toEqual({
        failed: 1, passed: 0, pending: 1, skipped: 0, undefined: 0
      });
    });

    it('records a failed scenario', function() {
      expect(statsJournal.getScenarioCounts()).toEqual({
        failed: 1, passed: 0, pending: 0, skipped: 0, undefined: 0
      });
    });
  });

  describe('scenario with failing and undefined step', function () {
    beforeEach(function (callback) {
      var failedStepResult = createStepResult({});
      var pendingStepResult = createStepResult({isPending: true});
      handleScenarioWithStepResults([failedStepResult, pendingStepResult], callback);
    });

    it('records a failed step and a pending step', function() {
      expect(statsJournal.getStepCounts()).toEqual({
        failed: 1, passed: 0, pending: 1, skipped: 0, undefined: 0
      });
    });

    it('records a failed scenario', function() {
      expect(statsJournal.getScenarioCounts()).toEqual({
        failed: 1, passed: 0, pending: 0, skipped: 0, undefined: 0
      });
    });
  });

  describe('scenario with failing and skipped step', function () {
    beforeEach(function (callback) {
      var failedStepResult = createStepResult({});
      var skippedStepResult = createStepResult({isSkipped: true});
      handleScenarioWithStepResults([failedStepResult, skippedStepResult], callback);
    });

    it('records a failed step and a pending step', function() {
      expect(statsJournal.getStepCounts()).toEqual({
        failed: 1, passed: 0, pending: 0, skipped: 1, undefined: 0
      });
    });

    it('records a failed scenario', function() {
      expect(statsJournal.getScenarioCounts()).toEqual({
        failed: 1, passed: 0, pending: 0, skipped: 0, undefined: 0
      });
    });
  });

  describe('scenario with pending and undefined steps', function () {
    beforeEach(function (callback) {
      var pendingStepResult = createStepResult({isPending: true});
      var undefinedStepResult = createStepResult({isUndefined: true});
      handleScenarioWithStepResults([pendingStepResult, undefinedStepResult], callback);
    });

    it('records a pending step and a undefined step', function() {
      expect(statsJournal.getStepCounts()).toEqual({
        failed: 0, passed: 0, pending: 1, skipped: 0, undefined: 1
      });
    });

    it('records a undefined scenario', function() {
      expect(statsJournal.getScenarioCounts()).toEqual({
        failed: 0, passed: 0, pending: 0, skipped: 0, undefined: 1
      });
    });
  });

  describe('scenario with pending and skipped steps', function () {
    beforeEach(function (callback) {
      var pendingStepResult = createStepResult({isPending: true});
      var skippedStepResult = createStepResult({isSkipped: true});
      handleScenarioWithStepResults([pendingStepResult, skippedStepResult], callback);
    });

    it('records a pending step and a skipped step', function() {
      expect(statsJournal.getStepCounts()).toEqual({
        failed: 0, passed: 0, pending: 1, skipped: 1, undefined: 0
      });
    });

    it('records a pending scenario', function() {
      expect(statsJournal.getScenarioCounts()).toEqual({
        failed: 0, passed: 0, pending: 1, skipped: 0, undefined: 0
      });
    });
  });

  describe('scenario with skipped and undefined steps', function () {
    beforeEach(function (callback) {
      var skippedStepResult = createStepResult({isSkipped: true});
      var undefinedStepResult = createStepResult({isUndefined: true});
      handleScenarioWithStepResults([skippedStepResult, undefinedStepResult], callback);
    });

    it('records a skipped step and a undefined step', function() {
      expect(statsJournal.getStepCounts()).toEqual({
        failed: 0, passed: 0, pending: 0, skipped: 1, undefined: 1
      });
    });

    it('records a undefined scenario', function() {
      expect(statsJournal.getScenarioCounts()).toEqual({
        failed: 0, passed: 0, pending: 0, skipped: 0, undefined: 1
      });
    });
  });

  describe("witnessedAnyFailedStep()", function () {
    describe("without a failed step", function () {
      it("returns false", function () {
        expect(statsJournal.witnessedAnyFailedStep()).toBeFalsy();
      });
    });

    describe("with a failed step", function () {
      beforeEach(function (callback){
        var failedStepResult = createStepResult({});
        handleScenarioWithStepResults([failedStepResult], callback);
      });

      it("returns true", function () {
        expect(statsJournal.witnessedAnyFailedStep()).toBeTruthy();
      });
    });
  });

  describe("witnessedAnyUndefinedStep()", function () {
    describe("without an undefined step", function () {
      it("returns false", function () {
        expect(statsJournal.witnessedAnyUndefinedStep()).toBeFalsy();
      });
    });

    describe("with an undefined step", function () {
      beforeEach(function (callback){
        var undefinedStepResult = createStepResult({isUndefined: true});
        handleScenarioWithStepResults([undefinedStepResult], callback);
      });

      it("returns true", function () {
        expect(statsJournal.witnessedAnyUndefinedStep()).toBeTruthy();
      });
    });
  });
});
