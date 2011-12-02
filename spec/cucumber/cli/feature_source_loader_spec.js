require('../../support/spec_helper');

describe("Cucumber.Cli.FeatureSourceLoader", function() {
  var Cucumber = requireLib('cucumber');

  var featureSourceLoader, featureFilePaths;

  beforeEach(function() {
    featureFilePaths    = [createSpy("first feature file path"),
                           createSpy("second feature file path")];
    featureSourceLoader = Cucumber.Cli.FeatureSourceLoader(featureFilePaths);
  });

  describe("getSources()", function() {
    var featureSources, namedFeatureSources;

    beforeEach(function() {
      featureSources      = [createSpy("feature source 1"), createSpy("feature source 2")];
      namedFeatureSources = [[featureFilePaths[0], featureSources[0]],
                             [featureFilePaths[1], featureSources[1]]];
      spyOn(featureSourceLoader, 'getSource').andReturnSeveral(featureSources);
    });

    it("gets the source from each feature file", function() {
      featureSourceLoader.getSources();
      featureFilePaths.forEach(function(featureFilePath) {
        expect(featureSourceLoader.getSource).toHaveBeenCalledWith(featureFilePath);
      });
    });

    it("returns the loaded sources", function() {
      expect(featureSourceLoader.getSources()).toEqual(namedFeatureSources);
    });
  });

  describe("getSource()", function() {
    var fs = require('fs');

    var featureFilePath, featureSource;

    beforeEach(function() {
      featureSource = createSpy("feature source");
      spyOn(fs, 'readFileSync').andReturn(featureSource);
    });

    it("reads the file contents", function() {
      featureSourceLoader.getSource(featureFilePath);
      expect(fs.readFileSync).toHaveBeenCalledWith(featureFilePath);
    });

    it("returns the file contents", function() {
      expect(featureSourceLoader.getSource(featureFilePath)).toBe(featureSource);
    });
  });
});
