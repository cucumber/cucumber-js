require('../support/spec_helper');

describe("Cucumber.Runtime", function() {
  var Cucumber = requireLib('cucumber');
  var configuration;
  var runtime;
  var supportCodeLibrary, listeners;

  beforeEach(function() {
    listeners     = createSpyWithStubs("listener collection", {add: null});
    configuration = createSpy("configuration");
    spyOn(Cucumber.Type, 'Collection').andReturn(listeners);
    runtime       = Cucumber.Runtime(configuration);
  });

  describe("constructor", function() {
    it("creates a listener collection", function() {
      expect(Cucumber.Type.Collection).toHaveBeenCalled();
    });
  });

  describe("attachListener()", function() {
    it("adds the listener to the listener collection", function() {
      var listener = createSpy("AST tree listener");
      runtime.attachListener(listener);
      expect(listeners.add).toHaveBeenCalledWith(listener);
    });
  });

  describe("start()", function() {
    var features, supportCodeLibrary, callback, astTreeWalker;

    beforeEach(function() {
      features           = createSpy("features (AST)");
      supportCodeLibrary = createSpy("support code library");
      astTreeWalker      = createSpyWithStubs("AST tree walker", {walk: null});
      callback           = createSpy("callback");
      spyOn(runtime, 'getFeatures').andReturn(features);
      spyOn(runtime, 'getSupportCodeLibrary').andReturn(supportCodeLibrary);
      spyOn(Cucumber.Runtime, 'AstTreeWalker').andReturn(astTreeWalker);
    });

    it("fails when no callback is passed", function() {
      var exception;
      try { runtime.start(); } catch(err) { exception = err; }
      expect(exception).toBeDefined();
    });

    it("fails when the passed callback is not a function", function() {
      var exception;
      try { runtime.start("some string"); } catch(err) { exception = err; }
      expect(exception).toBeDefined();
    });

    it("gets the features", function() {
      runtime.start(callback);
      expect(runtime.getFeatures).toHaveBeenCalled();
    });

    it("gets the support code library", function() {
      runtime.start(callback);
      expect(runtime.getSupportCodeLibrary).toHaveBeenCalled();
    });

    it("creates a new AST tree walker", function() {
      runtime.start(callback);
      expect(Cucumber.Runtime.AstTreeWalker).toHaveBeenCalledWith(features, supportCodeLibrary, listeners);
    });

    it("tells the AST tree walker to walk", function() {
      runtime.start(callback);
      expect(astTreeWalker.walk).toHaveBeenCalledWith(callback);
    });
  });

  describe("getFeatures()", function() {
    var featureSources, astFilter, parser, features;

    beforeEach(function() {
      featureSources = createSpy("feature sources");
      astFilter      = createSpy("AST filter");
      features       = createSpy("features (AST)");
      parser         = createSpyWithStubs("parser", {parse: features});
      spyOnStub(configuration, 'getFeatureSources').andReturn(featureSources);
      spyOnStub(configuration, 'getAstFilter').andReturn(astFilter);
      spyOn(Cucumber, 'Parser').andReturn(parser);
    });

    it("gets the feature sources from the configuration", function() {
      runtime.getFeatures();
      expect(configuration.getFeatureSources).toHaveBeenCalled();
    });

    it("gets the AST filter from the configuration", function() {
      runtime.getFeatures();
      expect(configuration.getAstFilter).toHaveBeenCalled();
    });

    it("creates a new Cucumber parser for the feature sources", function() {
      runtime.getFeatures();
      expect(Cucumber.Parser).toHaveBeenCalledWith(featureSources, astFilter);
    });

    it("tells the parser to parse the features", function() {
      runtime.getFeatures();
      expect(parser.parse).toHaveBeenCalled();
    });

    it("returns the parsed features", function() {
      expect(runtime.getFeatures()).toBe(features);
    });
  });

  describe("getSupportCodeLibrary", function() {
    var supportCodeLibrary;

    beforeEach(function() {
      supportCodeLibrary = createSpy("support code library");
      spyOnStub(configuration, 'getSupportCodeLibrary').andReturn(supportCodeLibrary);
    });

    it("gets the support code library from the configuration", function() {
      runtime.getSupportCodeLibrary();
      expect(configuration.getSupportCodeLibrary).toHaveBeenCalled();
    });

    it("returns the support code library", function() {
      expect(runtime.getSupportCodeLibrary()).toBe(supportCodeLibrary);
    });
  });
});
