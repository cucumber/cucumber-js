if (typeof define !== 'function') { var define = require('amdefine')(module); }
define([
  'require',
  '../cucumber',
  './type',
  './parser',
  './runtime/ast_tree_walker',
  './runtime/step_result',
  './runtime/successful_step_result',
  './runtime/pending_step_result',
  './runtime/failed_step_result',
  './runtime/skipped_step_result',
  './runtime/undefined_step_result'
], function(
    require, Cucumber, Type, Parser, AstTreeWalker, StepResult, SuccessfulStepResult,
    PendingStepResult, FailedStepResult, SkippedStepResult, UndefinedStepResult) {

var Runtime = function(configuration) {

  var listeners = Type.Collection();

  var self = {
    start: function start(callback) {
      if (typeof(callback) !== 'function')
        throw new Error(Runtime.START_MISSING_CALLBACK_ERROR);
      var features           = self.getFeatures();
      var supportCodeLibrary = self.getSupportCodeLibrary();
      var astTreeWalker      = Runtime.AstTreeWalker(features, supportCodeLibrary, listeners);
      astTreeWalker.walk(callback);
    },

    attachListener: function attachListener(listener) {
      listeners.add(listener);
    },

    getFeatures: function getFeatures() {
      var featureSources = configuration.getFeatureSources();
      var astFilter      = configuration.getAstFilter();
      var parser         = require('../cucumber').Parser(featureSources, astFilter);
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
Runtime.AstTreeWalker        = AstTreeWalker;
Runtime.StepResult           = StepResult;
Runtime.SuccessfulStepResult = SuccessfulStepResult;
Runtime.PendingStepResult    = PendingStepResult;
Runtime.FailedStepResult     = FailedStepResult;
Runtime.SkippedStepResult    = SkippedStepResult;
Runtime.UndefinedStepResult  = UndefinedStepResult;
return Runtime;
});
