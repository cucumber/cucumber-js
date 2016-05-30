function FeatureSourceLoader(featureFilePaths) {
  var fs = require('fs');

  var self = {
    getSources: function getSources() {
      var sources = [];
      featureFilePaths.forEach(function (featureFilePath) {
        var source = fs.readFileSync(featureFilePath, 'utf8');
        sources.push([featureFilePath, source]);
      });
      return sources;
    }
  };
  return self;
}

module.exports = FeatureSourceLoader;
