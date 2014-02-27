var FeatureSourceLoader = function(featureFilePaths) {
  var fs = require('fs');

  var self = {
    getSources: function getSources() {
      var sources = [];
      featureFilePaths.forEach(function(featureFilePath) {
        var source = self.getSource(featureFilePath);
        sources.push([featureFilePath, source]);
      });
      return sources;
    },

    getSource: function getSource(featureFilePath) {
      var featureSource = fs.readFileSync(featureFilePath, 'utf-8');
      featureSource = featureSource.replace(/^\uFEFF/, '');
      return featureSource;
    }
  };
  return self;
};
module.exports = FeatureSourceLoader;
