var SupportCodeLoader = function(supportCodeFilePaths) {
  var Cucumber = require('../../cucumber');
  var CoffeeScript = require('coffee-script');

  var self = {
    getSupportCodeLibrary: function getSupportCodeLibrary() {
      var supportCodeInitialiazer = self.getSupportCodeInitializer();
      var supportCodeLibrary      = Cucumber.SupportCode.Library(supportCodeInitialiazer);
      return supportCodeLibrary;
    },

    getSupportCodeInitializer: function getSupportCodeInitializer() {
      var primeSupportCodeInitializer     = self.getPrimeSupportCodeInitializer();
      var secondarySupportCodeInitializer = self.getSecondarySupportCodeInitializer();
      var initializer = function() {
        var supportCodeHelper = this;
        CoffeeScript.register();
        primeSupportCodeInitializer.call(supportCodeHelper);
        secondarySupportCodeInitializer.call(supportCodeHelper);
      };
      return initializer;
    },

    getPrimeSupportCodeInitializer: function getPrimeSupportCodeInitializer() {
      var primeSupportCodeFilePaths   = self.getPrimeSupportCodeFilePaths();
      var primeSupportCodeInitializer = self.buildSupportCodeInitializerFromPaths(primeSupportCodeFilePaths);
      return primeSupportCodeInitializer;
     },

    getSecondarySupportCodeInitializer: function getSecondarySupportCodeBlocks() {
      var secondarySupportCodeFilePaths = self.getSecondarySupportCodeFilePaths();
      var secondarySupportCodeInitializer = self.buildSupportCodeInitializerFromPaths(secondarySupportCodeFilePaths);
      return secondarySupportCodeInitializer;
    },

    getPrimeSupportCodeFilePaths: function getPrimeSupportCodeFilePaths() {
      var primeSupportCodeFilePaths = [];
      supportCodeFilePaths.forEach(function(path) {
        if (path.match(SupportCodeLoader.PRIME_SUPPORT_CODE_PATH_REGEXP))
          primeSupportCodeFilePaths.push(path);
      });
      return primeSupportCodeFilePaths;
    },

    getSecondarySupportCodeFilePaths: function getSecondarySupportCodeFilePaths() {
      var secondarySupportCodeFilePaths = [];
      supportCodeFilePaths.forEach(function(path) {
        if (!path.match(SupportCodeLoader.PRIME_SUPPORT_CODE_PATH_REGEXP))
          secondarySupportCodeFilePaths.push(path);
      });
      return secondarySupportCodeFilePaths;
    },

    buildSupportCodeInitializerFromPaths: function buildSupportCodeInitializerFromPaths(paths) {
      var wrapper = function(){
        var supportCodeHelper = this;
        paths.forEach(function(path) {
          var initializer = require(path);
          if (typeof(initializer) == 'function')
            initializer.call(supportCodeHelper);
        });
      };
      return wrapper;
    }
  };
  return self;
};
SupportCodeLoader.PRIME_SUPPORT_CODE_PATH_REGEXP = /\/support\//i;
module.exports = SupportCodeLoader;
