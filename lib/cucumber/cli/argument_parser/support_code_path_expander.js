var SupportCodePathExpander = {
  expandPaths: function expandPaths(paths) {
    var Cucumber      = require('../../../cucumber');
    require('coffee-script');
    require('pogo');

    var PathExpander  = Cucumber.Cli.ArgumentParser.PathExpander;
    var expandedPaths = PathExpander.expandPathsWithRegexp(paths, SupportCodePathExpander.SUPPORT_CODE_FILES_IN_DIR_REGEXP);
    return expandedPaths;
  }
};
SupportCodePathExpander.SUPPORT_CODE_FILES_IN_DIR_REGEXP = /\.(js|coffee|pogo)$/;
module.exports = SupportCodePathExpander;
