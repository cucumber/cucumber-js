require('../support/spec_helper');

describe("Cucumber.Runtime", function () {
  var Cucumber = requireLib('cucumber');
  var configuration;
  var runtime;
  var listeners;
  var isStrictRequested;

  beforeEach(function () {
    isStrictRequested = false;
    listeners     = createSpyWithStubs("listener collection", {add: null});
    configuration = createSpyWithStubs("configuration", { isStrictRequested: isStrictRequested, shouldFilterStackTraces: true });
    spyOn(Cucumber.Type, 'Collection').andReturn(listeners);
    spyOn(Cucumber.Runtime.StackTraceFilter, 'filter');
    spyOn(Cucumber.Runtime.StackTraceFilter, 'unfilter');
    runtime       = Cucumber.Runtime(configuration);
  });

  describe("constructor", function () {
    it("creates a listener collection", function () {
      expect(Cucumber.Type.Collection).toHaveBeenCalled();
    });
  });

  describe("attachListener()", function () {
    it("adds the listener to the listener collection", function () {
      var listener = createSpy("AST tree listener");
      runtime.attachListener(listener);
      expect(listeners.add).toHaveBeenCalledWith(listener);
    });
  });

  describe("start()", function () {
    var features, supportCodeLibrary, callback, astTreeWalker;

    beforeEach(function () {
      features           = createSpy("features (AST)");
      supportCodeLibrary = createSpy("support code library");
      astTreeWalker      = createSpyWithStubs("AST tree walker", {walk: null});
      callback           = createSpy("callback");
      spyOn(runtime, 'getFeatures').andReturn(features);
      spyOn(runtime, 'getSupportCodeLibrary').andReturn(supportCodeLibrary);
      spyOn(Cucumber.Runtime, 'AstTreeWalker').andReturn(astTreeWalker);
    });

    it("fails when no callback is passed", function () {
      var exception;
      try { runtime.start(); } catch(err) { exception = err; }
      expect(exception).toBeDefined();
    });

    it("fails when the passed callback is not a function", function () {
      var exception;
      try { runtime.start("some string"); } catch(err) { exception = err; }
      expect(exception).toBeDefined();
    });

    it("gets the features", function () {
      runtime.start(callback);
      expect(runtime.getFeatures).toHaveBeenCalled();
    });

    it("gets the support code library", function () {
      runtime.start(callback);
      expect(runtime.getSupportCodeLibrary).toHaveBeenCalled();
    });

    it("creates a new AST tree walker", function () {
      runtime.start(callback);
      expect(Cucumber.Runtime.AstTreeWalker).toHaveBeenCalledWith(features, supportCodeLibrary, listeners, isStrictRequested);
    });

    describe("when stack traces should be filtered", function () {
      beforeEach(function () {
        configuration.shouldFilterStackTraces.andReturn(true);
      });

      it("activates the stack trace filter", function () {
        runtime.start(callback);
        expect(Cucumber.Runtime.StackTraceFilter.filter).toHaveBeenCalled();
      });
    });

    describe("when stack traces should be unfiltered", function () {
      beforeEach(function () {
        configuration.shouldFilterStackTraces.andReturn(false);
      });

      it("does not activate the stack trace filter", function () {
        runtime.start(callback);
        expect(Cucumber.Runtime.StackTraceFilter.filter).not.toHaveBeenCalled();
      });
    });

    it("tells the AST tree walker to walk", function () {
      runtime.start(callback);
      expect(astTreeWalker.walk).toHaveBeenCalledWithAFunctionAsNthParameter(1);
    });

    describe("when the AST tree walker is done walking", function () {
      var walkCallback, walkResults;

      beforeEach(function () {
        runtime.start(callback);
        walkCallback = astTreeWalker.walk.mostRecentCall.args[0];
        walkResults = createSpy("AST tree walker results");
      });

      it("deactivates the stack trace filter", function () {
        walkCallback(walkResults);
        expect(Cucumber.Runtime.StackTraceFilter.unfilter).toHaveBeenCalled();
      });

      it("calls back", function () {
        walkCallback(walkResults);
        expect(callback).toHaveBeenCalledWith(walkResults);
      });
    });
  });

  describe("getFeatures()", function () {
    var featureSources, astFilter, parser, features;

    beforeEach(function () {
      featureSources = createSpy("feature sources");
      astFilter      = createSpy("AST filter");
      features       = createSpy("features (AST)");
      parser         = createSpyWithStubs("parser", {parse: features});
      spyOnStub(configuration, 'getFeatureSources').andReturn(featureSources);
      spyOnStub(configuration, 'getAstFilter').andReturn(astFilter);
      spyOn(Cucumber, 'Parser').andReturn(parser);
    });

    it("gets the feature sources from the configuration", function () {
      runtime.getFeatures();
      expect(configuration.getFeatureSources).toHaveBeenCalled();
    });

    it("gets the AST filter from the configuration", function () {
      runtime.getFeatures();
      expect(configuration.getAstFilter).toHaveBeenCalled();
    });

    it("creates a new Cucumber parser for the feature sources", function () {
      runtime.getFeatures();
      expect(Cucumber.Parser).toHaveBeenCalledWith(featureSources, astFilter);
    });

    it("tells the parser to parse the features", function () {
      runtime.getFeatures();
      expect(parser.parse).toHaveBeenCalled();
    });

    it("returns the parsed features", function () {
      expect(runtime.getFeatures()).toBe(features);
    });
  });

  describe("getSupportCodeLibrary", function () {
    var supportCodeLibrary;

    beforeEach(function () {
      supportCodeLibrary = createSpy("support code library");
      spyOnStub(configuration, 'getSupportCodeLibrary').andReturn(supportCodeLibrary);
    });

    it("gets the support code library from the configuration", function () {
      runtime.getSupportCodeLibrary();
      expect(configuration.getSupportCodeLibrary).toHaveBeenCalled();
    });

    it("returns the support code library", function () {
      expect(runtime.getSupportCodeLibrary()).toBe(supportCodeLibrary);
    });
  });
});
