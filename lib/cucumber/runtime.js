var Runtime = function(configuration) {
  var Cucumber = require('../cucumber');

  var fs = require('fs');

  var callback;
  var listeners = Cucumber.Type.Collection();

  var self = {
    start: function start(callback) {
      if (typeof(callback) !== 'function')
        throw new Error(Runtime.START_MISSING_CALLBACK_ERROR);
      var features           = self.getFeatures();
      var supportCodeLibrary = self.getSupportCodeLibrary();
      var astTreeWalker      = Runtime.AstTreeWalker(features, supportCodeLibrary, listeners);

      self.setCallback(callback);
      astTreeWalker.walk(self.finish);
    },

    finish: function finish(result) {
      if (configuration.getReportFile() !== null) {
        fs.writeFileSync(configuration.getReportFile(), listeners.getLast().getLogs(), { flag: 'w' });
      }
      self.getCallback()(result);
    },

    attachListener: function attachListener(listener) {
      listeners.add(listener);
    },

    setCallback: function setCallback(newCallback) {
      callback = newCallback;
    },

    getCallback: function getCallback() {
      return callback;
    },

    getFeatures: function getFeatures() {
      var featureSources = configuration.getFeatureSources();
      var astFilter      = configuration.getAstFilter();
      var parser         = Cucumber.Parser(featureSources, astFilter);
      var features       = parser.parse();
      return features;
    },

    getSupportCodeLibrary: function getSupportCodeLibrary() {
      var supportCodeLibrary = configuration.getSupportCodeLibrary();
      return supportCodeLibrary;
    }
  };
  return self;
};
Runtime.START_MISSING_CALLBACK_ERROR = "Cucumber.Runtime.start() expects a callback";
Runtime.AstTreeWalker        = require('./runtime/ast_tree_walker');
Runtime.StepResult           = require('./runtime/step_result');
Runtime.SuccessfulStepResult = require('./runtime/successful_step_result');
Runtime.PendingStepResult    = require('./runtime/pending_step_result');
Runtime.FailedStepResult     = require('./runtime/failed_step_result');
Runtime.SkippedStepResult    = require('./runtime/skipped_step_result');
Runtime.UndefinedStepResult  = require('./runtime/undefined_step_result');
Runtime.Attachment           = require('./runtime/attachment');
module.exports               = Runtime;
