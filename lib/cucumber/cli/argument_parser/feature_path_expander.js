var FeaturePathExpander = {
  expandPaths: function expandPaths(paths) {
    var Cucumber     = require('../../../cucumber');
    var PathExpander = Cucumber.Cli.ArgumentParser.PathExpander;

    var expandedPaths = PathExpander.expandPathsWithRegexp(paths, FeaturePathExpander.FEATURE_FILES_IN_DIR_REGEXP);
    return expandedPaths;
  }
};
FeaturePathExpander.FEATURE_FILES_IN_DIR_REGEXP = /\.feature$/;
module.exports = FeaturePathExpander;
