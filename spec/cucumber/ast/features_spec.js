require('../../support/spec_helper');

describe("Cucumber.Ast.Features", function() {
  var Cucumber = requireLib('cucumber');
  var featureCollection, lastFeature;
  var features;

  beforeEach(function() {
    lastFeature       = createSpy("Last feature");
    featureCollection = createSpy("Feature collection");
    spyOnStub(featureCollection, 'forEach');
    spyOn(Cucumber.Type, 'Collection').andReturn(featureCollection);
    features = Cucumber.Ast.Features();
  });

  describe("constructor", function() {
    it("creates a new collection to store features", function() {
      expect(Cucumber.Type.Collection).toHaveBeenCalledWith();
    });
  });

  describe("addFeature()", function() {
    beforeEach(function() {
      spyOnStub(featureCollection, 'add');
    });

    it("adds the feature to the features (collection)", function() {
      var feature = createSpy("feature AST element");
      features.addFeature(feature);
      expect(featureCollection.add).toHaveBeenCalledWith(feature);
    });
  });

  describe("getLastFeature()", function() {
    beforeEach(function() {
      spyOnStub(featureCollection, 'getLast').andReturn(lastFeature);
    });

    it("gets the last feature from the collection", function() {
      features.getLastFeature();
      expect(featureCollection.getLast).toHaveBeenCalled();
    });

    it("returns that last feature from the collection", function() {
      expect(features.getLastFeature()).toBe(lastFeature);
    });
  });

  describe("acceptVisitor()", function() {
    var visitor, callback;

    beforeEach(function() {
      visitor  = createSpyWithStubs("A visitor", {visitFeature: null});
      callback = createSpy("Callback");
    });

    it("iterates over the features with a user function and the callback", function() {
      features.acceptVisitor(visitor, callback);
      expect(featureCollection.forEach).toHaveBeenCalled();
      expect(featureCollection.forEach).toHaveBeenCalledWithAFunctionAsNthParameter(1);
      expect(featureCollection.forEach).toHaveBeenCalledWithValueAsNthParameter(callback, 2);
    });

    describe("for each feature", function() {
      var userFunction, feature, forEachCallback;

      beforeEach(function() {
        features.acceptVisitor(visitor, callback);
        userFunction    = featureCollection.forEach.mostRecentCall.args[0];
        feature         = createSpy("A feature from the collection");
        forEachCallback = createSpy("forEach() callback");
      });

      it("tells the visitor to visit the feature and call back when finished", function() {
        userFunction(feature, forEachCallback);
        expect(visitor.visitFeature).toHaveBeenCalledWith(feature, forEachCallback);
      });
    });
  });
});
