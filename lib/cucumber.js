if (typeof(require) == 'function') {
  var Gherkin = require('gherkin');
};

var Cucumber = function(featuresSource, supportCodeDefinition) {
  var listeners = Cucumber.Types.Collection();

  var self = {
    start: function start(callback) {
      if (typeof(callback) !== 'function')
        throw Cucumber.START_MISSING_CALLBACK_ERROR;
      var features           = self.parseFeaturesSource(featuresSource);
      var supportCodeLibrary = self.initializeSupportCode(supportCodeDefinition);
      self.executeFeaturesAgainstSupportCodeLibrary(features, supportCodeLibrary, callback);
    },

    attachListener: function attachListener(listener) {
      listeners.add(listener);
    },

    parseFeaturesSource: function parseFeaturesSource(featuresSource) {
      var parser = Cucumber.Parser(featuresSource);
      return parser.parse();
    },

    initializeSupportCode: function initializeSupportCode(supportCodeDefinition) {
      var supportCodeLibrary = Cucumber.SupportCode.Library(supportCodeDefinition);
      return supportCodeLibrary;
    },

    executeFeaturesAgainstSupportCodeLibrary: function executeFeaturesAgainstSupportCodeLibrary(features, supportCodeLibrary, callback) {
      var treeWalker = Cucumber.Ast.TreeWalker(features, supportCodeLibrary, listeners);
      treeWalker.walk(callback);
    }
  };
  return self;
};

Cucumber.START_MISSING_CALLBACK_ERROR = "Cucumber.start() expects a callback.";

Cucumber.Parser = function(featuresSource) {
  var features = Cucumber.Ast.Features();
  var self = {
    parse: function parse() {
      var Lexer = Gherkin.Lexer('en');
      var lexer = new Lexer(self.getEventHandlers());
      lexer.scan(featuresSource);
      return features;
    },

    getEventHandlers: function getEventHandlers() {
      return {
        feature:    self.handleFeature,
        scenario:   self.handleScenario,
        step:       self.handleStep,
        doc_string: self.handleDocString,
        eof:        self.handleEof
      };
    },

    getCurrentFeature: function getCurrentFeature() {
      return features.getLastFeature();
    },

    getCurrentScenario: function getCurrentScenario() {
      var currentFeature = self.getCurrentFeature();
      return currentFeature.getLastScenario();
    },

    getCurrentStep: function getCurrentStep() {
      var currentScenario = self.getCurrentScenario();
      return currentScenario.getLastStep();
    },

    handleFeature: function handleFeature(keyword, name, description, line) {
      var feature = Cucumber.Ast.Feature(keyword, name, description, line);
      features.addFeature(feature);
    },

    handleScenario: function handleScenario(keyword, name, description, line) {
      var scenario       = Cucumber.Ast.Scenario(keyword, name, description, line);
      var currentFeature = self.getCurrentFeature();
      currentFeature.addScenario(scenario);
    },

    handleStep: function handleStep(keyword, name, line) {
      var step            = Cucumber.Ast.Step(keyword, name, line);
      var currentScenario = self.getCurrentScenario();
      currentScenario.addStep(step);
    },

    handleDocString: function handleDocString(string, line) {
      var docString   = Cucumber.Ast.DocString(string, line);
      var currentStep = self.getCurrentStep();
      currentStep.attachDocString(docString);
    },

    handleEof: function handleEof() {}
  };
  return self;
};

Cucumber.Ast = {};

Cucumber.Ast.Features = function() {
  var features = Cucumber.Types.Collection();

  var self = {
    addFeature: function addFeature(feature) {
      features.add(feature);
    },

    getLastFeature: function getLastFeature() {
      return features.getLast();
    },

    acceptVisitor: function acceptVisitor(visitor, callback) {
      features.forEach(function(feature, iterate) {
        visitor.visitFeature(feature, iterate);
      }, callback);
    }
  };
  return self;
};

Cucumber.Ast.Feature = function(keyword, name, description, line) {
  var scenarios = Cucumber.Types.Collection();

  var self = {
    getKeyword: function getKeyword() {
      return keyword;
    },

    getName: function getName() {
      return name;
    },

    getDescription: function getDescription() {
      return description;
    },

    addScenario: function addScenario(scenario) {
      scenarios.add(scenario);
    },

    getLastScenario: function getLastScenario() {
      return scenarios.getLast();
    },

    acceptVisitor: function acceptVisitor(visitor, callback) {
      scenarios.forEach(function(scenario, iterate) {
        visitor.visitScenario(scenario, iterate);
      }, callback);
    }
  };
  return self;
};

Cucumber.Ast.Scenario = function(keyword, name) {
  var steps = Cucumber.Types.Collection();

  var self = {
    getKeyword: function getKeyword() {
      return keyword;
    },

    getName: function getName() {
      return name;
    },

    addStep: function addStep(step) {
      steps.add(step);
    },

    getLastStep: function getLastStep() {
      return steps.getLast();
    },

    acceptVisitor: function acceptVisitor(visitor, callback) {
      steps.forEach(function(step, iterate) {
        visitor.visitStep(step, iterate);
      }, callback);
    }
  };
  return self;
};

Cucumber.Ast.Step = function(keyword, name, line) {
  var docString;

  var self = {
    getKeyword: function getKeyword() {
      return keyword;
    },

    getName: function getName() {
      return name;
    },

    hasDocString: function hasDocString() {
      return !!docString;
    },

    getDocString: function getDocString() { return docString; },

    attachDocString: function attachDocString(_docString) { docString = _docString; },

    acceptVisitor: function acceptVisitor(visitor, callback) {
      self.execute(visitor, function(stepResult) {
        visitor.visitStepResult(stepResult, callback);
      });
    },

    execute: function execute(visitor, callback) {
      var stepDefinition = visitor.lookupStepDefinitionByName(name);
      stepDefinition.invoke(name, docString, callback);
    }
  };
  return self;
};

Cucumber.Ast.DocString = function(string, line) {
  var self = {
    getString: function getString() {
      return string;
    }
  };
  return self;
};

Cucumber.Ast.TreeWalker = function(features, supportCodeLibrary, listeners) {
  var listeners;

  var self = {
    walk: function walk(callback) {
      self.visitFeatures(features, callback);
    },

    visitFeatures: function visitFeatures(features, callback) {
      var event = Cucumber.Ast.TreeWalker.Event(Cucumber.Ast.TreeWalker.FEATURES_EVENT_NAME);
      self.broadcastEventAroundUserFunction(
        event,
        function(callback) { features.acceptVisitor(self, callback); },
        callback
      );
    },

    visitFeature: function visitFeature(feature, callback) {
      var payload = { feature: feature };
      var event   = Cucumber.Ast.TreeWalker.Event(Cucumber.Ast.TreeWalker.FEATURE_EVENT_NAME, payload);
      self.broadcastEventAroundUserFunction(
        event,
        function(callback) { feature.acceptVisitor(self, callback); },
        callback
      );
    },

    visitScenario: function visitScenario(scenario, callback) {
      var payload = { scenario: scenario };
      var event   = Cucumber.Ast.TreeWalker.Event(Cucumber.Ast.TreeWalker.SCENARIO_EVENT_NAME, payload);
      self.broadcastEventAroundUserFunction(
        event,
        function(callback) { scenario.acceptVisitor(self, callback); },
        callback
      );
    },

    visitStep: function visitStep(step, callback) {
      var payload = { step: step };
      var event   = Cucumber.Ast.TreeWalker.Event(Cucumber.Ast.TreeWalker.STEP_EVENT_NAME, payload);
      self.broadcastEventAroundUserFunction(
        event,
        function(callback) { step.acceptVisitor(self, callback); },
        callback
      );
    },

    visitStepResult: function visitStepResult(stepResult, callback) {
      var payload = { stepResult: stepResult };
      var event   = Cucumber.Ast.TreeWalker.Event(Cucumber.Ast.TreeWalker.STEP_RESULT_EVENT_NAME, payload);
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
    }
  };
  return self;
};

Cucumber.Ast.TreeWalker.FEATURES_EVENT_NAME                 = 'Features';
Cucumber.Ast.TreeWalker.FEATURE_EVENT_NAME                  = 'Feature';
Cucumber.Ast.TreeWalker.SCENARIO_EVENT_NAME                 = 'Scenario';
Cucumber.Ast.TreeWalker.STEP_EVENT_NAME                     = 'Step';
Cucumber.Ast.TreeWalker.STEP_RESULT_EVENT_NAME              = 'StepResult';
Cucumber.Ast.TreeWalker.BEFORE_EVENT_NAME_PREFIX            = 'Before';
Cucumber.Ast.TreeWalker.AFTER_EVENT_NAME_PREFIX             = 'After';
Cucumber.Ast.TreeWalker.NON_EVENT_LEADING_PARAMETERS_COUNT  = 0;
Cucumber.Ast.TreeWalker.NON_EVENT_TRAILING_PARAMETERS_COUNT = 2;

Cucumber.Ast.TreeWalker.Event = function(name, payload) {
  var self = {
    getName: function getName() {
      return name;
    },

    getPayloadItem: function getPayloadItem(itemName) {
      return payload[itemName];
    },

    replicateAsPreEvent: function replicateAsPreEvent() {
      var newName = buildBeforeEventName(name);
      return Cucumber.Ast.TreeWalker.Event(newName, payload);
    },

    replicateAsPostEvent: function replicateAsPostEvent() {
      var newName = buildAfterEventName(name);
      return Cucumber.Ast.TreeWalker.Event(newName, payload);
    },

    occuredOn: function occuredOn(eventName) {
      return eventName == name;
    },

    occuredAfter: function occuredAfter(eventName) {
      var afterEventName = buildAfterEventName(eventName);
      return afterEventName == name;
    }
  };

  function buildBeforeEventName(eventName) {
    return Cucumber.Ast.TreeWalker.BEFORE_EVENT_NAME_PREFIX + eventName;
  }

  function buildAfterEventName(eventName) {
    return Cucumber.Ast.TreeWalker.AFTER_EVENT_NAME_PREFIX + eventName;
  }

  return self;
};

Cucumber.SupportCode = {};

Cucumber.SupportCode.Library = function(supportCodeDefinition) {
  var stepDefinitions = Cucumber.Types.Collection();

  var self = {
    lookupStepDefinitionByName: function lookupStepDefinitionByName(name) {
      var matchingStepDefinition;

      stepDefinitions.syncForEach(function(stepDefinition) {
        if (stepDefinition.matchesStepName(name)) {
          matchingStepDefinition = stepDefinition;
        }
      });
      return matchingStepDefinition;
    },

    defineGivenStep: function defineGivenStep(name, code) {
      defineStep(name, code);
    },

    defineWhenStep: function defineWhenStep(name, code) {
      defineStep(name, code);
    },

    defineThenStep: function defineThenStep(name, code) {
      defineStep(name, code);
    }
  };

  withStepDefinitionHelpersDo(function() {
    supportCodeDefinition();
  });

  function withStepDefinitionHelpersDo(callback) {
    var originals = {
      Given: (typeof(Given) != 'undefined' ? Given : undefined),
      When:  (typeof(When)  != 'undefined' ? When  : undefined),
      Then:  (typeof(Then)  != 'undefined' ? Then  : undefined)
    };
    Given = self.defineGivenStep;
    When  = self.defineWhenStep;
    Then  = self.defineThenStep;
    callback();
    Given = originals['Given'];
    When  = originals['When'];
    Then  = originals['Then'];
  };

  function defineStep(name, code) {
    var stepDefinition = Cucumber.SupportCode.StepDefinition(name, code);
    stepDefinitions.add(stepDefinition);
  };

  return self;
};

Cucumber.SupportCode.StepDefinition = function(regexp, code) {
  var self = {
    matchesStepName: function matchesStepName(stepName) {
      return regexp.test(stepName);
    },

    invoke: function invoke(stepName, docString, callback) {
      var codeCallback = function() {
        var stepResult = Cucumber.Runtime.StepResult(true);
        callback(stepResult);
      };
      var parameters = self.buildInvocationParameters(stepName, docString, codeCallback);
      try {
        code.apply(undefined, parameters);
      } catch (err) {
        var stepResult = Cucumber.Runtime.StepResult(false);
        callback(stepResult);
      }
    },

    buildInvocationParameters: function buildInvocationParameters(stepName, docString, callback) {
      var parameters = regexp.exec(stepName);
      parameters.shift();
      if (docString) {
        var string = docString.getString();
        parameters.push(string);
      }
      parameters.push(callback);
      return parameters;
    }
  };
  return self;
};

Cucumber.Runtime = {};
Cucumber.Runtime.StepResult = function(status) {
  var self = {
    isSuccessful: function isSuccessful() {
      return !!status;
    }
  };
  return self;
};

Cucumber.Listener = {};
Cucumber.Listener.ProgressFormatter = function(options) {
  var beforeEachScenarioUserFunctions = Cucumber.Types.Collection();
  var logs                            = "";
  var passedScenarios                 = 0;
  var passedSteps                     = 0;

  if (!options)
    options = {};
  if (options['logToConsole'] == undefined)
    options['logToConsole'] = true;

  var self = {
    beforeEachScenarioDo: function beforeEachScenarioDo(userFunction) {
      beforeEachScenarioUserFunctions.add(userFunction);
    },

    log: function log(string) {
      logs += string;
      if (options['logToConsole'])
        process.stdout.write(string);
    },

    getLogs: function getLogs() {
      return logs;
    },

    hear: function hear(event, callback) {
      if (self.hasHandlerForEvent(event)) {
        var handler = self.getHandlerForEvent(event);
        handler(event, callback);
      } else {
        callback();
      }
    },

    hasHandlerForEvent: function hasHandlerForEvent(event) {
      var handlerName = self.buildHandlerNameForEvent(event);
      return self[handlerName] != undefined;
    },

    buildHandlerNameForEvent: function buildHandlerNameForEvent(event) {
      var handlerName =
        Cucumber.Listener.ProgressFormatter.EVENT_HANDLER_NAME_PREFIX +
        event.getName() +
        Cucumber.Listener.ProgressFormatter.EVENT_HANDLER_NAME_SUFFIX;
      return handlerName;
    },

    getHandlerForEvent: function getHandlerForEvent(event) {
      var eventHandlerName = self.buildHandlerNameForEvent(event);
      return self[eventHandlerName];
    },

    handleStepResultEvent: function handleStepResultEvent(event, callback) {
      var stepResult = event.getPayloadItem('stepResult');
      if (stepResult.isSuccessful()) {
        self.countOnePassedStep();
        self.log(Cucumber.Listener.ProgressFormatter.PASSING_STEP_CHARACTER);
      } else {
        self.countOneFailedStep();
        self.log(Cucumber.Listener.ProgressFormatter.FAILED_STEP_CHARACTER);
      }
      callback();
    },

    handleAfterFeaturesEvent: function handleAfterFeaturesEvent(event, callback) {
      self.logSummary();
      callback();
    },

    handleAfterScenarioEvent: function handleAfterScenarioEvent(event, callback) {
      self.countOnePassedScenario();
      callback();
    },

    countOnePassedScenario: function countOnePassedScenario() {
      passedScenarios++;
    },

    countOnePassedStep: function countOnePassedStep() {
      passedSteps++;
    },

    countOneFailedStep: TODO("countOneFailedStep()"),

    logSummary: function logSummary() {
      self.log("\n\n");
      var scenarioCount       = self.getScenarioCount();
      var passedScenarioCount = self.getPassedScenarioCount();
      var stepCount           = self.getStepCount();
      var passedStepCount     = self.getPassedStepCount();
      self.log(scenarioCount + " scenario(s) (" + passedScenarioCount + " passed)\n");
      self.log(stepCount + " step(s) (" + passedStepCount + " passed)");
      self.log("\n");
    },

    getScenarioCount: function getScenarioCount() {
      return self.getPassedScenarioCount();
    },

    getPassedScenarioCount: function getPassedScenarioCount(){
      return passedScenarios;
    },

    getStepCount: function getStepCount() {
      return self.getPassedStepCount();
    },

    getPassedStepCount: function getPassedStepCount() {
      return passedSteps;
    }
  };
  return self;
};
Cucumber.Listener.ProgressFormatter.PASSING_STEP_CHARACTER    = '.';
Cucumber.Listener.ProgressFormatter.FAILED_STEP_CHARACTER    = 'F';
Cucumber.Listener.ProgressFormatter.EVENT_HANDLER_NAME_PREFIX = 'handle';
Cucumber.Listener.ProgressFormatter.EVENT_HANDLER_NAME_SUFFIX = 'Event';

Cucumber.Types = {};
Cucumber.Types.Collection = function() {
  var items = new Array();
  var self = {
    add:         function add(item)                       { items.push(item); },
    getLast:     function getLast()                       { return items[items.length-1]; },
    syncForEach: function syncForEach(userFunction)       { items.forEach(userFunction); },
    forEach:     function forEach(userFunction, callback) {
      var itemsCopy = items.slice(0);
      function iterate() {
        if (itemsCopy.length > 0) {
          processItem();
        } else {
          callback();
        };
      }
      function processItem() {
        var item = itemsCopy.shift();
        userFunction(item, function() {
          iterate();
        });
      };
      iterate();
    }
  };
  return self;
};

Cucumber.Util = {};
Cucumber.Util.Arguments = function(argumentsObject) {
  return Array.prototype.slice.call(argumentsObject);
};

/*
  Cucumber.Debug utilities are meant to experiment and...
  debug. No tests cover that namespace.
*/
Cucumber.Debug = {};
Cucumber.Debug.SimpleAstListener = function(options) {
  var logs                        = '';
  var failed                      = false;
  var beforeEachScenarioCallbacks = [];
  var currentStep;

  if (!options)
    var options = {};

  var self = {
    hear: function hear(event, callback) {
      switch(event.getName()) {
      case 'BeforeFeature':
        self.hearBeforeFeature(event.getPayloadItem('feature'), callback);
        break;
      case 'BeforeScenario':
        self.hearBeforeScenario(event.getPayloadItem('scenario'), callback);
        break;
      case 'BeforeStep':
        self.hearBeforeStep(event.getPayloadItem('step'), callback);
        break;
      case 'StepResult':
        self.hearStepResult(event.getPayloadItem('stepResult'), callback);
        break;
      default:
        callback();
      }
    },

    hearBeforeFeature: function hearBeforeFeature(feature, callback) {
      log("Feature: " + feature.getName());
      var description = feature.getDescription();
      if (description != "")
        log(description, 1);
      callback();
    },

    hearBeforeScenario: function hearBeforeScenario(scenario, callback) {
      beforeEachScenarioCallbacks.forEach(function(func) {
        func();
      });
      log("");
      log(scenario.getKeyword() + ": " + scenario.getName(), 1);
      callback();
    },

    hearBeforeStep: function hearBeforeStep(step, callback) {
      currentStep = step;
      callback();
    },

    hearStepResult: function hearStepResult(stepResult, callback) {
      log(currentStep.getKeyword() + currentStep.getName(), 2);
      if (currentStep.hasDocString()) {
        log('"""', 3);
        log(currentStep.getDocString().getString(), 3);
        log('"""', 3);
      };
      callback();
    },

    getLogs: function getLogs() {
      return logs;
    },

    featuresPassed: function featuresPassed() {
      return !failed;
    },

    beforeEachScenarioDo: function beforeEachScenarioDo(func) {
      beforeEachScenarioCallbacks.push(func);
    }
  };
  return self;

  function log(message, indentation) {
    if (indentation)
      message = indent(message, indentation);
    logs = logs + message + "\n";
    if (options['logToConsole'])
      console.log(message);
    if (typeof(options['logToFunction']) == 'function')
      options['logToFunction'](message);
  };

  function indent(text, indentation) {
    var indented;
    text.split("\n").forEach(function(line) {
      var prefix = new Array(indentation + 1).join("  ");
      line = prefix + line;
      indented = (typeof(indented) == 'undefined' ? line : indented + "\n" + line);
    });
    return indented;
  };
};

if(typeof exports != 'undefined') { module.exports = Cucumber; }
if(typeof window != 'undefined') { for (var p in Cucumber) { window[p] = Cucumber[p]; } }

var TODO = function(description) {
  return function() { throw("IMPLEMENT ME: " + description); };
};
