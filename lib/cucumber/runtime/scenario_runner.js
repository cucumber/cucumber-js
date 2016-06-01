function ScenarioRunner(scenario, supportCodeLibrary, eventBroadcaster, options) {
  var Cucumber = require('../../cucumber');

  var scenarioResult = Cucumber.Runtime.ScenarioResult(scenario);
  var apiScenario = Cucumber.Api.Scenario(scenario, scenarioResult);
  var defaultTimeout = supportCodeLibrary.getDefaultTimeout();
  var world = supportCodeLibrary.instantiateNewWorld();

  var self = {
    run: function run(callback) {
      var payload = { scenario: scenario };
      var event = Cucumber.Runtime.Event(Cucumber.Events.SCENARIO_EVENT_NAME, payload);
      eventBroadcaster.broadcastAroundEvent(
        event,
        function (callback) {
          self.runBeforeHooks(function () {
            self.runSteps(function() {
              self.runAfterHooks(function(){
                self.broadcastScenarioResult(callback);
              });
            });
          });
        },
        function() {
          callback(scenarioResult);
        }
      );
    },

    runBeforeHooks: function runBeforeHooks(callback) {
      var beforeHooks = supportCodeLibrary.lookupBeforeHooksByScenario(scenario);
      Cucumber.Util.asyncForEach(beforeHooks, function(beforeHook, callback) {
        var beforeStep = Cucumber.Ast.HookStep(Cucumber.Ast.HookStep.BEFORE_STEP_KEYWORD);
        beforeStep.setScenario(scenario);
        self.executeStep(beforeStep, beforeHook, callback);
      }, callback);
    },

    runSteps: function runSteps(callback) {
      Cucumber.Util.asyncForEach(scenario.getSteps(), self.runStep, callback);
    },

    runAfterHooks: function runAfterHooks(callback) {
      var afterHooks = supportCodeLibrary.lookupAfterHooksByScenario(scenario).reverse();
      Cucumber.Util.asyncForEach(afterHooks, function(afterHook, callback) {
        var afterStep = Cucumber.Ast.HookStep(Cucumber.Ast.HookStep.AFTER_STEP_KEYWORD);
        afterStep.setScenario(scenario);
        self.executeStep(afterStep, afterHook, callback);
      }, callback);
    },

    broadcastScenarioResult: function broadcastScenarioResult(callback) {
      var payload = { scenarioResult: scenarioResult };
      var event   = Cucumber.Runtime.Event(Cucumber.Events.SCENARIO_RESULT_EVENT_NAME, payload);
      eventBroadcaster.broadcastEvent(event, callback);
    },

    runStep: function runStep(step, callback) {
      var payload = { step: step };
      var event   = Cucumber.Runtime.Event(Cucumber.Events.STEP_EVENT_NAME, payload);
      eventBroadcaster.broadcastAroundEvent(
        event,
        function (callback) {
          process.nextTick(function() {
            self.processStep(step, callback);
          });
        },
        callback
      );
    },

    broadcastStepResult: function broadcastStepResult(stepResult, callback) {
      scenarioResult.witnessStepResult(stepResult);
      var payload = { stepResult: stepResult };
      var event   = Cucumber.Runtime.Event(Cucumber.Events.STEP_RESULT_EVENT_NAME, payload);
      eventBroadcaster.broadcastEvent(event, callback);
    },

    isSkippingSteps: function isSkippingSteps() {
      return scenarioResult.getStatus() !== Cucumber.Status.PASSED;
    },

    processStep: function processStep(step, callback) {
      var stepName = step.getName();
      var stepDefinitions = supportCodeLibrary.lookupStepDefinitionsByName(stepName);
      if (stepDefinitions.length === 0) {
        self.skipUndefinedStep(step, callback);
      } else if (stepDefinitions.length > 1) {
        self.skipAmbiguousStep(step, stepDefinitions, callback);
      } else if (options.dryRun || self.isSkippingSteps()) {
        self.skipStep(step, stepDefinitions[0], callback);
      } else {
        self.executeStep(step, stepDefinitions[0], callback);
      }
    },

    executeStep: function executeStep(step, stepDefinition, callback) {
      stepDefinition.invoke(step, world, apiScenario, defaultTimeout, function (stepResult) {
        apiScenario.clearAttachments();
        self.broadcastStepResult(stepResult, callback);
      });
    },

    skipAmbiguousStep: function skipAmbiguousStep(step, stepDefinitions, callback) {
      var ambiguousStepResult = Cucumber.Runtime.StepResult({
        ambiguousStepDefinitions: stepDefinitions,
        step: step,
        status: Cucumber.Status.AMBIGUOUS
      });
      self.broadcastStepResult(ambiguousStepResult, callback);
    },

    skipStep: function skipStep(step, stepDefinition, callback) {
      var skippedStepResult = Cucumber.Runtime.StepResult({
        step: step,
        stepDefinition: stepDefinition,
        status: Cucumber.Status.SKIPPED
      });
      self.broadcastStepResult(skippedStepResult, callback);
    },

    skipUndefinedStep: function skipUndefinedStep(step, callback) {
      var undefinedStepResult = Cucumber.Runtime.StepResult({step: step, status: Cucumber.Status.UNDEFINED});
      self.broadcastStepResult(undefinedStepResult, callback);
    }
  };

  return self;
}

module.exports = ScenarioRunner;
