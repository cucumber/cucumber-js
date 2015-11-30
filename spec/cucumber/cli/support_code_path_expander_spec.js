require('../../support/spec_helper');

describe("Cucumber.Cli.SupportCodePathExpander", function () {
  var Cucumber                = requireLib('cucumber');
  var SupportCodePathExpander = Cucumber.Cli.SupportCodePathExpander;
  var PathExpander            = Cucumber.Cli.PathExpander;

  describe("expandPaths()", function () {
    var paths, expandedPaths;

    beforeEach(function () {
      paths         = createSpy("unexpanded paths");
      expandedPaths = createSpy("expanded paths");
      spyOn(PathExpander, 'expandPathsWithRegexp').and.returnValue(expandedPaths);
    });

    it("asks the path expander to expand the paths with the glob matching the extensions", function () {
      SupportCodePathExpander.expandPaths(paths, ['js']);
      expect(PathExpander.expandPathsWithRegexp).toHaveBeenCalledWith(paths, /\.(js)$/);
    });

    it("asks the path expander to expand the paths with the glob matching the extensions (with a compiler)", function () {
      SupportCodePathExpander.expandPaths(paths, ['js', 'coffee']);
      expect(PathExpander.expandPathsWithRegexp).toHaveBeenCalledWith(paths, /\.(js|coffee)$/);
    });

    it("returns the expanded paths", function () {
      expect(SupportCodePathExpander.expandPaths(paths, ['js'])).toBe(expandedPaths);
    });
  });
});
