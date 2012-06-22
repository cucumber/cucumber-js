require('../../../support/spec_helper');

describe("Cucumber.Cli.ArgumentParser.PathExpander", function() {
  var PathExpander = requireLib('cucumber').Cli.ArgumentParser.PathExpander;

  describe("expandPathsWithRegexp", function() {
    var _ = require('underscore');

    var unexpandedPaths, regexp, expandedPaths, expandPathResults, expandedPathsWithoutDups;

    beforeEach(function() {
      regexp          = createSpy("glob string");
      unexpandedPaths = [createSpy("unexpanded path 1"), createSpy("unexpanded path 2")];
      expandedPaths   = [createSpy("expanded path 1-1"), createSpy("expanded path 1-2"), createSpy("expanded path 2-1")];
      expandPathResults = [[expandedPaths[0], expandedPaths[1]], [expandedPaths[2]]];
      epxandedPathsWithoutDups = createSpy("expanded paths without duplicates");
      spyOn(PathExpander, 'expandPathWithRegexp').andReturnSeveral(expandPathResults);
      spyOn(_, 'uniq').andReturn(expandedPathsWithoutDups);
    });

    it("expands each path", function() {
      PathExpander.expandPathsWithRegexp(unexpandedPaths, regexp);
      unexpandedPaths.forEach(function(unexpandedPath) {
        expect(PathExpander.expandPathWithRegexp).toHaveBeenCalledWith(unexpandedPath, regexp);
      });
    });

    it("removes duplicate expanded paths", function() {
      PathExpander.expandPathsWithRegexp(unexpandedPaths);
      expect(_.uniq).toHaveBeenCalledWith(expandedPaths);
    });

    it("returns the expanded paths", function() {
      expect(PathExpander.expandPathsWithRegexp(unexpandedPaths)).toEqual(expandedPathsWithoutDups);
    });
  });

  describe("expandPathWithRegexp()", function() {
    var fs   = require('fs');
    var path, regexp, stats, realPath, pathsFromExpandedDirectory;

    beforeEach(function() {
      path       = createSpy("path");
      regexp     = createSpy("regexp");
      stats      = createSpyWithStubs("path stats", {isDirectory: null});
      spyOn(fs, 'statSync').andReturn(stats);
      realPath   = "/real/path";
      spyOn(fs, 'realpathSync').andReturn(realPath);
      pathsFromExpandedDirectory = createSpy("paths from expanded directory");
      spyOn(PathExpander, 'expandDirectoryWithRegexp').andReturn(pathsFromExpandedDirectory);
    });

    it("synchronously gets the absolute representation of the path", function() {
      PathExpander.expandPathWithRegexp(path);
      expect(fs.realpathSync).toHaveBeenCalledWith(path);
    });

    it("synchronously stats the path", function() {
      PathExpander.expandPathWithRegexp(path);
      expect(fs.statSync).toHaveBeenCalledWith(realPath);
    });

    it("checks whether the path points to a directory or not", function() {
      PathExpander.expandPathWithRegexp(path);
      expect(stats.isDirectory).toHaveBeenCalled();
    });

    describe("when the path points to a directory", function() {
      beforeEach(function() {
        stats.isDirectory.andReturn(true);
        globResults = createSpy("glob results");
      });

      it("expands the directory", function() {
        PathExpander.expandPathWithRegexp(path, regexp);
        expect(PathExpander.expandDirectoryWithRegexp).toHaveBeenCalledWith(realPath, regexp);
      });

      it("returns the paths expanded from the directory", function() {
        expect(PathExpander.expandPathWithRegexp(path)).toBe(pathsFromExpandedDirectory);
      });
    });

    describe("when the path does not point to a directory", function() {
      beforeEach(function() {
        stats.isDirectory.andReturn(false);
      });

      it("returns an array with the absolute path as its only item", function() {
        expect(PathExpander.expandPathWithRegexp(path)).toEqual([realPath]);
      });
    });
  });

  describe("expandDirectoryWithRegexp()", function() {
    var walkdir = require('walkdir');
    var directory, regexp, innerPaths;

    beforeEach(function() {
      directory  = createSpy("directory");
      regexp     = createSpyWithStubs("regexp", {test: null});
      innerPaths = [createSpy("inner path 1"), createSpy("inner path 2"), createSpy("inner path 3")];
      spyOn(walkdir, 'sync').andReturn(innerPaths);
    });

    it("recursively finds the directory inner paths", function() {
      PathExpander.expandDirectoryWithRegexp(directory, regexp);
      expect(walkdir.sync).toHaveBeenCalledWith(directory);
    });

    it("tests the regexp against each inner path", function() {
      PathExpander.expandDirectoryWithRegexp(directory, regexp);
      expect(regexp.test).toHaveBeenCalledWith(innerPaths[0]);
      expect(regexp.test).toHaveBeenCalledWith(innerPaths[1]);
      expect(regexp.test).toHaveBeenCalledWith(innerPaths[2]);
    });

    it("returns the paths that matched", function() {
      regexp.test.andReturnSeveral([true, false, true]);
      var paths = PathExpander.expandDirectoryWithRegexp(directory, regexp);
      expect(paths).toEqual([innerPaths[0], innerPaths[2]]);
    });
  });
});
