function Features() {
  var Cucumber = require('../../cucumber');

  var features = Cucumber.Type.Collection();

  var self = {
    addFeature: function addFeature(feature) {
      features.add(feature);
    },

    getFeatures: function getFeatures() {
      return features;
    },

    getLastFeature: function getLastFeature() {
      return features.getLast();
    },

    acceptVisitor: function acceptVisitor(visitor, callback) {
      features.asyncForEach(function (feature, iterate) {
        visitor.visitFeature(feature, iterate);
      }, callback);
    }
  };
  return self;
}

module.exports = Features;
