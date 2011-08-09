var Runtime = function(featuresSource, supportCodeDefinition) {
  var Cucumber = require('../cucumber');

  var listeners = Cucumber.Type.Collection();

  var self = {
    start: function start(callback) {
      if (typeof(callback) !== 'function')
        throw new Error(Cucumber.START_MISSING_CALLBACK_ERROR);
      var features           = self.parseFeaturesSource(featuresSource);
      var supportCodeLibrary = self.initializeSupportCode(supportCodeDefinition);
      self.executeFeaturesAgainstSupportCodeLibrary(features, supportCodeLibrary, callback);
    },

    attachListener: function attachListener(listener) {
      listeners.add(listener);
    },

    parseFeaturesSource: function parseFeaturesSource(featuresSource) {
      var parser = Cucumber.Parser({feature: featuresSource});
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
Runtime.PendingStepException = require('./runtime/pending_step_exception');
Runtime.SuccessfulStepResult = require('./runtime/successful_step_result');
Runtime.PendingStepResult    = require('./runtime/pending_step_result');
Runtime.FailedStepResult     = require('./runtime/failed_step_result');
module.exports               = Runtime;
