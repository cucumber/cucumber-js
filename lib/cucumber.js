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

Cucumber.Parser      = require('./cucumber/parser');
Cucumber.Ast         = require('./cucumber/ast');
Cucumber.SupportCode = require('./cucumber/support_code');
Cucumber.Runtime     = require('./cucumber/runtime');
Cucumber.Listener    = require('./cucumber/listener');
Cucumber.Types       = require('./cucumber/types');
Cucumber.Util        = require('./cucumber/util');
Cucumber.Debug       = require('./cucumber/debug'); // Untested namespace

module.exports = Cucumber;