var SupportCodePathExpander = {
  expandPaths: function expandPaths(paths) {
    var Cucumber     = require('../../../cucumber');
    var PathExpander = Cucumber.Cli.ArgumentParser.PathExpander;

    var expandedPaths = PathExpander.expandPathsWithGlobString(paths, SupportCodePathExpander.GLOB_SUPPORT_CODE_FILES_IN_DIR_STRING);
    return expandedPaths;
  }
};
SupportCodePathExpander.GLOB_SUPPORT_CODE_FILES_IN_DIR_STRING = "**/*.js";
module.exports = SupportCodePathExpander;
