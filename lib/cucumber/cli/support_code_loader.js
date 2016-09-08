var os = require('os');
var path = require('path');

function SupportCodeLoader(supportCodeFilePaths, compilerModules) {
  var Cucumber = require('../../cucumber');

  var self = {
    getSupportCodeLibrary: function getSupportCodeLibrary() {
      var supportCodeInitialiazer = self.getSupportCodeInitializer();
      var supportCodeLibrary      = Cucumber.SupportCode.Library(supportCodeInitialiazer);
      return supportCodeLibrary;
    },

    getSupportCodeInitializer: function getSupportCodeInitializer() {
      var primeSupportCodeInitializer     = self.getPrimeSupportCodeInitializer();
      var secondarySupportCodeInitializer = self.getSecondarySupportCodeInitializer();
      var initializer = function () {
        var supportCodeHelper = this;
        var userLandModulesPath = path.join(process.cwd(), 'node_modules');
        process.env.NODE_PATH += SupportCodeLoader.ENV_VAR_PATH_SEPARATOR + userLandModulesPath;
        require('module').Module._initPaths();
        compilerModules.forEach(require);
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
      supportCodeFilePaths.forEach(function (path) {
        if (path.match(SupportCodeLoader.PRIME_SUPPORT_CODE_PATH_REGEXP))
          primeSupportCodeFilePaths.push(path);
      });
      return primeSupportCodeFilePaths;
    },

    getSecondarySupportCodeFilePaths: function getSecondarySupportCodeFilePaths() {
      var secondarySupportCodeFilePaths = [];
      supportCodeFilePaths.forEach(function (path) {
        if (!path.match(SupportCodeLoader.PRIME_SUPPORT_CODE_PATH_REGEXP))
          secondarySupportCodeFilePaths.push(path);
      });
      return secondarySupportCodeFilePaths;
    },

    buildSupportCodeInitializerFromPaths: function buildSupportCodeInitializerFromPaths(paths) {
      var wrapper = function () {
        var supportCodeHelper = this;
        paths.forEach(function (path) {
          var initializer = require(path);
          if (typeof(initializer) === 'function') {
            initializer.call(supportCodeHelper);
          } else if (initializer.hasOwnProperty('default') && typeof(initializer.default) === 'function') {
            initializer.default.call(supportCodeHelper);
          }
        });
      };
      return wrapper;
    }
  };
  return self;
}

SupportCodeLoader.WINDOWS_PLATFORM_REGEXP = /^win/;
SupportCodeLoader.PRIME_SUPPORT_CODE_PATH_REGEXP = os.platform().match(SupportCodeLoader.WINDOWS_PLATFORM_REGEXP) ? /\\support\\/ : /\/support\//i;
SupportCodeLoader.ENV_VAR_PATH_SEPARATOR = os.platform().match(SupportCodeLoader.WINDOWS_PLATFORM_REGEXP) ? ';' : ':';

module.exports = SupportCodeLoader;
