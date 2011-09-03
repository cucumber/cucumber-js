var fs   = require('fs');
var glob = require('glob');
var _    = require('underscore');

var FeaturePathExpander = {
  expandPathsWithGlobString: function expandPathsWithGlobString(paths, globString) {
    var expandedPaths = [];
    paths.forEach(function(path) {
      var expandedPath = FeaturePathExpander.expandPathWithGlobString(path, globString);
      expandedPaths    = expandedPaths.concat(expandedPath);
    });
    expandedPaths = _.uniq(expandedPaths);
    return expandedPaths;
  },

  expandPathWithGlobString: function expandPathWithGlobString(path, globString) {
    var realPath = fs.realpathSync(path);
    var stats    = fs.statSync(realPath);
    if (stats.isDirectory())
      return glob.globSync(realPath + '/' + globString)
    else
      return [realPath];
  }
};
module.exports = FeaturePathExpander;
