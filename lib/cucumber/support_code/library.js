// vim: noai:ts=2:sw=2
function Library(supportCodeDefinition) {
  var Cucumber = require('../../cucumber');

  var listeners        = Cucumber.Type.Collection();
  var stepDefinitions  = Cucumber.Type.Collection();
  var aroundHooks      = Cucumber.Type.Collection();
  var beforeHooks      = Cucumber.Type.Collection();
  var afterHooks       = Cucumber.Type.Collection();
  var WorldConstructor = Cucumber.SupportCode.WorldConstructor();

  function appendEventHandlers(supportCodeHelper, library) {
    var Cucumber = require('../../cucumber');
    var events = Cucumber.Listener.Events;
    var eventName;

    for (eventName in events) {
      if (events.hasOwnProperty(eventName)) {
        supportCodeHelper[eventName] = createEventListenerMethod(library, eventName);
      }
    }
  }

  function createEventListenerMethod(library, eventName) {
    return function (handler) {
      library.registerHandler(eventName, handler);
    };
  }

  var self = {
    lookupAroundHooksByScenario: function lookupBeforeHooksByScenario(scenario) {
      return self.lookupHooksByScenario(aroundHooks, scenario);
    },

    lookupBeforeHooksByScenario: function lookupBeforeHooksByScenario(scenario) {
      return self.lookupHooksByScenario(beforeHooks, scenario);
    },

    lookupAfterHooksByScenario: function lookupBeforeHooksByScenario(scenario) {
      return self.lookupHooksByScenario(afterHooks, scenario);
    },

    lookupHooksByScenario: function lookupHooksByScenario(hooks, scenario) {
      var matchingHooks = Cucumber.Type.Collection();
      hooks.syncForEach(function (hook) {
        if (hook.appliesToScenario(scenario)) {
          matchingHooks.add(hook);
        }
      });
      return matchingHooks;
    },

    lookupStepDefinitionByName: function lookupStepDefinitionByName(name, tagNames) {
      var matches = [];
      stepDefinitions.syncForEach(function(stepDefinition) {
        if (stepDefinition.matchesStepName(name, tagNames)) {
          matches.push(stepDefinition);
        }
      });
      if (matches.length > 1) throw new Error('More than one step matches "'+name+'":\n\t'+(matches.map(function(s){return s.getUri();}).join('\n\t')) );
      return matches.pop();
    },

    unusedSteps: function unusedSteps() {
      var matches = [];
      stepDefinitions.syncForEach(function(step){
        if (step.invocationCount < 1) matches.push(step);
      });
      return matches;
    },

    isStepDefinitionNameDefined: function isStepDefinitionNameDefined(name, tagNames) {
      var stepDefinition = self.lookupStepDefinitionByName(name, tagNames);
      return (stepDefinition !== undefined);
    },

    defineAroundHook: function defineAroundHook() {
      var tagGroupStrings = Cucumber.Util.Arguments(arguments);
      var code            = tagGroupStrings.pop();
      var hook            = Cucumber.SupportCode.AroundHook(code, {tags: tagGroupStrings});
      aroundHooks.add(hook);
    },

    defineBeforeHook: function defineBeforeHook() {
      var tagGroupStrings = Cucumber.Util.Arguments(arguments);
      var code            = tagGroupStrings.pop();
      var hook            = Cucumber.SupportCode.Hook(code, {tags: tagGroupStrings});
      beforeHooks.add(hook);
    },

    defineAfterHook: function defineAfterHook() {
      var tagGroupStrings = Cucumber.Util.Arguments(arguments);
      var code            = tagGroupStrings.pop();
      var hook            = Cucumber.SupportCode.Hook(code, {tags: tagGroupStrings});
      afterHooks.add(hook);
    },


    // TODO: stop passing the path and type through globals!
    defineStep: function defineStep(name, code) {
      var stepDefinition = Cucumber.SupportCode.StepDefinition(name, code, global.CUKE_LAST_CODE_PATH, global.CUKE_SUPPORT_CODE_TYPE, false);
      stepDefinitions.add(stepDefinition);
    },

    defineStepDeferred: function defineStep(name, code) {
      var stepDefinition = Cucumber.SupportCode.StepDefinition(name, code, global.CUKE_LAST_CODE_PATH, global.CUKE_SUPPORT_CODE_TYPE, true);
      stepDefinitions.add(stepDefinition);
    },


    registerListener: function registerListener(listener) {
      listeners.add(listener);
    },

    registerHandler: function registerHandler(eventName, handler) {
      var listener = Cucumber.Listener();
      listener.setHandlerForEvent(eventName, handler);
      self.registerListener(listener);
    },

    getListeners: function getListeners() {
      return listeners;
    },

    instantiateNewWorld: function instantiateNewWorld(callback) {
      var world = new WorldConstructor(function (explicitWorld) {
        setImmediate(function () { // release the constructor
          callback(explicitWorld || world);
        });
      });
    }
  };

  var supportCodeHelper = {
    Around           : self.defineAroundHook,
    Before           : self.defineBeforeHook,
    After            : self.defineAfterHook,
    Given            : self.defineStep,
    When             : self.defineStep,
    Then             : self.defineStep,
    defineStep       : self.defineStep,
    deferredStep     : self.defineStepDeferred,
    registerListener : self.registerListener,
    registerHandler  : self.registerHandler,
    World            : WorldConstructor
  };

  appendEventHandlers(supportCodeHelper, self);
  supportCodeDefinition.call(supportCodeHelper);
  WorldConstructor = supportCodeHelper.World;

  return self;
}

module.exports = Library;
