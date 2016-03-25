function AstTreeWalker(features, supportCodeLibrary, listeners, options) {
  var Cucumber = require('../../cucumber');

  var world;
  var featuresResult = Cucumber.Runtime.FeaturesResult(options.strict);
  var beforeSteps = Cucumber.Type.Collection();
  var afterSteps = Cucumber.Type.Collection();
  var attachments = [];
  var apiScenario, scenarioResult;

  var self = {
    walk: function walk(callback) {
      self.visitFeatures(features, function () {
        callback(featuresResult.isSuccessful());
      });
    },

    visitFeatures: function visitFeatures(features, callback) {
      var payload = { features: features };
      var event   = AstTreeWalker.Event(AstTreeWalker.FEATURES_EVENT_NAME, payload);
      self.broadcastEventAroundUserFunction(
        event,
        function (callback) {
          features.acceptVisitor(self, function(){
            self.visitFeaturesResult(callback);
          });
        },
        callback
      );
    },

    visitFeaturesResult: function visitFeaturesResult(callback) {
      var payload = { featuresResult: featuresResult };
      var event   = AstTreeWalker.Event(AstTreeWalker.FEATURES_RESULT_EVENT_NAME, payload);
      self.broadcastEvent(event, callback);
    },

    visitFeature: function visitFeature(feature, callback) {
      if (!featuresResult.isSuccessful() && options.failFast) {
        return callback();
      }
      var payload = { feature: feature };
      var event   = AstTreeWalker.Event(AstTreeWalker.FEATURE_EVENT_NAME, payload);
      self.broadcastEventAroundUserFunction(
        event,
        function (callback) { feature.acceptVisitor(self, callback); },
        callback
      );
    },

    visitBackground: function visitBackground(background, callback) {
      var payload = { background: background };
      var event   = AstTreeWalker.Event(AstTreeWalker.BACKGROUND_EVENT_NAME, payload);
      self.broadcastEvent(event, callback);
    },

    visitScenario: function visitScenario(scenario, callback) {
      if (!featuresResult.isSuccessful() && options.failFast) {
        return callback();
      }
      var world = supportCodeLibrary.instantiateNewWorld();
      self.setWorld(world);
      self.witnessNewScenario(scenario);
      self.createBeforeStepsForBeforeHooks(scenario);
      self.createAfterStepsForAfterHooks(scenario);
      var payload = { scenario: scenario };
      var event = AstTreeWalker.Event(AstTreeWalker.SCENARIO_EVENT_NAME, payload);
      self.broadcastEventAroundUserFunction (
        event,
        function (callback) {
          self.visitBeforeSteps(function () {
            scenario.acceptVisitor(self, function () {
              self.visitAfterSteps(function() {
                self.visitScenarioResult(callback);
              });
            });
          });
        },
        callback
      );
    },

    createBeforeStepsForBeforeHooks: function createBeforeStepsForBeforeHooks(scenario) {
      var beforeHooks = supportCodeLibrary.lookupBeforeHooksByScenario(scenario);
      beforeHooks.forEach(function (beforeHook) {
        var beforeStep = Cucumber.Ast.HookStep(AstTreeWalker.BEFORE_STEP_KEYWORD);
        beforeStep.setScenario(scenario);
        beforeStep.setHook(beforeHook);
        beforeSteps.add(beforeStep);
      });
    },

    createAfterStepsForAfterHooks: function createAfterStepsForAfterHooks(scenario) {
      var afterHooks = supportCodeLibrary.lookupAfterHooksByScenario(scenario);
      afterHooks.forEach(function (afterHook) {
        var afterStep = Cucumber.Ast.HookStep(AstTreeWalker.AFTER_STEP_KEYWORD);
        afterStep.setScenario(scenario);
        afterStep.setHook(afterHook);
        afterSteps.unshift(afterStep);
      });
    },

    visitBeforeSteps: function visitBeforeSteps(callback) {
      beforeSteps.asyncForEach(function (beforeStep, callback) {
        self.witnessHook();
        self.executeHookStep(beforeStep, callback);
      }, callback);
    },

    visitAfterSteps: function visitAfterSteps(callback) {
      afterSteps.asyncForEach(function (afterStep, callback) {
        self.witnessHook();
        self.executeHookStep(afterStep, callback);
      }, callback);
    },

    visitScenarioResult: function visitScenarioResult(callback) {
      featuresResult.witnessScenarioResult(scenarioResult);
      var payload = { scenarioResult: scenarioResult };
      var event   = AstTreeWalker.Event(AstTreeWalker.SCENARIO_RESULT_EVENT_NAME, payload);
      self.broadcastEvent(event, callback);
    },

    visitStep: function visitStep(step, callback) {
      self.witnessNewStep();
      var payload = { step: step };
      var event   = AstTreeWalker.Event(AstTreeWalker.STEP_EVENT_NAME, payload);
      self.broadcastEventAroundUserFunction (
        event,
        function (callback) {
          process.nextTick(function() {
            self.processStep(step, callback);
          });
        },
        callback
      );
    },

    visitStepResult: function visitStepResult(stepResult, callback) {
      scenarioResult.witnessStepResult(stepResult);
      featuresResult.witnessStepResult(stepResult);
      var payload = { stepResult: stepResult };
      var event   = AstTreeWalker.Event(AstTreeWalker.STEP_RESULT_EVENT_NAME, payload);
      self.broadcastEvent(event, callback);
    },

    broadcastEventAroundUserFunction: function broadcastEventAroundUserFunction (event, userFunction, callback) {
      var userFunctionWrapper = self.wrapUserFunctionAndAfterEventBroadcast(userFunction, event, callback);
      self.broadcastBeforeEvent(event, userFunctionWrapper);
    },

    wrapUserFunctionAndAfterEventBroadcast: function wrapUserFunctionAndAfterEventBroadcast(userFunction, event, callback) {
      var callAfterEventBroadcast = self.wrapAfterEventBroadcast(event, callback);
      return function callUserFunctionAndBroadcastAfterEvent() {
        userFunction (callAfterEventBroadcast);
      };
    },

    wrapAfterEventBroadcast: function wrapAfterEventBroadcast(event, callback) {
      return function () { self.broadcastAfterEvent(event, callback); };
    },

    broadcastBeforeEvent: function broadcastBeforeEvent(event, callback) {
      var preEvent = event.replicateAsPreEvent();
      self.broadcastEvent(preEvent, callback);
    },

    broadcastAfterEvent: function broadcastAfterEvent(event, callback) {
      var postEvent = event.replicateAsPostEvent();
      self.broadcastEvent(postEvent, callback);
    },

    broadcastEvent: function broadcastEvent(event, callback) {
      function broadcastToListeners(listeners, callback) {
        var iterator = function (listener, callback) {
          listener.hear(event, callback);
        };
        Cucumber.Util.asyncForEach(listeners, iterator, callback);
      }

      function onRuntimeListenersComplete() {
        var listeners = supportCodeLibrary.getListeners();
        broadcastToListeners(listeners, callback);
      }

      broadcastToListeners(listeners, onRuntimeListenersComplete);
    },

    setWorld: function setWorld(newWorld) {
      world = newWorld;
    },

    getWorld: function getWorld() {
      return world;
    },

    getDefaultTimeout: function getDefaultTimeout() {
      return supportCodeLibrary.getDefaultTimeout();
    },

    getScenarioStatus: function getScenarioStatus() {
      return scenarioResult.getStatus();
    },

    getScenarioFailureException: function getScenarioFailureException() {
      return scenarioResult.getFailureException();
    },

    attach: function attach(data, mimeType) {
      attachments.push(Cucumber.Runtime.Attachment({mimeType: mimeType, data: data}));
    },

    getAttachments: function getAttachments() {
      return attachments;
    },

    witnessHook: function witnessHook() {
      attachments = [];
    },

    witnessNewStep: function witnessNewStep() {
      attachments = [];
    },

    witnessNewScenario: function witnessNewScenario(scenario) {
      apiScenario    = Cucumber.Api.Scenario(self, scenario);
      scenarioResult = Cucumber.Runtime.ScenarioResult(scenario);
      beforeSteps.clear();
      afterSteps.clear();
    },

    getScenario: function getScenario() {
      return apiScenario;
    },

    isSkippingSteps: function isSkippingSteps() {
      return self.getScenarioStatus() !== Cucumber.Status.PASSED;
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

    executeHookStep: function executeHook(hookStep, callback) {
      var stepDefinition = hookStep.getHook();
      self.executeStep(hookStep, stepDefinition, callback);
    },

    executeStep: function executeStep(step, stepDefinition, callback) {
      var world          = self.getWorld();
      var scenario       = self.getScenario();
      var defaultTimeout = self.getDefaultTimeout();
      stepDefinition.invoke(step, world, scenario, defaultTimeout, function (stepResult) {
        self.visitStepResult(stepResult, callback);
      });
    },

    skipAmbiguousStep: function skipAmbiguousStep(step, stepDefinitions, callback) {
      var ambiguousStepResult = Cucumber.Runtime.StepResult({
        ambiguousStepDefinitions: stepDefinitions,
        step: step,
        status: Cucumber.Status.AMBIGUOUS
      });
      self.visitStepResult(ambiguousStepResult, callback);
    },

    skipStep: function skipStep(step, stepDefinition, callback) {
      var skippedStepResult = Cucumber.Runtime.StepResult({
        step: step,
        stepDefinition: stepDefinition,
        status: Cucumber.Status.SKIPPED
      });
      self.visitStepResult(skippedStepResult, callback);
    },

    skipUndefinedStep: function skipUndefinedStep(step, callback) {
      var undefinedStepResult = Cucumber.Runtime.StepResult({step: step, status: Cucumber.Status.UNDEFINED});
      self.visitStepResult(undefinedStepResult, callback);
    }
  };
  return self;
}

AstTreeWalker.FEATURES_EVENT_NAME                 = 'Features';
AstTreeWalker.FEATURES_RESULT_EVENT_NAME          = 'FeaturesResult';
AstTreeWalker.FEATURE_EVENT_NAME                  = 'Feature';
AstTreeWalker.BACKGROUND_EVENT_NAME               = 'Background';
AstTreeWalker.SCENARIO_EVENT_NAME                 = 'Scenario';
AstTreeWalker.SCENARIO_RESULT_EVENT_NAME          = 'ScenarioResult';
AstTreeWalker.STEP_EVENT_NAME                     = 'Step';
AstTreeWalker.STEP_RESULT_EVENT_NAME              = 'StepResult';
AstTreeWalker.ROW_EVENT_NAME                      = 'ExampleRow';
AstTreeWalker.BEFORE_EVENT_NAME_PREFIX            = 'Before';
AstTreeWalker.AFTER_EVENT_NAME_PREFIX             = 'After';
AstTreeWalker.NON_EVENT_LEADING_PARAMETERS_COUNT  = 0;
AstTreeWalker.NON_EVENT_TRAILING_PARAMETERS_COUNT = 2;
AstTreeWalker.BEFORE_STEP_KEYWORD                 = 'Before ';
AstTreeWalker.AFTER_STEP_KEYWORD                  = 'After ';
AstTreeWalker.Event                               = require('./ast_tree_walker/event');

module.exports = AstTreeWalker;
