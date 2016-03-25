function SimpleAstListener(options) {
  var logs                        = '';
  var failed                      = false;
  var beforeEachScenarioCallbacks = [];
  var currentFeature, currentStep;

  if (!options)
    options = {};

  function indent(text, indentation) {
    var indented;
    text.split('\n').forEach(function (line) {
      var prefix = new Array(indentation + 1).join('  ');
      line = prefix + line;
      indented = (typeof(indented) === 'undefined' ? line : indented + '\n' + line);
    });
    return indented;
  }

  function log(message, indentation) {
    if (indentation)
      message = indent(message, indentation);
    logs = logs + message + '\n';
    if (options.stream)
      options.stream.write(message);
    if (typeof(options.logToFunction) === 'function')
      options.logToFunction (message);
  }

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
      currentFeature = feature;
      log('Feature: ' + feature.getName());
      var description = feature.getDescription();
      if (description !== '')
        log(description, 1);
      callback();
    },

    hearBeforeScenario: function hearBeforeScenario(scenario, callback) {
      beforeEachScenarioCallbacks.forEach(function (func) {
        func();
      });
      log('');
      log(scenario.getName(), 1);
      callback();
    },

    hearBeforeStep: function hearBeforeStep(step, callback) {
      currentStep = step;
      currentStep =
      callback();
    },

    hearStepResult: function hearStepResult(stepResult, callback) {
      log(currentStep.getKeyword() + (currentStep.getName() || ''), 2);
      if (currentStep.hasDocString()) {
        log('"""', 3);
        log(currentStep.getDocString().getContents(), 3);
        log('"""', 3);
      }
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
}

module.exports = SimpleAstListener;
