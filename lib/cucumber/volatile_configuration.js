var VolatileConfiguration = function VolatileConfiguration(featureSource, supportCodeInitializer) {
  var Cucumber = require('../cucumber');

  var supportCodeLibrary = Cucumber.SupportCode.Library(supportCodeInitializer);

  var self = {
    getFeatureSources: function getFeatureSources() {
      var featureNameSourcePair = [VolatileConfiguration.FEATURE_SOURCE_NAME, featureSource];
      return [featureNameSourcePair];
    },

    getSupportCodeLibrary: function getSupportCodeLibrary() {
      return supportCodeLibrary;
    }
  };
  return self;
};
VolatileConfiguration.FEATURE_SOURCE_NAME = "(feature)";
module.exports = VolatileConfiguration;
