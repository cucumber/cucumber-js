var SupportCodePathExpander = {
  expandPaths: function expandPaths(paths, extensions) {
    var Cucumber = require('../../cucumber');
    var PathExpander = Cucumber.Cli.PathExpander;

    var expandedPaths = PathExpander.expandPathsWithExtensions(paths, extensions);
    return expandedPaths;
  }
};
module.exports = SupportCodePathExpander;
