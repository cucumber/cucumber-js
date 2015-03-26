// vim: noai:ts=2:sw=2
function Runtime(configuration) {
  var Cucumber = require('../cucumber');
  var stackSettings = require('./stackSettings');
  var fs = require('fs');

  var listeners = Cucumber.Type.Collection();

  var self = {
    start: function start(callback) {
      if (typeof(callback) !== 'function') throw new Error(Runtime.START_MISSING_CALLBACK_ERROR);

      if (typeof(callback) !== 'function')
        throw new Error(Runtime.START_MISSING_CALLBACK_ERROR);
      var isStrictRequested;
      try {
        isStrictRequested    = configuration.isStrictRequested();
      } catch(e) {
        isStrictRequested    = false;
      }

      var supportCodeLibrary = self.getSupportCodeLibrary();
      var features           = self.getFeatures();
      
      if (configuration.findStepDef()) {
        self.findStepDefinition(features, supportCodeLibrary);
        return callback(1);
      }
      
      stackSettings.useShortTraces = self.getStackSettings();
      var astTreeWalker = Runtime.AstTreeWalker(features, supportCodeLibrary, listeners, isStrictRequested);

      // this odd way of injecting the unused steps works around problems with the mock library.
      if (configuration.shouldShowUnusedSteps()) {
        var originalCallback = callback;
        callback = function () {
          self.showUnusedSteps(supportCodeLibrary);
          return originalCallback();
        };
      }

      astTreeWalker.walk(callback);
    },

    showUnusedSteps: function showUnusedSteps(supportCodeLibrary) {
      var lastFile = '';
      var unused = supportCodeLibrary.unusedSteps();
      if (unused.length > 0) console.log('Unused steps:');
      for (var i = 0; i < unused.length; i++) {
        var s = unused[i];
        if (lastFile !== s.getUri()) {
          lastFile = s.getUri();
          console.log();
          console.log(s.getUri());
        }
        console.log('    '+s.getPatternRegexp());
      }
    },

    findStepDefinition: function findStepDefinition(features, supportCodeLibrary) {
      var findTarget = configuration.findStepDef(); 

      var match = null;
      features.getFeatures().syncForEach(function(i){                              // Features
        if (match) return;
        var fe = i.getFeatureElements();
        fe.syncForEach(function(fei) {                                               // Scenarios & Outlines
          if (match) return;
          var tags = fei.getTags();
          fei.getSteps().syncForEach(function(step){                                   // Steps
            if (match) return;
            var stepSrc = step.getUri()+':'+step.getLine();
            if (stepSrc.indexOf(findTarget) + findTarget.length === stepSrc.length) {    // Found a matching step
              var tagNames = tags.map(function(t){return t.getName();});
              match = supportCodeLibrary.lookupStepDefinitionByName(step.getName(), tagNames);
            }
          });
        });
      });

      if (!match) {
        console.log('Not found');
        return;
      }

      var regexText = match.getPatternRegexp()+'';
      var filePath = match.getUri();
      try {
        var lines = fs.readFileSync(filePath, {encoding:'utf8'}).split(/\r\n|[\r\n]/);

        for (var l = 0; l < lines.length; l++) {
          if (lines[l].indexOf(regexText) > 0) {
            var found = filePath+':'+(l+1)+':'+(lines[l].length);

            // try to find a mapped file, return original found if no map
            console.log(match.trySourceMap(found));
          }
        }
      } catch (err) {
        console.log('Not found: '+err);
      }
    },

    attachListener: function attachListener(listener) {
      listeners.add(listener);
    },

    getStackSettings: function() {
        var useShortTraces = configuration.getStackFormat();
        return useShortTraces;
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
}

Runtime.START_MISSING_CALLBACK_ERROR = 'Cucumber.Runtime.start() expects a callback';
Runtime.AstTreeWalker                = require('./runtime/ast_tree_walker');
Runtime.StepResult                   = require('./runtime/step_result');
Runtime.SuccessfulStepResult         = require('./runtime/successful_step_result');
Runtime.PendingStepResult            = require('./runtime/pending_step_result');
Runtime.FailedStepResult             = require('./runtime/failed_step_result');
Runtime.SkippedStepResult            = require('./runtime/skipped_step_result');
Runtime.UndefinedStepResult          = require('./runtime/undefined_step_result');
Runtime.Attachment                   = require('./runtime/attachment');

module.exports = Runtime;
