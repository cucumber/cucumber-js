var SupportCodePathExpander = {
  expandPaths: function expandPaths(paths) {
    var Cucumber     = require('../../../cucumber');
    var PathExpander = Cucumber.Cli.ArgumentParser.PathExpander;
    var expandedPaths = PathExpander.expandPathsWithRegexp(paths, SupportCodePathExpander.SUPPORT_CODE_FILES_IN_DIR_REGEXP);
    var isCoffeeScriptLoaded = false;

    for (_i = 0, _len = expandedPaths.length; _i < _len; _i++) {
      i = expandedPaths[_i];
      if (i.match('.coffee') != null && !isCoffeeScriptLoaded) {
        isCoffeeScriptLoaded = true;
        var CoffeeScript = require('coffee-script'); 
      }
    };
    
    return expandedPaths;
  }
};
SupportCodePathExpander.SUPPORT_CODE_FILES_IN_DIR_REGEXP = /\.(js|coffee)$/;
module.exports = SupportCodePathExpander;
