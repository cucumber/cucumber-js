var fs = require('fs');
var glob = require('glob');
var _ = require('lodash');

var PathExpander = {
  expandPathsWithExtensions: function expandPathsWithExtensions(paths, extensions) {
    var expandedPaths = paths.map(function (path) {
      return PathExpander.expandPathWithExtensions(path, extensions);
    });
    return _.uniq(_.flatten(expandedPaths));
  },

  expandPathWithExtensions: function expandPathWithExtensions(path, extensions) {
    var realPath = fs.realpathSync(path);
    var stats = fs.statSync(realPath);
    if (stats.isDirectory()) {
      return this.expandDirectoryWithExtensions(realPath, extensions);
    } else {
      return [realPath];
    }
  },

  expandDirectoryWithExtensions: function expandDirectoryWithExtensions(realPath, extensions) {
    var pattern = realPath + '/**/*.';
    if (extensions.length > 1) {
      pattern += '{' + extensions.join(',') + '}';
    } else {
      pattern += extensions[0];
    }
    return glob.sync(pattern);
  }
};

module.exports = PathExpander;
