var SupportCodePathExpander = {
  expandPaths: function expandPaths(paths, extensions) {
    var Cucumber      = require('../../cucumber');

    var PathExpander  = Cucumber.Cli.PathExpander;
    var regexp = new RegExp('\\.(' + extensions.join('|') + ')$');
    var expandedPaths = PathExpander.expandPathsWithRegexp(paths, regexp);
    return expandedPaths;
  }
};
module.exports = SupportCodePathExpander;
