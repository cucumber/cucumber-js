var path = require('path');
require('../../support/spec_helper');

describe("Cucumber.Listener.RerunFormatter", function () {
  var Cucumber = requireLib('cucumber');
  var rerunFormatter;

  beforeEach(function () {
    rerunFormatter = Cucumber.Listener.RerunFormatter();
  });

  function createScenarioResult(status, uri, line) {
    var scenario = createSpyWithStubs("event", {getLine: line, getUri: uri});
    return createSpyWithStubs("event", {getScenario: scenario, getStatus: status});
  }

  describe("handleAfterFeaturesEvent()", function () {
    describe('all passing scenarios', function() {
      beforeEach(function(done){
        var scenarioResult = createScenarioResult(Cucumber.Status.PASSED);
        rerunFormatter.handleScenarioResultEvent(scenarioResult);
        rerunFormatter.handleAfterFeaturesEvent([], done);
      });

      it("logs nothing", function () {
        expect(rerunFormatter.getLogs()).toEqual('');
      });
    });

    describe('one failed scenario', function() {
      beforeEach(function(done) {
        var scenarioResult = createScenarioResult(Cucumber.Status.FAILED, 'path/to/scenario', 1);
        rerunFormatter.handleScenarioResultEvent(scenarioResult);

        rerunFormatter.handleAfterFeaturesEvent(null, done);
      });

      it("logs the path to the failed scenario", function () {
        expect(rerunFormatter.getLogs()).toEqual(path.normalize('path/to/scenario:1'));
      });
    });

    describe('one ambiguous scenario', function() {
      beforeEach(function(done) {
        var scenarioResult = createScenarioResult(Cucumber.Status.AMBIGUOUS, 'path/to/scenario', 1);
        rerunFormatter.handleScenarioResultEvent(scenarioResult);

        rerunFormatter.handleAfterFeaturesEvent(null, done);
      });

      it("logs the path to the ambiguous scenario", function () {
        expect(rerunFormatter.getLogs()).toEqual(path.normalize('path/to/scenario:1'));
      });
    });

    describe('one undefined scenario', function() {
      beforeEach(function(done) {
        var scenarioResult = createScenarioResult(Cucumber.Status.UNDEFINED, 'path/to/scenario', 1);
        rerunFormatter.handleScenarioResultEvent(scenarioResult);

        rerunFormatter.handleAfterFeaturesEvent(null, done);
      });

      it("logs the path to the undefined scenario", function () {
        expect(rerunFormatter.getLogs()).toEqual(path.normalize('path/to/scenario:1'));
      });
    });

    describe('one pending scenario', function() {
      beforeEach(function(done) {
        var scenarioResult = createScenarioResult(Cucumber.Status.PENDING, 'path/to/scenario', 1);
        rerunFormatter.handleScenarioResultEvent(scenarioResult);

        rerunFormatter.handleAfterFeaturesEvent(null, done);
      });

      it("logs the path to the pending scenario", function () {
        expect(rerunFormatter.getLogs()).toEqual(path.normalize('path/to/scenario:1'));
      });
    });

    describe('two failed scenarios (same file)', function() {
      beforeEach(function(done) {
        var scenarioResult1 = createScenarioResult(Cucumber.Status.FAILED, 'path/to/scenario', 1);
        rerunFormatter.handleScenarioResultEvent(scenarioResult1);

        var scenarioResult2 = createScenarioResult(Cucumber.Status.FAILED, 'path/to/scenario', 2);
        rerunFormatter.handleScenarioResultEvent(scenarioResult2);

        rerunFormatter.handleAfterFeaturesEvent([], done);
      });

      it("logs the path to the failed scenarios", function () {
        expect(rerunFormatter.getLogs()).toEqual(path.normalize('path/to/scenario:1:2'));
      });
    });

    describe('two failed scenarios (different file)', function() {
      beforeEach(function(done) {
        var scenarioResult1 = createScenarioResult(Cucumber.Status.FAILED, 'path/to/scenario', 1);
        rerunFormatter.handleScenarioResultEvent(scenarioResult1);

        var scenarioResult2 = createScenarioResult(Cucumber.Status.FAILED, 'other/path/to/scenario', 1);
        rerunFormatter.handleScenarioResultEvent(scenarioResult2);

        rerunFormatter.handleAfterFeaturesEvent([], done);
      });

      it("logs the path to the failed scenarios", function () {
        expect(rerunFormatter.getLogs()).toEqual(
          path.normalize('path/to/scenario:1') + '\n' +
          path.normalize('other/path/to/scenario:1')
        );
      });
    });
  });
});
