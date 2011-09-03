require('../../../support/spec_helper');

describe("Cucumber.Cli.ArgumentParser.PathExpander", function() {
  var PathExpander = require('cucumber').Cli.ArgumentParser.PathExpander;

  describe("expandPathsWithGlobString", function() {
    var _ = require('underscore');

    var unexpandedPaths, globString, expandedPaths, expandPathResults, expandedPathsWithoutDups;

    beforeEach(function() {
      globString      = createSpy("glob string");
      unexpandedPaths = [createSpy("unexpanded path 1"), createSpy("unexpanded path 2")];
      expandedPaths   = [createSpy("expanded path 1-1"), createSpy("expanded path 1-2"), createSpy("expanded path 2-1")];
      expandPathResults = [[expandedPaths[0], expandedPaths[1]], [expandedPaths[2]]];
      epxandedPathsWithoutDups = createSpy("expanded paths without duplicates");
      spyOn(PathExpander, 'expandPathWithGlobString').andReturnSeveral(expandPathResults);
      spyOn(_, 'uniq').andReturn(expandedPathsWithoutDups);
    });

    it("expands each path", function() {
      PathExpander.expandPathsWithGlobString(unexpandedPaths, globString);
      unexpandedPaths.forEach(function(unexpandedPath) {
        expect(PathExpander.expandPathWithGlobString).toHaveBeenCalledWith(unexpandedPath, globString);
      });
    });

    it("removes duplicate expanded paths", function() {
      PathExpander.expandPathsWithGlobString(unexpandedPaths);
      expect(_.uniq).toHaveBeenCalledWith(expandedPaths);
    });

    it("returns the expanded paths", function() {
      expect(PathExpander.expandPathsWithGlobString(unexpandedPaths)).toEqual(expandedPathsWithoutDups);
    });
  });

  describe("expandPathWithGlobString()", function() {
    var fs   = require('fs');
    var glob = require('glob');
    var path, globString, stats, realPath;

    beforeEach(function() {
      path       = createSpy("path");
      globString = "this/is/the/glob/**/*.string";
      stats      = createSpyWithStubs("path stats", {isDirectory: null});
      spyOn(fs, 'statSync').andReturn(stats);
      realPath   = "/real/path";
      spyOn(fs, 'realpathSync').andReturn(realPath);
    });

    it("synchronously gets the absolute representation of the path", function() {
      PathExpander.expandPathWithGlobString(path);
      expect(fs.realpathSync).toHaveBeenCalledWith(path);
    });

    it("synchronously stats the path", function() {
      PathExpander.expandPathWithGlobString(path);
      expect(fs.statSync).toHaveBeenCalledWith(realPath);
    });

    it("checks wether the path points to a directory or not", function() {
      PathExpander.expandPathWithGlobString(path);
      expect(stats.isDirectory).toHaveBeenCalled();
    });

    describe("when the path points to a directory", function() {
      var globResults;

      beforeEach(function() {
        stats.isDirectory.andReturn(true);
        globResults = createSpy("glob results");
        spyOn(glob, 'globSync').andReturn(globResults);
      });

      it("searches for files matching the glob in all subdirectories", function() {
        PathExpander.expandPathWithGlobString(path, globString);
        expect(glob.globSync).toHaveBeenCalledWith(realPath + "/" + globString);
      });

      it("returns the glob results", function() {
        expect(PathExpander.expandPathWithGlobString(path)).toBe(globResults);
      });
    });

    describe("when the path does not point to a directory", function() {
      beforeEach(function() {
        stats.isDirectory.andReturn(false);
      });

      it("returns an array with the absolute path as its only item", function() {
        expect(PathExpander.expandPathWithGlobString(path)).toEqual([realPath]);
      });
    });
  });
});
