require('../../support/spec_helper');

describe("Cucumber.Cli.SupportCodeLoader", function() {
  var Cucumber = requireLib('cucumber');
  var fs       = require('fs');

  var supportCodeLoader, supportCodeFilePaths, primeSupportCodeFilePaths, secondarySupportCodeFilePaths;
  var supportCodeInitializer, supportCodeLibrary;

  beforeEach(function() {
    supportCodeFilePaths          = [createSpyWithStubs("first secondary support code file path",  {match: false}),
                                     createSpyWithStubs("first prime support code file path",      {match: true}),
                                     createSpyWithStubs("second prime support code file path",     {match: true}),
                                     createSpyWithStubs("second secondary support code file path", {match: false})];
    primeSupportCodeFilePaths     = [supportCodeFilePaths[1], supportCodeFilePaths[2]];
    secondarySupportCodeFilePaths = [supportCodeFilePaths[0], supportCodeFilePaths[3]];
    supportCodeLoader             = Cucumber.Cli.SupportCodeLoader(supportCodeFilePaths);
  });

  describe("getSupportCodeLibrary()", function() {
    beforeEach(function() {
      supportCodeInitializer  = createSpy("support code initializer function");
      supportCodeLibrary      = createSpy("support code library");
      spyOn(supportCodeLoader, 'getSupportCodeInitializer').andReturn(supportCodeInitializer);
      spyOn(Cucumber.SupportCode, 'Library').andReturn(supportCodeLibrary);
    });

    it("gets the support code initializer function", function() {
      supportCodeLoader.getSupportCodeLibrary();
      expect(supportCodeLoader.getSupportCodeInitializer).toHaveBeenCalled();
    });

    it("creates a new support code library with the initializer", function() {
      supportCodeLoader.getSupportCodeLibrary();
      expect(Cucumber.SupportCode.Library).toHaveBeenCalledWith(supportCodeInitializer);
    });

    it("returns the support code library", function() {
      expect(supportCodeLoader.getSupportCodeLibrary()).toBe(supportCodeLibrary);
    });
  });

  describe("getSupportCodeInitializer()", function() {
    var primeSupportCodeInitializer, secondarySupportCodeInitializer;

    beforeEach(function() {
      primeSupportCodeInitializer     = createSpy("prime support code initializer");
      secondarySupportCodeInitializer = createSpy("secondary support code initializer");
      spyOn(supportCodeLoader, 'getPrimeSupportCodeInitializer').andReturn(primeSupportCodeInitializer);
      spyOn(supportCodeLoader, 'getSecondarySupportCodeInitializer').andReturn(secondarySupportCodeInitializer);
    });

    it("gets the prime support code", function() {
      supportCodeLoader.getSupportCodeInitializer();
      expect(supportCodeLoader.getPrimeSupportCodeInitializer).toHaveBeenCalled();
    });

    it("gets the secondary support code", function() {
      supportCodeLoader.getSupportCodeInitializer();
      expect(supportCodeLoader.getSecondarySupportCodeInitializer).toHaveBeenCalled();
    });

    it("returns a function", function() {
      expect(supportCodeLoader.getSupportCodeInitializer()).toBeAFunction();
    });

    describe("returned function", function() {
      var initializerFunction, supportCodeHelper;

      beforeEach(function() {
        initializerFunction = supportCodeLoader.getSupportCodeInitializer();
        supportCodeHelper   = createSpy("support code helper");
      });

      it("calls the prime support code", function() {
        initializerFunction.call(supportCodeHelper);
        expect(primeSupportCodeInitializer).toHaveBeenCalled();
      });

      it("calls the prime support code with the support code helper as 'this'", function() {
        initializerFunction.call(supportCodeHelper);
        expect(primeSupportCodeInitializer.mostRecentCall.object).toBe(supportCodeHelper);
      });

      it("calls the secondary support code", function() {
        initializerFunction.call(supportCodeHelper);
        expect(secondarySupportCodeInitializer).toHaveBeenCalled();
      });

      it("calls the secondary support code with the support code helper as 'this'", function() {
        initializerFunction.call(supportCodeHelper);
        expect(secondarySupportCodeInitializer.mostRecentCall.object).toBe(supportCodeHelper);
      });
    });
  });

  describe("getPrimeSupportCodeInitializer()", function() {
    var primeSupportCodeInitializer;

    beforeEach(function() {
      primeSupportCodeInitializer = createSpy("prime support code initializer");
      spyOn(supportCodeLoader, 'getPrimeSupportCodeFilePaths').andReturn(primeSupportCodeFilePaths);
      spyOn(supportCodeLoader, 'buildSupportCodeInitializerFromPaths').andReturn(primeSupportCodeInitializer);
    });

    it("gets the prime support code file paths", function() {
      supportCodeLoader.getPrimeSupportCodeInitializer();
      expect(supportCodeLoader.getPrimeSupportCodeFilePaths).toHaveBeenCalled();
    });

    it("builds the support code initializer from the paths", function() {
      supportCodeLoader.getPrimeSupportCodeInitializer();
      expect(supportCodeLoader.buildSupportCodeInitializerFromPaths).toHaveBeenCalledWith(primeSupportCodeFilePaths);
    });

    it("returns the support code initializer built from the paths", function() {
      expect(supportCodeLoader.getPrimeSupportCodeInitializer()).toBe(primeSupportCodeInitializer);
    });
  });

  describe("getPrimeSupportCodeFilePaths()", function() {
    it("for each support code file path, checks whether they match the prime support code directory name convention", function() {
      supportCodeLoader.getPrimeSupportCodeFilePaths();
      supportCodeFilePaths.forEach(function(path) {
        expect(path.match).toHaveBeenCalledWith(Cucumber.Cli.SupportCodeLoader.PRIME_SUPPORT_CODE_PATH_REGEXP);
      });
    });

    it("returns the paths that matched the prime support code directory name convention", function() {
      expect(supportCodeLoader.getPrimeSupportCodeFilePaths()).toEqual(primeSupportCodeFilePaths);
    });
  });

  describe("getSecondarySupportCodeInitializer()", function() {
    var secondarySupportCodeInitializer;

    beforeEach(function() {
      secondarySupportCodeInitializer = createSpy("secondary support code initializer");
      spyOn(supportCodeLoader, 'getSecondarySupportCodeFilePaths').andReturn(secondarySupportCodeFilePaths);
      spyOn(supportCodeLoader, 'buildSupportCodeInitializerFromPaths').andReturn(secondarySupportCodeInitializer);
    });

    it("gets the secondary support code file paths", function() {
      supportCodeLoader.getSecondarySupportCodeInitializer();
      expect(supportCodeLoader.getSecondarySupportCodeFilePaths).toHaveBeenCalled();
    });

    it("builds the support code initializer from the paths", function() {
      supportCodeLoader.getSecondarySupportCodeInitializer();
      expect(supportCodeLoader.buildSupportCodeInitializerFromPaths).toHaveBeenCalledWith(secondarySupportCodeFilePaths);
    });

    it("returns the support code initializer built from the paths", function() {
      expect(supportCodeLoader.getSecondarySupportCodeInitializer()).toBe(secondarySupportCodeInitializer);
    });
  });

  describe("getSecondarySupportCodeFilePaths()", function() {
    it("for each support code file path, checks whether they match the prime support code directory name convention", function() {
      supportCodeLoader.getSecondarySupportCodeFilePaths();
      supportCodeFilePaths.forEach(function(path) {
        expect(path.match).toHaveBeenCalledWith(Cucumber.Cli.SupportCodeLoader.PRIME_SUPPORT_CODE_PATH_REGEXP);
      });
    });

    it("returns the paths that did not match the prime support code directory name convention", function() {
      expect(supportCodeLoader.getSecondarySupportCodeFilePaths()).toEqual(secondarySupportCodeFilePaths);
    });
  });

  describe("buildSupportCodeInitializerFromPaths()", function() {
    var paths;

    beforeEach(function() {
      paths = [
        fs.realpathSync(__dirname + "/../../support/initializer_stub1.js"),
        fs.realpathSync(__dirname + "/../../support/initializer_stub2.js"),
        fs.realpathSync(__dirname + "/../../support/initializer_stub3.js")
      ];
    });

    it("returns a function that wraps the initializers", function() {
      expect(supportCodeLoader.buildSupportCodeInitializerFromPaths(paths)).toBeAFunction();
    });

    describe("returned wrapper function", function() {
      var initializers, returnedWrapperFunction, supportCodeHelper;
      var nonInitializerSupportCodeCalled;

      beforeEach(function() {
        nonInitializerSupportCode = { call: function() { nonInitializerSupportCodeCalled = true } };
        nonInitializerSupportCodeCalled = false;
        initializers = [
          spyOnModule(paths[0]),
          spyOnModule(paths[1])
        ];
        spyOnModuleAndReturn(paths[2], nonInitializerSupportCode);
        returnedWrapperFunction = supportCodeLoader.buildSupportCodeInitializerFromPaths(paths);
        supportCodeHelper       = createSpy("support code helper");
      });

      it("requires each initializer", function() {
        returnedWrapperFunction.call(supportCodeHelper);
        initializers.forEach(function(initializer) {
          expect(initializer).toHaveBeenRequired();
        });
      });

      it("calls each initializer function", function() {
        returnedWrapperFunction.call(supportCodeHelper);
        initializers.forEach(function(initializer) {
          expect(initializer).toHaveBeenCalled();
        });
      });

      it("does not call non-functions (non-initializer support code)", function() {
        returnedWrapperFunction.call(supportCodeHelper);
        expect(nonInitializerSupportCodeCalled).toBeFalsy();
      });

      it("calls each initializer function with the support code helper as 'this'", function() {
        returnedWrapperFunction.call(supportCodeHelper);
        initializers.forEach(function(initializer) {
          expect(initializer.mostRecentCall.object).toBe(supportCodeHelper);
        });
      });
    });
  });
});
