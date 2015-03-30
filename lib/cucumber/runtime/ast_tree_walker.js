// vim: noai:ts=2:sw=2
var domain = require('domain');

function AstTreeWalker(features, supportCodeLibrary, listeners, strictMode) {
  var Cucumber = require('../../cucumber');

  var world;
  var allFeaturesSucceeded = true;
  var emptyHook = Cucumber.SupportCode.Hook(function (callback) { callback(); }, {});
  var beforeSteps = Cucumber.Type.Collection();
  var afterSteps = Cucumber.Type.Collection();
  var attachments = Cucumber.Type.Collection();
  var apiScenario, scenarioSuccessful, scenarioFailed, scenarioPending, scenarioUndefined;
  var walkDomain = domain.create();
  walkDomain.id = 'domain-' + Date.now();

  var deferredSteps = Cucumber.Type.Collection();

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
      self.broadcastEventAroundUserFunction (
        event,
        function (cb) { features.acceptVisitor(self, function() {

          if (deferredSteps){
            deferredSteps.forEach(function(scen, icb) {
              console.log("Deferred");
              scen.compiledScenarioActions(icb);
            }, cb, false);
          }
        }); 
        },
        callback
      );
    },

    visitFeature: function visitFeature(feature, callback) {
      var payload = { feature: feature };
      var event   = AstTreeWalker.Event(AstTreeWalker.FEATURE_EVENT_NAME, payload);
      self.broadcastEventAroundUserFunction (
        event,
        function (callback) { feature.acceptVisitor(self, function(deferred) {
          if (deferred) deferredSteps.concat(deferred); // If a step was deferred, add it to our list
          callback();
        }); },
        callback
      );
    },

    visitBackground: function visitBackground(background, callback) {
 	    var payload = { background: background };
 	    var event = AstTreeWalker.Event(AstTreeWalker.BACKGROUND_EVENT_NAME, payload);
 	    self.broadcastEvent(event, callback);
 	  },

    visitScenario: function visitScenario(scenario, callback, allowDefer) {
      supportCodeLibrary.instantiateNewWorld(function (world) {
        // build world and generate entire list of steps (including background and before/after)
        self.setWorld(world);
        self.witnessNewScenario(scenario);
        self.createBeforeAndAfterStepsForAroundHooks(scenario);
        self.createBeforeStepsForBeforeHooks(scenario);
        self.createAfterStepsForAfterHooks(scenario);

        // the steps to run this scenario
        var scenarioActions = function(callback) {
          var payload = { scenario: scenario };
          var event = AstTreeWalker.Event(AstTreeWalker.SCENARIO_EVENT_NAME, payload);
          self.broadcastEventAroundUserFunction (
            event,
            function (cb2) {
              self.visitBeforeSteps(function () {
                scenario.acceptVisitor(self, function () {
                  self.visitAfterSteps(cb2);
                });
              });
            },
            callback
          );
        }

        // Check for any deferred steps
        if (allowDefer) {
          var shouldDefer = false;
          var tags = scenario.getTags();
          var tagNames = tags.map(function(t){return t.getName();});

          beforeSteps.syncForEach(function(step){
            var def = step.getStepDefinition(self);
            if (!def) { console.log("?"); return; }
            shouldDefer = shouldDefer || def.shouldDefer();
          });
          scenario.getSteps().syncForEach(function(step){
            var def = supportCodeLibrary.lookupStepDefinitionByName(step.getName(), tagNames);
            if (!def) { console.log("?"); return; }
            shouldDefer = shouldDefer || def.shouldDefer();
          });
          if (scenario.getBackground()) scenario.getBackground().getSteps().syncForEach(function(step){
            var def = supportCodeLibrary.lookupStepDefinitionByName(step.getName(), tagNames);
            if (!def) { console.log("?"); return; }
            shouldDefer = shouldDefer || def.shouldDefer();
          });
          afterSteps.syncForEach(function(step){
            var def = step.getStepDefinition(self);
            if (!def) { console.log("?"); return; }
            shouldDefer = shouldDefer || def.shouldDefer();
          });
          if (shouldDefer) {
            scenario.compiledScenarioActions = scenarioActions;
            console.log("  Scenario deferred: "+scenario.getName());
            return callback(true);
          }
        }

        // If not deferring, run all the steps
        scenarioActions(callback);
      });
    },

    createBeforeAndAfterStepsForAroundHooks: function createBeforeAndAfterStepsForAroundHooks(scenario) {
      var aroundHooks = supportCodeLibrary.lookupAroundHooksByScenario(scenario);
      aroundHooks.syncForEach(function (aroundHook) {
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
      beforeHooks.syncForEach(function (beforeHook) {
        var beforeStep = Cucumber.Ast.HookStep(AstTreeWalker.BEFORE_STEP_KEYWORD);
        beforeStep.setHook(beforeHook);
        beforeSteps.add(beforeStep);
      });
    },

    createAfterStepsForAfterHooks: function createAfterStepsForAfterHooks(scenario) {
      var afterHooks = supportCodeLibrary.lookupAfterHooksByScenario(scenario);
      afterHooks.syncForEach(function (afterHook) {
        var afterStep = Cucumber.Ast.HookStep(AstTreeWalker.AFTER_STEP_KEYWORD);
        afterStep.setHook(afterHook);
        afterSteps.unshift(afterStep);
      });
    },

    visitBeforeSteps: function visitBeforeSteps(callback) {
      beforeSteps.forEach(function (beforeStep, callback) {
        self.witnessHook();
        beforeStep.acceptVisitor(self, callback);
      }, callback);
    },

    visitAfterSteps: function visitAfterSteps(callback) {
      afterSteps.forEach(function (afterStep, callback) {
        self.witnessHook();
        afterStep.acceptVisitor(self, callback);
      }, callback);
    },

    visitStep: function visitStep(step, callback, tagNames) {
      step.setTags(tagNames);

      self.witnessNewStep();
      var payload = { step: step };
      var event   = AstTreeWalker.Event(AstTreeWalker.STEP_EVENT_NAME, payload);
      self.broadcastEventAroundUserFunction (
        event,
        function(callback) {
          self.processStep(step, callback, tagNames);
        },
        callback
      );
    },

    visitStepResult: function visitStepResult(stepResult, callback) {
      if (stepResult.isFailed())
        self.witnessFailedStep();
      else if (stepResult.isPending())
        self.witnessPendingStep();
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
        listeners.forEach(
          function (listener, callback) { listener.hear(event, callback); },
          callback
        );
      }

      broadcastToListeners(listeners, onRuntimeListenersComplete);
    },

    lookupStepDefinitionByName: function lookupStepDefinitionByName(stepName, tagNames) {
      return supportCodeLibrary.lookupStepDefinitionByName(stepName, tagNames);
    },

    setWorld: function setWorld(newWorld) {
      world = newWorld;
    },

    getWorld: function getWorld() {
      return world;
    },

    isStepUndefined: function isStepUndefined(step, tagNames) {
      var stepName = step.getName();
      return !supportCodeLibrary.isStepDefinitionNameDefined(stepName, tagNames);
    },

    didAllFeaturesSucceed: function didAllFeaturesSucceed() {
      return allFeaturesSucceeded;
    },

    isScenarioSuccessful: function isScenarioSuccessful() {
      return scenarioSuccessful;
    },

    isScenarioFailed: function isScenarioFailed() {
      return scenarioFailed;
    },

    isScenarioPending: function isScenarioPending() {
      return scenarioPending;
    },

    isScenarioUndefined: function isScenarioUndefined() {
      return scenarioUndefined;
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

    witnessFailedStep: function witnessFailedStep() {
      allFeaturesSucceeded = false;
      scenarioSuccessful  = false;
      scenarioFailed      = true;
    },

    witnessPendingStep: function witnessPendingStep() {
      if (strictMode) {
        allFeaturesSucceeded = false;
      }
      scenarioSuccessful = false;
      scenarioPending    = true;
    },

    witnessUndefinedStep: function witnessUndefinedStep() {
      if (strictMode) {
        allFeaturesSucceeded = false;
      }
      scenarioSuccessful = false;
      scenarioUndefined  = true;
    },

    witnessNewScenario: function witnessNewScenario(scenario) {
      apiScenario        = Cucumber.Api.Scenario(self, scenario);
      scenarioSuccessful = true;
      scenarioFailed     = false;
      scenarioPending    = false;
      scenarioUndefined  = false;
      beforeSteps.clear();
      afterSteps.clear();
    },

    getScenario: function getScenario() {
      return apiScenario;
    },

    getDomain: function getDomain() {
      return walkDomain;
    },

    isSkippingSteps: function isSkippingSteps() {
      return !scenarioSuccessful;
    },

    processStep: function processStep(step, callback, tagNames) {
      if (self.isStepUndefined(step, tagNames)) {
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
      var skippedStepResult = Cucumber.Runtime.SkippedStepResult({step: step});
      var payload           = { stepResult: skippedStepResult };
      var event             = AstTreeWalker.Event(AstTreeWalker.STEP_RESULT_EVENT_NAME, payload);
      self.broadcastEvent(event, callback);
    },

    skipUndefinedStep: function skipUndefinedStep(step, callback) {
      var undefinedStepResult = Cucumber.Runtime.UndefinedStepResult({step: step});
      
      var alternate = self.findTagToIncludeStep(step.getName()); // is the step defined if we exclude source spec tags?
      if (alternate) {
        undefinedStepResult.AlternateSource = alternate;
      }
      
      var payload = { stepResult: undefinedStepResult };
      var event   = AstTreeWalker.Event(AstTreeWalker.STEP_RESULT_EVENT_NAME, payload);
      self.broadcastEvent(event, callback);
    },

    findTagToIncludeStep : function findTagToIncludeStep(stepName) {
      if (!supportCodeLibrary) return undefined;
      var alternate = supportCodeLibrary.lookupStepDefinitionByName(stepName, []);
      if (!alternate) return undefined;

      var uri = alternate.getUri();
      var idx = Math.max(uri.lastIndexOf('\\'), uri.lastIndexOf('/'));
      uri = uri.slice(idx+1, -3); // just the filename, no path or extension
      return '@:'+uri;
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
