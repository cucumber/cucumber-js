var FeaturePathExpander = {
  expandPaths: function expandPaths(paths) {
    var Cucumber     = require('../../cucumber');
    var PathExpander = Cucumber.Cli.PathExpander;

    paths = paths.map(function(path) {
      return path.replace(/(:\d+)*$/g, ''); // Strip line numbers
    });
    var expandedPaths = PathExpander.expandPathsWithExtensions(paths, ['feature']);
    return expandedPaths;
  }
};
module.exports = FeaturePathExpander;
