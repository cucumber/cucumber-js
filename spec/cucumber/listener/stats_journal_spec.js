require('../../support/spec_helper');

describe("Cucumber.Listener.StatsJournal", function () {
  var Cucumber = requireLib('cucumber');
  var async = require('async');
  var statsJournal, listener, step;

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
    listener    = createSpyWithStubs("listener");
    step        = createSpyWithStubs("step", {isHidden: false});
    spyOn(Cucumber, 'Listener').and.returnValue(listener);
    statsJournal = Cucumber.Listener.StatsJournal();
  });

  it("creates a listener", function () {
    expect(Cucumber.Listener).toHaveBeenCalled();
  });

  it("extends the listener", function () {
    expect(statsJournal).toBe(listener);
  });

  describe('scenario with passing step', function() {
    beforeEach(function (callback) {
      var passedStepResult = createSpyWithStubs('stepResult', {getDuration: 0, getStatus: Cucumber.Status.PASSED, getStep: step});
      handleScenarioWithStepResults([passedStepResult], callback);
    });

    it('records a passed step', function() {
      expect(statsJournal.getStepCounts()[Cucumber.Status.PASSED]).toEqual(1);
    });

    it('records a passed scenario', function() {
      expect(statsJournal.getScenarioCounts()[Cucumber.Status.PASSED]).toEqual(1);
    });
  });

  describe('scenario with failing step', function() {
    beforeEach(function (callback) {
      var failedStepResult = createSpyWithStubs('stepResult', {getDuration: 0, getFailureException: 'error', getStatus: Cucumber.Status.FAILED, getStep: step});
      handleScenarioWithStepResults([failedStepResult], callback);
    });

    it('records a failed step', function() {
      expect(statsJournal.getStepCounts()[Cucumber.Status.FAILED]).toEqual(1);
    });

    it('records a failed scenario', function() {
      expect(statsJournal.getScenarioCounts()[Cucumber.Status.FAILED]).toEqual(1);
    });
  });

  describe('scenario with pending step', function () {
    beforeEach(function (callback) {
      var pendingStepResult = createSpyWithStubs('stepResult', {getDuration: 0, getStatus: Cucumber.Status.PENDING, getStep: step});
      handleScenarioWithStepResults([pendingStepResult], callback);
    });

    it('records a pending step', function() {
      expect(statsJournal.getStepCounts()[Cucumber.Status.PENDING]).toEqual(1);
    });

    it('records a pending scenario', function() {
      expect(statsJournal.getScenarioCounts()[Cucumber.Status.PENDING]).toEqual(1);
    });
  });

  describe('scenario with undefined step', function () {
    beforeEach(function (callback) {
      var undefinedStepResult = createSpyWithStubs('stepResult', {getDuration: 0, getStatus: Cucumber.Status.UNDEFINED, getStep: step});
      handleScenarioWithStepResults([undefinedStepResult], callback);
    });

    it('records a undefined step', function() {
      expect(statsJournal.getStepCounts()[Cucumber.Status.UNDEFINED]).toEqual(1);
    });

    it('records a undefined scenario', function() {
      expect(statsJournal.getScenarioCounts()[Cucumber.Status.UNDEFINED]).toEqual(1);
    });
  });

  describe('scenario with skipped step', function () {
    beforeEach(function (callback) {
      var skippedStepResult = createSpyWithStubs('stepResult', {getDuration: 0, getStatus: Cucumber.Status.SKIPPED, getStep: step});
      handleScenarioWithStepResults([skippedStepResult], callback);
    });

    it('records a skipped step', function() {
      expect(statsJournal.getStepCounts()[Cucumber.Status.SKIPPED]).toEqual(1);
    });

    it('records a skipped scenario', function() {
      expect(statsJournal.getScenarioCounts()[Cucumber.Status.SKIPPED]).toEqual(1);
    });
  });

  describe('scenario with failing and pending step', function () {
    beforeEach(function (callback) {
      var failedStepResult = createSpyWithStubs('stepResult', {getDuration: 0, getFailureException: 'error', getStatus: Cucumber.Status.FAILED, getStep: step});
      var pendingStepResult = createSpyWithStubs('stepResult', {getDuration: 0, getStatus: Cucumber.Status.PENDING, getStep: step});
      handleScenarioWithStepResults([failedStepResult, pendingStepResult], callback);
    });

    it('records a failed step and a pending step', function() {
      var counts = statsJournal.getStepCounts();
      expect(counts[Cucumber.Status.FAILED]).toEqual(1);
      expect(counts[Cucumber.Status.PENDING]).toEqual(1);
    });

    it('records a failed scenario', function() {
      expect(statsJournal.getScenarioCounts()[Cucumber.Status.FAILED]).toEqual(1);
    });
  });

  describe('scenario with failing and undefined step', function () {
    beforeEach(function (callback) {
      var failedStepResult = createSpyWithStubs('stepResult', {getDuration: 0, getFailureException: 'error', getStatus: Cucumber.Status.FAILED, getStep: step});
      var undefinedStepResult = createSpyWithStubs('stepResult', {getDuration: 0, getStatus: Cucumber.Status.UNDEFINED, getStep: step});
      handleScenarioWithStepResults([failedStepResult, undefinedStepResult], callback);
    });

    it('records a failed step and a undefined step', function() {
      var counts = statsJournal.getStepCounts();
      expect(counts[Cucumber.Status.FAILED]).toEqual(1);
      expect(counts[Cucumber.Status.UNDEFINED]).toEqual(1);
    });

    it('records a failed scenario', function() {
      expect(statsJournal.getScenarioCounts()[Cucumber.Status.FAILED]).toEqual(1);
    });
  });

  describe('scenario with failing and skipped step', function () {
    beforeEach(function (callback) {
      var failedStepResult = createSpyWithStubs('stepResult', {getDuration: 0, getFailureException: 'error', getStatus: Cucumber.Status.FAILED, getStep: step});
      var skippedStepResult = createSpyWithStubs('stepResult', {getDuration: 0, getStatus: Cucumber.Status.SKIPPED, getStep: step});
      handleScenarioWithStepResults([failedStepResult, skippedStepResult], callback);
    });

    it('records a failed step and a pending step', function() {
      var counts = statsJournal.getStepCounts();
      expect(counts[Cucumber.Status.FAILED]).toEqual(1);
      expect(counts[Cucumber.Status.SKIPPED]).toEqual(1);
    });

    it('records a failed scenario', function() {
      expect(statsJournal.getScenarioCounts()[Cucumber.Status.FAILED]).toEqual(1);
    });
  });

  describe('scenario with pending and undefined steps', function () {
    beforeEach(function (callback) {
      var pendingStepResult = createSpyWithStubs('stepResult', {getDuration: 0, getStatus: Cucumber.Status.PENDING, getStep: step});
      var undefinedStepResult = createSpyWithStubs('stepResult', {getDuration: 0, getStatus: Cucumber.Status.UNDEFINED, getStep: step});
      handleScenarioWithStepResults([pendingStepResult, undefinedStepResult], callback);
    });

    it('records a pending step and a undefined step', function() {
      var counts = statsJournal.getStepCounts();
      expect(counts[Cucumber.Status.PENDING]).toEqual(1);
      expect(counts[Cucumber.Status.UNDEFINED]).toEqual(1);
    });

    it('records a pending scenario', function() {
      expect(statsJournal.getScenarioCounts()[Cucumber.Status.PENDING]).toEqual(1);
    });
  });

  describe('scenario with pending and skipped steps', function () {
    beforeEach(function (callback) {
      var pendingStepResult = createSpyWithStubs('stepResult', {getDuration: 0, getStatus: Cucumber.Status.PENDING, getStep: step});
      var skippedStepResult = createSpyWithStubs('stepResult', {getDuration: 0, getStatus: Cucumber.Status.SKIPPED, getStep: step});
      handleScenarioWithStepResults([pendingStepResult, skippedStepResult], callback);
    });

    it('records a pending step and a skipped step', function() {
      var counts = statsJournal.getStepCounts();
      expect(counts[Cucumber.Status.PENDING]).toEqual(1);
      expect(counts[Cucumber.Status.SKIPPED]).toEqual(1);
    });

    it('records a pending scenario', function() {
      expect(statsJournal.getScenarioCounts()[Cucumber.Status.PENDING]).toEqual(1);
    });
  });

  describe('scenario with skipped and undefined steps', function () {
    beforeEach(function (callback) {
      var skippedStepResult = createSpyWithStubs('stepResult', {getDuration: 0, getStatus: Cucumber.Status.SKIPPED, getStep: step});
      var undefinedStepResult = createSpyWithStubs('stepResult', {getDuration: 0, getStatus: Cucumber.Status.UNDEFINED, getStep: step});
      handleScenarioWithStepResults([skippedStepResult, undefinedStepResult], callback);
    });

    it('records a skipped step and a undefined step', function() {
      var counts = statsJournal.getStepCounts();
      expect(counts[Cucumber.Status.SKIPPED]).toEqual(1);
      expect(counts[Cucumber.Status.UNDEFINED]).toEqual(1);
    });

    it('records a skipped scenario', function() {
      expect(statsJournal.getScenarioCounts()[Cucumber.Status.SKIPPED]).toEqual(1);
    });
  });
});
