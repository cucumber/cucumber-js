require('../../support/spec_helper');

describe("Cucumber.Runtime.ScenarioRunner", function () {
  var Cucumber = requireLib('cucumber');
  var supportCodeLibrary, eventBroadcaster, options, world, defaultTimeout, scenario, scenarioRunner;

  beforeEach(function () {
    world = createSpy('world');
    defaultTimeout = createSpy('defaultTimeout');
    scenario = createSpyWithStubs("Scenario", {
      getSteps: []
    });
    supportCodeLibrary = createSpyWithStubs("Support code library", {
      getDefaultTimeout: defaultTimeout,
      instantiateNewWorld: world,
      lookupBeforeHooksByScenario: [],
      lookupAfterHooksByScenario: [],
      lookupStepDefinitionsByName: []
    });
    eventBroadcaster = createSpyWithStubs("Event Broadcaster", {broadcastEvent: null, broadcastAroundEvent: null});
    eventBroadcaster.broadcastAroundEvent.and.callFake(function(event, userFunction, callback) {
      userFunction(function(){
        callback.apply(null, arguments);
      });
    });
    eventBroadcaster.broadcastEvent.and.callFake(function(event, callback) {
      callback();
    });
    options = {};
    scenarioRunner = Cucumber.Runtime.ScenarioRunner(scenario, supportCodeLibrary, eventBroadcaster, options);
  });

  describe("run()", function () {
    var result;

    describe("with no steps or hooks", function() {
      beforeEach(function(done) {
        scenarioRunner.run(function(value) {
          result = value;
          done();
        });
      });

      it('broadcasts a scenario event', function() {
        expect(eventBroadcaster.broadcastAroundEvent).toHaveBeenCalledTimes(1);
        var event = eventBroadcaster.broadcastAroundEvent.calls.argsFor(0)[0];
        expect(event.getName()).toEqual('Scenario');
        expect(event.getPayload()).toEqual(scenario);
      });

      it('returns a passing result', function() {
        expect(result.getStatus()).toEqual(Cucumber.Status.PASSED);
      });
    });

    describe("with a passing step", function() {
      var step, stepDefinition, stepResult;

      beforeEach(function(done) {
        step = Cucumber.Ast.Step({});
        stepResult = Cucumber.Runtime.StepResult({duration: 1, status: Cucumber.Status.PASSED, step: step});
        stepDefinition = createSpyWithStubs('stepDefinition', {invoke: null});
        stepDefinition.invoke.and.callFake(function(){ arguments[4](stepResult); });
        supportCodeLibrary.lookupStepDefinitionsByName.and.returnValue([stepDefinition]);
        scenario.getSteps.and.returnValue([step]);
        scenarioRunner.run(function(value) {
          result = value;
          done();
        });
      });

      it('broadcasts a scenario, step, stepResult and scenarioResult event', function() {
        expect(eventBroadcaster.broadcastAroundEvent).toHaveBeenCalledTimes(2);
        expect(eventBroadcaster.broadcastEvent).toHaveBeenCalledTimes(2);

        var event = eventBroadcaster.broadcastAroundEvent.calls.argsFor(0)[0];
        expect(event.getName()).toEqual('Scenario');
        expect(event.getPayload()).toEqual(scenario);

        event = eventBroadcaster.broadcastAroundEvent.calls.argsFor(1)[0];
        expect(event.getName()).toEqual('Step');
        expect(event.getPayload()).toEqual(step);

        event = eventBroadcaster.broadcastEvent.calls.argsFor(0)[0];
        expect(event.getName()).toEqual('StepResult');
        expect(event.getPayload()).toEqual(stepResult);

        event = eventBroadcaster.broadcastEvent.calls.argsFor(1)[0];
        expect(event.getName()).toEqual('ScenarioResult');
        expect(event.getPayload()).toEqual(result);
      });

      it('returns a passing result', function() {
        expect(result.getStatus()).toEqual(Cucumber.Status.PASSED);
      });
    });

    describe("with a failing step", function() {
      var step, stepDefinition, stepResult;

      beforeEach(function(done) {
        step = Cucumber.Ast.Step({});
        stepResult = Cucumber.Runtime.StepResult({duration: 1, status: Cucumber.Status.FAILED, step: step});
        stepDefinition = createSpyWithStubs('stepDefinition', {invoke: null});
        stepDefinition.invoke.and.callFake(function(){ arguments[4](stepResult); });
        supportCodeLibrary.lookupStepDefinitionsByName.and.returnValue([stepDefinition]);
        scenario.getSteps.and.returnValue([step]);
        scenarioRunner.run(function(value) {
          result = value;
          done();
        });
      });

      it('broadcasts a scenario, step and stepResult event', function() {
        expect(eventBroadcaster.broadcastAroundEvent).toHaveBeenCalledTimes(2);
        expect(eventBroadcaster.broadcastEvent).toHaveBeenCalledTimes(2);

        var event = eventBroadcaster.broadcastAroundEvent.calls.argsFor(0)[0];
        expect(event.getName()).toEqual('Scenario');
        expect(event.getPayload()).toEqual(scenario);

        event = eventBroadcaster.broadcastAroundEvent.calls.argsFor(1)[0];
        expect(event.getName()).toEqual('Step');
        expect(event.getPayload()).toEqual(step);

        event = eventBroadcaster.broadcastEvent.calls.argsFor(0)[0];
        expect(event.getName()).toEqual('StepResult');
        expect(event.getPayload()).toEqual(stepResult);

        event = eventBroadcaster.broadcastEvent.calls.argsFor(1)[0];
        expect(event.getName()).toEqual('ScenarioResult');
        expect(event.getPayload()).toEqual(result);
      });

      it('returns a failed result', function() {
        expect(result.getStatus()).toEqual(Cucumber.Status.FAILED);
      });
    });

    describe("with an ambiguous step", function() {
      var step, stepDefinitions;

      beforeEach(function(done) {
        step = Cucumber.Ast.Step({});
        stepDefinitions = [createSpy('stepDefinition1'), createSpy('stepDefinition2')];
        supportCodeLibrary.lookupStepDefinitionsByName.and.returnValue(stepDefinitions);
        scenario.getSteps.and.returnValue([step]);
        scenarioRunner.run(function(value) {
          result = value;
          done();
        });
      });

      it('broadcasts a scenario, step and stepResult event', function() {
        expect(eventBroadcaster.broadcastAroundEvent).toHaveBeenCalledTimes(2);
        expect(eventBroadcaster.broadcastEvent).toHaveBeenCalledTimes(2);

        var event = eventBroadcaster.broadcastAroundEvent.calls.argsFor(0)[0];
        expect(event.getName()).toEqual('Scenario');
        expect(event.getPayload()).toEqual(scenario);

        event = eventBroadcaster.broadcastAroundEvent.calls.argsFor(1)[0];
        expect(event.getName()).toEqual('Step');
        expect(event.getPayload()).toEqual(step);

        event = eventBroadcaster.broadcastEvent.calls.argsFor(0)[0];
        expect(event.getName()).toEqual('StepResult');
        var stepResult = event.getPayload();
        expect(stepResult.getStatus()).toEqual(Cucumber.Status.AMBIGUOUS);
        expect(stepResult.getAmbiguousStepDefinitions()).toEqual(stepDefinitions);

        event = eventBroadcaster.broadcastEvent.calls.argsFor(1)[0];
        expect(event.getName()).toEqual('ScenarioResult');
        expect(event.getPayload()).toEqual(result);
      });

      it('returns a failed result', function() {
        expect(result.getStatus()).toEqual(Cucumber.Status.AMBIGUOUS);
      });
    });

    describe("with an undefined step", function() {
      var step;

      beforeEach(function(done) {
        step = Cucumber.Ast.Step({});
        scenario.getSteps.and.returnValue([step]);
        scenarioRunner.run(function(value) {
          result = value;
          done();
        });
      });

      it('broadcasts a scenario, step and stepResult event', function() {
        expect(eventBroadcaster.broadcastAroundEvent).toHaveBeenCalledTimes(2);
        expect(eventBroadcaster.broadcastEvent).toHaveBeenCalledTimes(2);

        var event = eventBroadcaster.broadcastAroundEvent.calls.argsFor(0)[0];
        expect(event.getName()).toEqual('Scenario');
        expect(event.getPayload()).toEqual(scenario);

        event = eventBroadcaster.broadcastAroundEvent.calls.argsFor(1)[0];
        expect(event.getName()).toEqual('Step');
        expect(event.getPayload()).toEqual(step);

        event = eventBroadcaster.broadcastEvent.calls.argsFor(0)[0];
        expect(event.getName()).toEqual('StepResult');
        var stepResult = event.getPayload();
        expect(stepResult.getStatus()).toEqual(Cucumber.Status.UNDEFINED);

        event = eventBroadcaster.broadcastEvent.calls.argsFor(1)[0];
        expect(event.getName()).toEqual('ScenarioResult');
        expect(event.getPayload()).toEqual(result);
      });

      it('returns a failed result', function() {
        expect(result.getStatus()).toEqual(Cucumber.Status.UNDEFINED);
      });
    });

    describe("with a step in dry run mode", function() {
      var step, stepDefinition;

      beforeEach(function(done) {
        options.dryRun = true;
        step = Cucumber.Ast.Step({});
        stepDefinition = createSpy('stepDefinition');
        supportCodeLibrary.lookupStepDefinitionsByName.and.returnValue([stepDefinition]);
        scenario.getSteps.and.returnValue([step]);
        scenarioRunner.run(function(value) {
          result = value;
          done();
        });
      });

      it('broadcasts a scenario, step and stepResult event', function() {
        expect(eventBroadcaster.broadcastAroundEvent).toHaveBeenCalledTimes(2);
        expect(eventBroadcaster.broadcastEvent).toHaveBeenCalledTimes(2);

        var event = eventBroadcaster.broadcastAroundEvent.calls.argsFor(0)[0];
        expect(event.getName()).toEqual('Scenario');
        expect(event.getPayload()).toEqual(scenario);

        event = eventBroadcaster.broadcastAroundEvent.calls.argsFor(1)[0];
        expect(event.getName()).toEqual('Step');
        expect(event.getPayload()).toEqual(step);

        event = eventBroadcaster.broadcastEvent.calls.argsFor(0)[0];
        expect(event.getName()).toEqual('StepResult');
        var stepResult = event.getPayload();
        expect(stepResult.getStatus()).toEqual(Cucumber.Status.SKIPPED);

        event = eventBroadcaster.broadcastEvent.calls.argsFor(1)[0];
        expect(event.getName()).toEqual('ScenarioResult');
        expect(event.getPayload()).toEqual(result);
      });

      it('returns a skipped result', function() {
        expect(result.getStatus()).toEqual(Cucumber.Status.SKIPPED);
      });
    });

    describe("with an before hook and step in dry run mode", function() {
      var hook, step, stepDefinition;

      beforeEach(function(done) {
        options.dryRun = true;
        hook = Cucumber.SupportCode.Hook(function(){ throw new Error('error'); }, {});
        step = Cucumber.Ast.Step({});
        stepDefinition = createSpy('stepDefinition');
        supportCodeLibrary.lookupBeforeHooksByScenario.and.returnValue([hook]);
        supportCodeLibrary.lookupStepDefinitionsByName.and.returnValue([stepDefinition]);
        scenario.getSteps.and.returnValue([step]);
        scenarioRunner.run(function(value) {
          result = value;
          done();
        });
      });

      it('broadcasts a scenario, step and stepResult event and does not run the hook', function() {
        expect(eventBroadcaster.broadcastAroundEvent).toHaveBeenCalledTimes(3);
        expect(eventBroadcaster.broadcastEvent).toHaveBeenCalledTimes(3);

        var event = eventBroadcaster.broadcastAroundEvent.calls.argsFor(0)[0];
        expect(event.getName()).toEqual('Scenario');
        expect(event.getPayload()).toEqual(scenario);

        event = eventBroadcaster.broadcastAroundEvent.calls.argsFor(1)[0];
        expect(event.getName()).toEqual('Step');
        var hookStep = event.getPayload();
        expect(hookStep.getKeyword()).toEqual('Before ');

        event = eventBroadcaster.broadcastEvent.calls.argsFor(0)[0];
        expect(event.getName()).toEqual('StepResult');
        var stepResult = event.getPayload();
        expect(stepResult.getStatus()).toEqual(Cucumber.Status.SKIPPED);

        event = eventBroadcaster.broadcastAroundEvent.calls.argsFor(2)[0];
        expect(event.getName()).toEqual('Step');
        expect(event.getPayload()).toEqual(step);

        event = eventBroadcaster.broadcastEvent.calls.argsFor(1)[0];
        expect(event.getName()).toEqual('StepResult');
        stepResult = event.getPayload();
        expect(stepResult.getStatus()).toEqual(Cucumber.Status.SKIPPED);

        event = eventBroadcaster.broadcastEvent.calls.argsFor(2)[0];
        expect(event.getName()).toEqual('ScenarioResult');
        expect(event.getPayload()).toEqual(result);
      });

      it('returns a skipped result', function() {
        expect(result.getStatus()).toEqual(Cucumber.Status.SKIPPED);
      });
    });

    describe("with an after hook and step in dry run mode", function() {
      var step, stepDefinition;

      beforeEach(function(done) {
        options.dryRun = true;
        var hook = Cucumber.SupportCode.Hook(function(){ throw new Error('error'); }, {});
        step = Cucumber.Ast.Step({});
        stepDefinition = createSpy('stepDefinition');
        supportCodeLibrary.lookupAfterHooksByScenario.and.returnValue([hook]);
        supportCodeLibrary.lookupStepDefinitionsByName.and.returnValue([stepDefinition]);
        scenario.getSteps.and.returnValue([step]);
        scenarioRunner.run(function(value) {
          result = value;
          done();
        });
      });

      it('broadcasts a scenario, step and stepResult event and does not run the hook', function() {
        expect(eventBroadcaster.broadcastAroundEvent).toHaveBeenCalledTimes(3);
        expect(eventBroadcaster.broadcastEvent).toHaveBeenCalledTimes(3);

        var event = eventBroadcaster.broadcastAroundEvent.calls.argsFor(0)[0];
        expect(event.getName()).toEqual('Scenario');
        expect(event.getPayload()).toEqual(scenario);

        event = eventBroadcaster.broadcastAroundEvent.calls.argsFor(1)[0];
        expect(event.getName()).toEqual('Step');
        expect(event.getPayload()).toEqual(step);

        event = eventBroadcaster.broadcastEvent.calls.argsFor(0)[0];
        expect(event.getName()).toEqual('StepResult');
        var stepResult = event.getPayload();
        expect(stepResult.getStatus()).toEqual(Cucumber.Status.SKIPPED);

        event = eventBroadcaster.broadcastAroundEvent.calls.argsFor(2)[0];
        expect(event.getName()).toEqual('Step');
        var hookStep = event.getPayload();
        expect(hookStep.getKeyword()).toEqual('After ');

        event = eventBroadcaster.broadcastEvent.calls.argsFor(1)[0];
        expect(event.getName()).toEqual('StepResult');
        stepResult = event.getPayload();
        expect(stepResult.getStatus()).toEqual(Cucumber.Status.SKIPPED);

        event = eventBroadcaster.broadcastEvent.calls.argsFor(2)[0];
        expect(event.getName()).toEqual('ScenarioResult');
        expect(event.getPayload()).toEqual(result);
      });

      it('returns a skipped result', function() {
        expect(result.getStatus()).toEqual(Cucumber.Status.SKIPPED);
      });
    });
  });
});
