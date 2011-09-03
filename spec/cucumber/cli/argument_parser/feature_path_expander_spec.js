require('../../../support/spec_helper');

describe("Cucumber.Cli.ArgumentParser.FeaturePathExpander", function() {
  var Cucumber            = require('cucumber');
  var FeaturePathExpander = Cucumber.Cli.ArgumentParser.FeaturePathExpander;
  var PathExpander        = Cucumber.Cli.ArgumentParser.PathExpander;

  describe("expandPaths", function() {
    var paths, expandedPaths;

    beforeEach(function() {
      paths         = createSpy("unexpanded paths");
      expandedPaths = createSpy("expanded paths");
      spyOn(PathExpander, 'expandPathsWithGlobString').andReturn(expandedPaths);
    });

    it("asks the path expander to expand the paths with the glob matching feature files", function() {
      FeaturePathExpander.expandPaths(paths);
      expect(PathExpander.expandPathsWithGlobString).toHaveBeenCalledWith(paths, FeaturePathExpander.GLOB_FEATURE_FILES_IN_DIR_STRING);
    });

    it("returns the expanded paths", function() {
      expect(FeaturePathExpander.expandPaths(paths)).toBe(expandedPaths);
    });
  });
});
