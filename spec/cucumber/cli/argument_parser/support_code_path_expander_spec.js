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
      spyOn(PathExpander, 'expandPathsWithGlobString').andReturn(expandedPaths);
    });

    it("asks the path expander to expand the paths with the glob matching feature files", function() {
      SupportCodePathExpander.expandPaths(paths);
      expect(PathExpander.expandPathsWithGlobString).toHaveBeenCalledWith(paths, SupportCodePathExpander.GLOB_SUPPORT_CODE_FILES_IN_DIR_STRING);
    });

    it("returns the expanded paths", function() {
      expect(SupportCodePathExpander.expandPaths(paths)).toBe(expandedPaths);
    });
  });
});
