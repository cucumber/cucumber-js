require('../../support/spec_helper');

describe("Cucumber.Runtime.FeaturesRunner", function () {
  var Cucumber = requireLib('cucumber');
  var features, supportCodeLibrary, listeners, options;
  var featuresRunner, eventBroadcaster, scenarioRunner, scenarioResult;

  beforeEach(function () {
    features = [];
    supportCodeLibrary = createSpyWithStubs("Support code library", {
      getDefaultTimeout: 5000,
      getListeners: []
    });
    listeners = [];
    options = {};
    eventBroadcaster = createSpyWithStubs("Event Broadcaster", {broadcastEvent: null, broadcastAroundEvent: null});
    eventBroadcaster.broadcastEvent.and.callFake(function(event, callback) {
      callback();
    });
    eventBroadcaster.broadcastAroundEvent.and.callFake(function(event, userFunction, callback) {
      userFunction(function(){
        callback.apply(null, arguments);
      });
    });
    spyOn(Cucumber.Runtime, 'EventBroadcaster').and.returnValue(eventBroadcaster);
    scenarioRunner = createSpyWithStubs("Scenario Runner", {run: null});
    scenarioRunner.run.and.callFake(function(callback) {
      callback(scenarioResult);
    });
    spyOn(Cucumber.Runtime, 'ScenarioRunner').and.returnValue(scenarioRunner);
    featuresRunner = Cucumber.Runtime.FeaturesRunner(features, supportCodeLibrary, listeners, options);
  });

  describe("run()", function () {
    var result;

    describe("with no features", function() {
      beforeEach(function(done) {
        featuresRunner.run(function(value) {
          result = value;
          done();
        });
      });

      it('broadcasts a features event', function() {
        expect(eventBroadcaster.broadcastAroundEvent).toHaveBeenCalledTimes(1);
        expect(eventBroadcaster.broadcastEvent).toHaveBeenCalledTimes(1);

        var event = eventBroadcaster.broadcastAroundEvent.calls.argsFor(0)[0];
        expect(event.getName()).toEqual('Features');
        expect(event.getPayload()).toEqual(features);

        event = eventBroadcaster.broadcastEvent.calls.argsFor(0)[0];
        expect(event.getName()).toEqual('FeaturesResult');
      });

      it('returns a successful result', function() {
        expect(result).toEqual(true);
      });
    });

    describe("with a feature with a passing scenario", function() {
      var feature;

      beforeEach(function(done) {
        var scenario = createSpy('scenario');
        feature = createSpyWithStubs('feature', {getScenarios: [scenario]});
        scenarioResult = createSpyWithStubs('scenarioResult', {getDuration: 1, getStatus: Cucumber.Status.PASSED, getStepCounts: {}});
        features.push(feature);
        featuresRunner.run(function(value) {
          result = value;
          done();
        });
      });

      it('broadcasts a features, feature and featuresResult event', function() {
        expect(eventBroadcaster.broadcastAroundEvent).toHaveBeenCalledTimes(2);
        expect(eventBroadcaster.broadcastEvent).toHaveBeenCalledTimes(1);

        var event = eventBroadcaster.broadcastAroundEvent.calls.argsFor(0)[0];
        expect(event.getName()).toEqual('Features');
        expect(event.getPayload()).toEqual(features);

        event = eventBroadcaster.broadcastAroundEvent.calls.argsFor(1)[0];
        expect(event.getName()).toEqual('Feature');
        expect(event.getPayload()).toEqual(feature);

        event = eventBroadcaster.broadcastEvent.calls.argsFor(0)[0];
        expect(event.getName()).toEqual('FeaturesResult');
      });

      it('returns a successful result', function() {
        expect(result).toEqual(true);
      });
    });

    describe("with a feature with a failing scenario", function() {
      var feature;

      beforeEach(function(done) {
        var scenario = createSpy('scenario');
        feature = createSpyWithStubs('feature', {getScenarios: [scenario]});
        scenarioResult = createSpyWithStubs('scenarioResult', {getDuration: 1, getStatus: Cucumber.Status.FAILED, getStepCounts: {}});
        features.push(feature);
        featuresRunner.run(function(value) {
          result = value;
          done();
        });
      });

      it('broadcasts a features, feature and featuresResult event', function() {
        expect(eventBroadcaster.broadcastAroundEvent).toHaveBeenCalledTimes(2);
        expect(eventBroadcaster.broadcastEvent).toHaveBeenCalledTimes(1);

        var event = eventBroadcaster.broadcastAroundEvent.calls.argsFor(0)[0];
        expect(event.getName()).toEqual('Features');
        expect(event.getPayload()).toEqual(features);

        event = eventBroadcaster.broadcastAroundEvent.calls.argsFor(1)[0];
        expect(event.getName()).toEqual('Feature');
        expect(event.getPayload()).toEqual(feature);

        event = eventBroadcaster.broadcastEvent.calls.argsFor(0)[0];
        expect(event.getName()).toEqual('FeaturesResult');
      });

      it('returns a unsuccessful result', function() {
        expect(result).toEqual(false);
      });
    });
  });
});
