if (typeof define !== 'function') { var define = require('amdefine')(module); }
define(['../type'], function(Type) {
var Features = function() {

  var features = Type.Collection();

  var self = {
    addFeature: function addFeature(feature) {
      features.add(feature);
    },

    getLastFeature: function getLastFeature() {
      return features.getLast();
    },

    acceptVisitor: function acceptVisitor(visitor, callback) {
      features.forEach(function(feature, iterate) {
        visitor.visitFeature(feature, iterate);
      }, callback);
    }
  };
  return self;
};
return Features;
});
