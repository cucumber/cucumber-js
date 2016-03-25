function Library(supportCodeDefinition) {
  var Cucumber = require('../../cucumber');
  var callsite = require('callsite');

  var listeners        = [];
  var stepDefinitions  = [];
  var beforeHooks      = [];
  var afterHooks       = [];
  var World            = function World() {};
  var defaultTimeout   = 5 * 1000;

  function createEventListenerMethod(library, eventName) {
    return function (handler) {
      library.registerHandler(eventName, handler);
    };
  }

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

  var self = {
    lookupBeforeHooksByScenario: function lookupBeforeHooksByScenario(scenario) {
      return self.lookupHooksByScenario(beforeHooks, scenario);
    },

    lookupAfterHooksByScenario: function lookupBeforeHooksByScenario(scenario) {
      return self.lookupHooksByScenario(afterHooks, scenario);
    },

    lookupHooksByScenario: function lookupHooksByScenario(hooks, scenario) {
      return hooks.filter(function (hook) {
        return hook.appliesToScenario(scenario);
      });
    },

    lookupStepDefinitionsByName: function lookupStepDefinitionsByName(name) {
      return stepDefinitions.filter(function (stepDefinition) {
        return stepDefinition.matchesStepName(name);
      });
    },

    defineHook: function defineHook(builder, collection) {
      return function(options, code) {
        if (typeof(options) === 'function') {
          code = options;
          options = {};
        }
        var site = callsite();
        var line = site[1].getLineNumber();
        var uri = site[1].getFileName();
        var hook = builder(code, options, uri, line);
        collection.push(hook);
      };
    },

    defineStep: function defineStep(name, options, code) {
      if (typeof(options) === 'function') {
        code = options;
        options = {};
      }
      var site = callsite();
      var line = site[1].getLineNumber();
      var uri = site[1].getFileName();
      var stepDefinition = Cucumber.SupportCode.StepDefinition(name, options, code, uri, line);
      stepDefinitions.push(stepDefinition);
    },

    registerListener: function registerListener(listener) {
      listeners.push(listener);
    },

    registerHandler: function registerHandler(eventName, handler) {
      var listener = Cucumber.Listener();
      listener.setHandlerForEvent(eventName, handler);
      self.registerListener(listener);
    },

    getListeners: function getListeners() {
      return listeners;
    },

    instantiateNewWorld: function instantiateNewWorld() {
      return new World();
    },

    getDefaultTimeout: function getDefaultTimeout() {
      return defaultTimeout;
    },

    setDefaultTimeout: function setDefaultTimeout(milliseconds) {
      defaultTimeout = milliseconds;
    }
  };

  var supportCodeHelper = {
    Before            : self.defineHook(Cucumber.SupportCode.Hook, beforeHooks),
    After             : self.defineHook(Cucumber.SupportCode.Hook, afterHooks),
    Given             : self.defineStep,
    When              : self.defineStep,
    Then              : self.defineStep,
    defineStep        : self.defineStep,
    registerListener  : self.registerListener,
    registerHandler   : self.registerHandler,
    setDefaultTimeout : self.setDefaultTimeout,
    World             : World
  };

  appendEventHandlers(supportCodeHelper, self);
  supportCodeDefinition.call(supportCodeHelper);
  World = supportCodeHelper.World;

  return self;
}

module.exports = Library;
