var TreeWalker = function(features, supportCodeLibrary, listeners) {
  var listeners;
  var allFeaturesSucceded = true;
  var skippingSteps       = false;

  var self = {
    walk: function walk(callback) {
      self.visitFeatures(features, function() {
        var featuresResult = self.didAllFeaturesSucceed();
        callback(featuresResult);
      });
    },

    visitFeatures: function visitFeatures(features, callback) {
      var event = TreeWalker.Event(TreeWalker.FEATURES_EVENT_NAME);
      self.broadcastEventAroundUserFunction(
        event,
        function(callback) { features.acceptVisitor(self, callback); },
        callback
      );
    },

    visitFeature: function visitFeature(feature, callback) {
      var payload = { feature: feature };
      var event   = TreeWalker.Event(TreeWalker.FEATURE_EVENT_NAME, payload);
      self.broadcastEventAroundUserFunction(
        event,
        function(callback) { feature.acceptVisitor(self, callback); },
        callback
      );
    },

    visitScenario: function visitScenario(scenario, callback) {
      self.witnessNewScenario();
      var payload = { scenario: scenario };
      var event   = TreeWalker.Event(TreeWalker.SCENARIO_EVENT_NAME, payload);
      self.broadcastEventAroundUserFunction(
        event,
        function(callback) { scenario.acceptVisitor(self, callback); },
        callback
      );
    },

    visitStep: function visitStep(step, callback) {
      if (self.isStepUndefined(step)) {
        self.witnessUndefinedStep();
        self.skipUndefinedStep(step, callback);
      } else if (self.isSkippingSteps()) {
        self.skipStep(step, callback);
      } else {
        self.executeStep(step, callback);
      }
    },

    visitStepResult: function visitStepResult(stepResult, callback) {
      if (stepResult.isFailed())
        self.witnessFailedStep();
      else if (stepResult.isPending())
        self.witnessPendingStep();
      var payload = { stepResult: stepResult };
      var event   = TreeWalker.Event(TreeWalker.STEP_RESULT_EVENT_NAME, payload);
      self.broadcastEvent(event, callback);
    },

    broadcastEventAroundUserFunction: function broadcastEventAroundUserFunction(event, userFunction, callback) {
      var userFunctionWrapper = self.wrapUserFunctionAndAfterEventBroadcast(userFunction, event, callback);
      self.broadcastBeforeEvent(event, userFunctionWrapper);
    },

    wrapUserFunctionAndAfterEventBroadcast: function wrapUserFunctionAndAfterEventBroadcast(userFunction, event, callback) {
      var callAfterEventBroadcast = self.wrapAfterEventBroadcast(event, callback);
      return function callUserFunctionAndBroadcastAfterEvent() {
        userFunction(callAfterEventBroadcast);
      };
    },

    wrapAfterEventBroadcast: function wrapAfterEventBroadcast(event, callback) {
      return function() { self.broadcastAfterEvent(event, callback); };
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
      listeners.forEach(
        function(listener, callback) { listener.hear(event, callback); },
        callback
      );
    },

    lookupStepDefinitionByName: function lookupStepDefinitionByName(stepName) {
      return supportCodeLibrary.lookupStepDefinitionByName(stepName);
    },

    isStepUndefined: function isStepUndefined(step) {
      var stepName = step.getName();
      return !supportCodeLibrary.isStepDefinitionNameDefined(stepName);
    },

    didAllFeaturesSucceed: function didAllFeaturesSucceed() {
      return allFeaturesSucceded;
    },

    witnessFailedStep: function witnessFailedStep() {
      allFeaturesSucceded = false;
      skippingSteps       = true;
    },

    witnessPendingStep: function witnessPendingStep() {
      skippingSteps = true;
    },

    witnessUndefinedStep: function witnessUndefinedStep() {
      skippingSteps = true;
    },

    witnessNewScenario: function witnessNewScenario() {
      skippingSteps = false;
    },

    isSkippingSteps: function isSkippingSteps() {
      return skippingSteps;
    },

    executeStep: function executeStep(step, callback) {
      var payload = { step: step };
      var event   = TreeWalker.Event(TreeWalker.STEP_EVENT_NAME, payload);
      self.broadcastEventAroundUserFunction(
        event,
        function(callback) { step.acceptVisitor(self, callback); },
        callback
      );
    },

    skipStep: function skipStep(step, callback) {
      var payload = { step: step };
      var event   = TreeWalker.Event(TreeWalker.SKIPPED_STEP_EVENT_NAME, payload);
      self.broadcastEvent(event, callback);
    },

    skipUndefinedStep: function skipUndefinedStep(step, callback) {
      var payload = { step: step };
      var event   = TreeWalker.Event(TreeWalker.UNDEFINED_STEP_EVENT_NAME, payload);
      self.broadcastEvent(event, callback);
    }
  };
  return self;
};
TreeWalker.FEATURES_EVENT_NAME                 = 'Features';
TreeWalker.FEATURE_EVENT_NAME                  = 'Feature';
TreeWalker.SCENARIO_EVENT_NAME                 = 'Scenario';
TreeWalker.STEP_EVENT_NAME                     = 'Step';
TreeWalker.UNDEFINED_STEP_EVENT_NAME           = 'UndefinedStep';
TreeWalker.SKIPPED_STEP_EVENT_NAME             = 'SkippedStep';
TreeWalker.STEP_RESULT_EVENT_NAME              = 'StepResult';
TreeWalker.BEFORE_EVENT_NAME_PREFIX            = 'Before';
TreeWalker.AFTER_EVENT_NAME_PREFIX             = 'After';
TreeWalker.NON_EVENT_LEADING_PARAMETERS_COUNT  = 0;
TreeWalker.NON_EVENT_TRAILING_PARAMETERS_COUNT = 2;
TreeWalker.Event                               = require('./tree_walker/event');
module.exports                                 = TreeWalker;
