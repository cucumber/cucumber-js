var fs   = require('fs');
var glob = require('glob');
var _    = require('underscore');

var FeaturePathExpander = {
  expandPaths: function expandPaths(paths) {
    var Cucumber     = require('../../../cucumber');
    var PathExpander = Cucumber.Cli.ArgumentParser.PathExpander;

    var expandedPaths = PathExpander.expandPathsWithGlobString(paths, FeaturePathExpander.GLOB_FEATURE_FILES_IN_DIR_STRING);
    return expandedPaths;
  }
};
FeaturePathExpander.GLOB_FEATURE_FILES_IN_DIR_STRING = "**/*.feature";
module.exports = FeaturePathExpander;
