var domain = require('domain');

function AstTreeWalker(features, supportCodeLibrary, listeners, options) {
  var Cucumber = require('../../cucumber');

  var world;
  var allFeaturesSucceeded = true;
  var emptyHook = Cucumber.SupportCode.Hook(function (callback) { callback(); }, {});
  var beforeSteps = Cucumber.Type.Collection();
  var afterSteps = Cucumber.Type.Collection();
  var attachments = Cucumber.Type.Collection();
  var apiScenario, scenarioResult;
  var walkDomain = domain.create();
  walkDomain.id = 'domain-' + Date.now();

  var self = {
    walk: function walk(callback) {
      if (walkDomain.enter)
        walkDomain.enter();
      self.visitFeatures(features, function () {
        if (walkDomain.exit)
          walkDomain.exit();
        var featuresResult = self.didAllFeaturesSucceed();
        callback(featuresResult);
      });
    },

    visitFeatures: function visitFeatures(features, callback) {
      var payload = { features: features };
      var event   = AstTreeWalker.Event(AstTreeWalker.FEATURES_EVENT_NAME, payload);
      self.broadcastEventAroundUserFunction(
        event,
        function (callback) { features.acceptVisitor(self, callback); },
        callback
      );
    },

    visitFeature: function visitFeature(feature, callback) {
      if (!allFeaturesSucceeded && options.failFast) {
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
      if (!allFeaturesSucceeded && options.failFast) {
        return callback();
      }
      supportCodeLibrary.instantiateNewWorld(function (world) {
        self.setWorld(world);
        self.witnessNewScenario(scenario);
        self.createBeforeAndAfterStepsForAroundHooks(scenario);
        self.createBeforeStepsForBeforeHooks(scenario);
        self.createAfterStepsForAfterHooks(scenario);
        var payload = { scenario: scenario };
        var event = AstTreeWalker.Event(AstTreeWalker.SCENARIO_EVENT_NAME, payload);
        self.broadcastEventAroundUserFunction (
          event,
          function (callback) {
            self.visitBeforeSteps(function () {
              scenario.acceptVisitor(self, function () {
                self.visitAfterSteps(callback);
              });
            });
          },
          callback
        );
      });
    },

    createBeforeAndAfterStepsForAroundHooks: function createBeforeAndAfterStepsForAroundHooks(scenario) {
      var aroundHooks = supportCodeLibrary.lookupAroundHooksByScenario(scenario);
      aroundHooks.forEach(function (aroundHook) {
        var beforeStep = Cucumber.Ast.HookStep(AstTreeWalker.AROUND_STEP_KEYWORD);
        beforeStep.setHook(aroundHook);
        beforeSteps.add(beforeStep);
        var afterStep = Cucumber.Ast.HookStep(AstTreeWalker.AROUND_STEP_KEYWORD);
        afterStep.setHook(emptyHook);
        afterSteps.unshift(afterStep);
        aroundHook.setAfterStep(afterStep);
      });
    },

    createBeforeStepsForBeforeHooks: function createBeforeStepsForBeforeHooks(scenario) {
      var beforeHooks = supportCodeLibrary.lookupBeforeHooksByScenario(scenario);
      beforeHooks.forEach(function (beforeHook) {
        var beforeStep = Cucumber.Ast.HookStep(AstTreeWalker.BEFORE_STEP_KEYWORD);
        beforeStep.setHook(beforeHook);
        beforeSteps.add(beforeStep);
      });
    },

    createAfterStepsForAfterHooks: function createAfterStepsForAfterHooks(scenario) {
      var afterHooks = supportCodeLibrary.lookupAfterHooksByScenario(scenario);
      afterHooks.forEach(function (afterHook) {
        var afterStep = Cucumber.Ast.HookStep(AstTreeWalker.AFTER_STEP_KEYWORD);
        afterStep.setHook(afterHook);
        afterSteps.unshift(afterStep);
      });
    },

    visitBeforeSteps: function visitBeforeSteps(callback) {
      beforeSteps.asyncForEach(function (beforeStep, callback) {
        self.witnessHook();
        beforeStep.acceptVisitor(self, callback);
      }, callback);
    },

    visitAfterSteps: function visitAfterSteps(callback) {
      afterSteps.asyncForEach(function (afterStep, callback) {
        self.witnessHook();
        afterStep.acceptVisitor(self, callback);
      }, callback);
    },

    visitStep: function visitStep(step, callback) {
      self.witnessNewStep();
      var payload = { step: step };
      var event   = AstTreeWalker.Event(AstTreeWalker.STEP_EVENT_NAME, payload);
      self.broadcastEventAroundUserFunction (
        event,
        function (callback) {
          self.processStep(step, callback);
        },
        callback
      );
    },

    visitStepResult: function visitStepResult(stepResult, callback) {
      scenarioResult.witnessStepResult(stepResult);
      var status = stepResult.getStatus();
      if (status === Cucumber.Status.FAILED || (options.strict && (status === Cucumber.Status.PENDING))) {
        allFeaturesSucceeded = false;
      }
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
      function onRuntimeListenersComplete() {
        var listeners = supportCodeLibrary.getListeners();
        broadcastToListeners(listeners, callback);
      }

      function broadcastToListeners(listeners, callback) {
        listeners.asyncForEach(
          function (listener, callback) { listener.hear(event, callback); },
          callback
        );
      }

      broadcastToListeners(listeners, onRuntimeListenersComplete);
    },

    lookupStepDefinitionByName: function lookupStepDefinitionByName(stepName) {
      return supportCodeLibrary.lookupStepDefinitionByName(stepName);
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

    isStepUndefined: function isStepUndefined(step) {
      var stepName = step.getName();
      return !supportCodeLibrary.isStepDefinitionNameDefined(stepName);
    },

    didAllFeaturesSucceed: function didAllFeaturesSucceed() {
      return allFeaturesSucceeded;
    },

    getScenarioStatus: function getScenarioStatus() {
      return scenarioResult.getStatus();
    },

    getScenarioFailureException: function getScenarioFailureException() {
      return scenarioResult.getFailureException();
    },

    attach: function attach(data, mimeType) {
      attachments.add(Cucumber.Runtime.Attachment({mimeType: mimeType, data: data}));
    },

    getAttachments: function getAttachments() {
      return attachments;
    },

    witnessHook: function witnessHook() {
      attachments.clear();
    },

    witnessNewStep: function witnessNewStep() {
      attachments.clear();
    },

    witnessUndefinedStep: function witnessUndefinedStep() {
      if (options.strict) {
        allFeaturesSucceeded = false;
      }
      scenarioResult.witnessStepStatus(Cucumber.Status.UNDEFINED);
    },

    witnessSkippedStep: function witnessSkippedStep() {
      scenarioResult.witnessStepStatus(Cucumber.Status.SKIPPED);
    },

    witnessNewScenario: function witnessNewScenario(scenario) {
      apiScenario    = Cucumber.Api.Scenario(self, scenario);
      scenarioResult = Cucumber.Runtime.ScenarioResult();
      beforeSteps.clear();
      afterSteps.clear();
    },

    processDryRunStep: function processDryRunStep(step, callback) {
      if (options.strict && self.isStepUndefined(step)) {
        self.witnessUndefinedStep();
        self.skipUndefinedStep(step, callback);
      } else {
        self.witnessSkippedStep();
        self.skipStep(step, callback);
      }
    },

    getScenario: function getScenario() {
      return apiScenario;
    },

    getDomain: function getDomain() {
      return walkDomain;
    },

    isSkippingSteps: function isSkippingSteps() {
      return self.getScenarioStatus() !== Cucumber.Status.PASSED;
    },

    processStep: function processStep(step, callback) {
      if (options.dryRun) {
        self.processDryRunStep(step, callback);
      } else if (self.isStepUndefined(step)) {
        self.witnessUndefinedStep();
        self.skipUndefinedStep(step, callback);
      } else if (self.isSkippingSteps()) {
        self.skipStep(step, callback);
      } else {
        self.executeStep(step, callback);
      }
    },

    executeStep: function executeStep(step, callback) {
      step.acceptVisitor(self, callback);
    },

    skipStep: function skipStep(step, callback) {
      var skippedStepResult = Cucumber.Runtime.StepResult({step: step, status: Cucumber.Status.SKIPPED});
      var payload           = { stepResult: skippedStepResult };
      var event             = AstTreeWalker.Event(AstTreeWalker.STEP_RESULT_EVENT_NAME, payload);
      self.broadcastEvent(event, callback);
    },

    skipUndefinedStep: function skipUndefinedStep(step, callback) {
      var undefinedStepResult = Cucumber.Runtime.StepResult({step: step, status: Cucumber.Status.UNDEFINED});
      var payload = { stepResult: undefinedStepResult };
      var event   = AstTreeWalker.Event(AstTreeWalker.STEP_RESULT_EVENT_NAME, payload);
      self.broadcastEvent(event, callback);
    }
  };
  return self;
}

AstTreeWalker.FEATURES_EVENT_NAME                 = 'Features';
AstTreeWalker.FEATURE_EVENT_NAME                  = 'Feature';
AstTreeWalker.BACKGROUND_EVENT_NAME               = 'Background';
AstTreeWalker.SCENARIO_EVENT_NAME                 = 'Scenario';
AstTreeWalker.STEP_EVENT_NAME                     = 'Step';
AstTreeWalker.STEP_RESULT_EVENT_NAME              = 'StepResult';
AstTreeWalker.ROW_EVENT_NAME                      = 'ExampleRow';
AstTreeWalker.BEFORE_EVENT_NAME_PREFIX            = 'Before';
AstTreeWalker.AFTER_EVENT_NAME_PREFIX             = 'After';
AstTreeWalker.NON_EVENT_LEADING_PARAMETERS_COUNT  = 0;
AstTreeWalker.NON_EVENT_TRAILING_PARAMETERS_COUNT = 2;
AstTreeWalker.AROUND_STEP_KEYWORD                 = 'Around ';
AstTreeWalker.BEFORE_STEP_KEYWORD                 = 'Before ';
AstTreeWalker.AFTER_STEP_KEYWORD                  = 'After ';
AstTreeWalker.Event                               = require('./ast_tree_walker/event');

module.exports = AstTreeWalker;
