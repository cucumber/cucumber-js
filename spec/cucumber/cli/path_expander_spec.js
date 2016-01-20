require('../../support/spec_helper');

describe("Cucumber.Cli.ArgumentParser.PathExpander", function () {
  var PathExpander = requireLib('cucumber').Cli.PathExpander;

  describe("expandPathsWithExtensions", function () {
    var unexpandedPaths, extensions, expandedPaths;

    beforeEach(function () {
      extensions      = createSpy("extensions");
      unexpandedPaths = [createSpy("unexpanded path 1"), createSpy("unexpanded path 2")];
      expandedPaths   = [createSpy("expanded path 1-1"), createSpy("expanded path 1-2"), createSpy("expanded path 2-1")];
      spyOn(PathExpander, 'expandPathWithExtensions').and.returnValues([expandedPaths[0], expandedPaths[1]], [expandedPaths[1], expandedPaths[2]]);
    });

    it("expands each path", function () {
      PathExpander.expandPathsWithExtensions(unexpandedPaths, extensions);
      unexpandedPaths.forEach(function (unexpandedPath) {
        expect(PathExpander.expandPathWithExtensions).toHaveBeenCalledWith(unexpandedPath, extensions);
      });
    });

    it("returns the expanded paths without duplicates", function () {
      expect(PathExpander.expandPathsWithExtensions(unexpandedPaths)).toEqual(expandedPaths);
    });
  });

  describe("expandPathWithExtensions()", function () {
    var fs   = require('fs');
    var path, extensions, stats, realPath, pathsFromExpandedDirectory;

    beforeEach(function () {
      path       = "relative/path";
      extensions = createSpy("extensions");
      stats      = createSpyWithStubs("path stats", {isDirectory: null});
      spyOn(fs, 'statSync').and.returnValue(stats);
      realPath   = "/real/path";
      spyOn(fs, 'realpathSync').and.returnValue(realPath);
      pathsFromExpandedDirectory = createSpy("paths from expanded directory");
      spyOn(PathExpander, 'expandDirectoryWithExtensions').and.returnValue(pathsFromExpandedDirectory);
    });

    it("synchronously gets the absolute representation of the path after", function () {
      PathExpander.expandPathWithExtensions(path, extensions);
      expect(fs.realpathSync).toHaveBeenCalledWith('relative/path');
    });

    it("synchronously stats the path", function () {
      PathExpander.expandPathWithExtensions(path, extensions);
      expect(fs.statSync).toHaveBeenCalledWith(realPath);
    });

    it("checks whether the path points to a directory or not", function () {
      PathExpander.expandPathWithExtensions(path, extensions);
      expect(stats.isDirectory).toHaveBeenCalled();
    });

    describe("when the path points to a directory", function () {
      beforeEach(function () {
        stats.isDirectory.and.returnValue(true);
      });

      it("expands the directory", function () {
        PathExpander.expandPathWithExtensions(path, extensions);
        expect(PathExpander.expandDirectoryWithExtensions).toHaveBeenCalledWith(realPath, extensions);
      });

      it("returns the paths expanded from the directory", function () {
        expect(PathExpander.expandPathWithExtensions(path, extensions)).toBe(pathsFromExpandedDirectory);
      });
    });

    describe("when the path does not point to a directory", function () {
      beforeEach(function () {
        stats.isDirectory.and.returnValue(false);
      });

      it("returns an array with the absolute path as its only item", function () {
        expect(PathExpander.expandPathWithExtensions(path, extensions)).toEqual([realPath]);
      });
    });
  });

  describe("expandDirectoryWithExtensions()", function () {
    var glob = require('glob');
    var directory, extensions, innerPaths;

    beforeEach(function () {
      directory  = "path/to/directory";
      extensions = ['js'];
      innerPaths = [createSpy("inner path 1"), createSpy("inner path 2"), createSpy("inner path 3")];
      spyOn(glob, 'sync').and.returnValue(innerPaths);
    });

    it("returns the glob result", function () {
      var paths = PathExpander.expandDirectoryWithExtensions(directory, extensions);
      expect(paths).toEqual(innerPaths);
    });

    describe('one extension', function() {
      it("calls glob with the proper pattern", function () {
        PathExpander.expandDirectoryWithExtensions(directory, extensions);
        expect(glob.sync).toHaveBeenCalledWith("path/to/directory/**/*.js");
      });
    });

    describe('multiple extension', function() {
      beforeEach(function () {
        extensions = ['js', 'coffee'];
      });

      it("calls glob with the proper pattern", function () {
        PathExpander.expandDirectoryWithExtensions(directory, extensions);
        expect(glob.sync).toHaveBeenCalledWith("path/to/directory/**/*.{js,coffee}");
      });
    });
  });
});
