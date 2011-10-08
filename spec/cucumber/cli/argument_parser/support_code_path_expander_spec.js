require('../../../support/spec_helper');

describe("Cucumber.Cli.ArgumentParser.SupportCodePathExpander", function() {
  var Cucumber                = require('cucumber');
  var SupportCodePathExpander = Cucumber.Cli.ArgumentParser.SupportCodePathExpander;
  var PathExpander            = Cucumber.Cli.ArgumentParser.PathExpander;

  describe("expandPaths", function() {
    var paths, expandedPaths;

    beforeEach(function() {
      paths         = createSpy("unexpanded paths");
      expandedPaths = createSpy("expanded paths");
      spyOn(PathExpander, 'expandPathsWithRegexp').andReturn(expandedPaths);
    });

    it("asks the path expander to expand the paths with the glob matching feature files", function() {
      SupportCodePathExpander.expandPaths(paths);
      expect(PathExpander.expandPathsWithRegexp).toHaveBeenCalledWith(paths, SupportCodePathExpander.SUPPORT_CODE_FILES_IN_DIR_REGEXP);
    });

    it("returns the expanded paths", function() {
      expect(SupportCodePathExpander.expandPaths(paths)).toBe(expandedPaths);
    });
  });
});
