require('../../support/spec_helper');

describe("Cucumber.Listener.RerunFormatter", function () {
  var Cucumber = requireLib('cucumber');
  var rerunFormatter;

  beforeEach(function () {
    rerunFormatter = Cucumber.Listener.RerunFormatter();
  });

  function createScenarioResultEvent(status, uri, line) {
    var scenario = createSpyWithStubs("event", {getLine: line, getUri: uri});
    var scenarioResult = createSpyWithStubs("event", {getScenario: scenario, getStatus: status});
    return createSpyWithStubs("event", {getPayloadItem: scenarioResult});
  }

  describe("handleAfterFeaturesEvent()", function () {
    describe('no failed scenarios', function() {
      beforeEach(function(done){
        var event = createScenarioResultEvent(Cucumber.Status.PASSED);
        rerunFormatter.handleScenarioResultEvent(event, function() {});

        rerunFormatter.handleAfterFeaturesEvent(null, done);
      });

      it("logs nothing", function () {
        expect(rerunFormatter.getLogs()).toEqual('');
      });
    });

    describe('one failed scenario', function() {
      beforeEach(function(done) {
        var event = createScenarioResultEvent(Cucumber.Status.FAILED, 'path/to/scenario', 1);
        rerunFormatter.handleScenarioResultEvent(event, function() {});

        rerunFormatter.handleAfterFeaturesEvent(null, done);
      });

      it("logs nothing", function () {
        expect(rerunFormatter.getLogs()).toEqual('path/to/scenario:1');
      });
    });

    describe('two failed scenarios (same file)', function() {
      beforeEach(function(done) {
        var event1 = createScenarioResultEvent(Cucumber.Status.FAILED, 'path/to/scenario', 1);
        rerunFormatter.handleScenarioResultEvent(event1, function() {});

        var event2 = createScenarioResultEvent(Cucumber.Status.FAILED, 'path/to/scenario', 2);
        rerunFormatter.handleScenarioResultEvent(event2, function() {});

        rerunFormatter.handleAfterFeaturesEvent(null, done);
      });

      it("logs the path to the failed scenarios", function () {
        expect(rerunFormatter.getLogs()).toEqual('path/to/scenario:1:2');
      });
    });

    describe('two failed scenarios (different file)', function() {
      beforeEach(function(done) {
        var event1 = createScenarioResultEvent(Cucumber.Status.FAILED, 'path/to/scenario', 1);
        rerunFormatter.handleScenarioResultEvent(event1, function() {});

        var event2 = createScenarioResultEvent(Cucumber.Status.FAILED, 'other/path/to/scenario', 1);
        rerunFormatter.handleScenarioResultEvent(event2, function() {});

        rerunFormatter.handleAfterFeaturesEvent(null, done);
      });

      it("logs the path to the failed scenarios", function () {
        expect(rerunFormatter.getLogs()).toEqual(
          'path/to/scenario:1' + '\n' +
          'other/path/to/scenario:1'
        );
      });
    });
  });
});
