require('../../support/spec_helper');

describe("Cucumber.Cli.FeaturePathExpander", function () {
  var Cucumber            = requireLib('cucumber');
  var FeaturePathExpander = Cucumber.Cli.FeaturePathExpander;
  var PathExpander        = Cucumber.Cli.PathExpander;

  describe("expandPaths", function () {
    var paths, expandedPaths;

    beforeEach(function () {
      paths         = createSpy("unexpanded paths");
      expandedPaths = createSpy("expanded paths");
      spyOn(PathExpander, 'expandPathsWithRegexp').and.returnValue(expandedPaths);
    });

    it("asks the path expander to expand the paths with the glob matching feature files", function () {
      FeaturePathExpander.expandPaths(paths);
      expect(PathExpander.expandPathsWithRegexp).toHaveBeenCalledWith(paths, FeaturePathExpander.FEATURE_FILES_IN_DIR_REGEXP);
    });

    it("returns the expanded paths", function () {
      expect(FeaturePathExpander.expandPaths(paths)).toBe(expandedPaths);
    });
  });
});
