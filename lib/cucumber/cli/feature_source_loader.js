function FeatureSourceLoader(featureFilePaths) {
  var Cucumber = require('../../cucumber');
  var fs = require('fs');

  var self = {
    getSources: function getSources() {
      var sources = [];
      featureFilePaths.forEach(function (featureFilePath) {
        var source = self.getSource(featureFilePath);
        sources.push([featureFilePath, source]);
      });
      return sources;
    },

    getSource: function getSource(featureFilePath) {
      var matches = Cucumber.Cli.ArgumentParser.FEATURE_FILENAME_AND_LINENUM_REGEXP.exec(featureFilePath);
      var wasLineNumSpecified = matches && matches[2];
      if (wasLineNumSpecified) {
        featureFilePath = matches[1];
      }
      var featureSource = fs.readFileSync(featureFilePath);
      return featureSource;
    }
  };
  return self;
}

module.exports = FeatureSourceLoader;
