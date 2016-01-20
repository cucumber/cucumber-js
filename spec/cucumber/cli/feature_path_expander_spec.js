require('../../support/spec_helper');

describe("Cucumber.Cli.FeaturePathExpander", function () {
  var Cucumber            = requireLib('cucumber');
  var FeaturePathExpander = Cucumber.Cli.FeaturePathExpander;
  var PathExpander        = Cucumber.Cli.PathExpander;

  describe("expandPaths", function () {
    var paths, expandedPaths;

    beforeEach(function () {
      paths         = ['a', 'b:1'];
      expandedPaths = createSpy("expanded paths");
      spyOn(PathExpander, 'expandPathsWithExtensions').and.returnValue(expandedPaths);
    });

    it("asks the path expander to expand the paths with the glob matching feature files", function () {
      FeaturePathExpander.expandPaths(paths);
      expect(PathExpander.expandPathsWithExtensions).toHaveBeenCalledWith(['a', 'b'], ['feature']);
    });

    it("returns the expanded paths", function () {
      expect(FeaturePathExpander.expandPaths(paths)).toBe(expandedPaths);
    });
  });
});
