require('./support/spec_helper');

describe("Cucumber", function() {
  var Cucumber = require('cucumber');
  var featuresSource;
  var supportCodeDefinition;
  var cucumber;
  var supportCodeLibrary, listenerCollection;

  beforeEach(function() {
    listenerCollection    = createSpyWithStubs("listener collection", {add: null});
    spyOn(Cucumber.Types, 'Collection').andReturn(listenerCollection);
    featuresSource        = createSpy("features source buffer");
    supportCodeDefinition = createSpy("support code definition");
    supportCodeLibrary    = createSpy("support code library");
    cucumber              = Cucumber(featuresSource, supportCodeDefinition);
  });

  describe("constructor", function() {
    it("creates a listener collection", function() {
      expect(Cucumber.Types.Collection).toHaveBeenCalled();
    });
  });

  describe("attachListener()", function() {
    it("adds the listener to the listener collection", function() {
      var listener = createSpy("AST tree listener");
      cucumber.attachListener(listener);
      expect(listenerCollection.add).toHaveBeenCalledWith(listener);
    });
  });

  describe("start()", function() {
    var featuresAstElement, callback;

    beforeEach(function() {
      featuresAstElement = createSpy("Features AST element");
      callback           = createSpy("Callback");
      spyOn(cucumber, 'parseFeaturesSource').andReturn(featuresAstElement);
      spyOn(cucumber, 'executeFeaturesAgainstSupportCodeLibrary');
      spyOn(cucumber, 'initializeSupportCode').andReturn(supportCodeLibrary);
    });

    it("fails when no callback is passed", function() {
      var exception;
      try { cucumber.start(); } catch(err) { exception = err; }
      expect(exception).toBeDefined();
    });
    
    it("fails when the passed callback is not a function", function() {
      var exception;
      try { cucumber.start("some string"); } catch(err) { exception = err; }
      expect(exception).toBeDefined();
    });

    it("parses the features source", function() {
      cucumber.start(callback);
      expect(cucumber.parseFeaturesSource).toHaveBeenCalledWith(featuresSource);
    });

    it("initiliazes the support code", function() {
      cucumber.start(callback);
      expect(cucumber.initializeSupportCode).toHaveBeenCalledWith(supportCodeDefinition);
    });
    
    it("executes the features", function() {
      cucumber.start(callback);
      expect(cucumber.executeFeaturesAgainstSupportCodeLibrary).toHaveBeenCalledWith(featuresAstElement, supportCodeLibrary, callback);
    });
  });

  describe("parseFeaturesSource()", function() {
    var parser, features;
    
    beforeEach(function() {
      features = createSpy("Features AST element");
      parser = createSpyWithStubs('A parser', {parse: features});
      spyOn(Cucumber, "Parser").andReturn(parser);
    });

    it("creates a new parser", function() {
      cucumber.parseFeaturesSource(featuresSource);
      expect(Cucumber.Parser).toHaveBeenCalledWith(featuresSource);
    });
    
    it("asks the parser to parse", function() {
      cucumber.parseFeaturesSource(featuresSource);
      expect(Cucumber.Parser).toHaveBeenCalled();
    });

    it("it returns the parsed features", function() {
      expect(cucumber.parseFeaturesSource(featuresSource)).toBe(features);
    });
  });

  describe("initializeSupportCode()", function() {
    beforeEach(function() {
      spyOn(Cucumber.SupportCode, 'Library').andReturn(supportCodeLibrary);
    });
    
    it("creates a new support code library", function() {
      cucumber.initializeSupportCode(supportCodeDefinition);
      expect(Cucumber.SupportCode.Library).toHaveBeenCalledWith(supportCodeDefinition);
    });

    it("returns the support code library", function() {
      expect(cucumber.initializeSupportCode(supportCodeDefinition)).toBe(supportCodeLibrary);
    });
  });

  describe("executeFeaturesAgainstSupportCodeLibrary()", function() {
    var features, supportCodeLibrary, callback;
    var treeWalker;

    beforeEach(function() {
      supportCodeLibrary = createSpy("support code library");
      features   = createSpy("Features AST element");
      callback   = createSpy("Callback");
      treeWalker = createSpyWithStubs("AST tree walker", {walk: null});
      spyOn(Cucumber.Ast, 'TreeWalker').andReturn(treeWalker);
    });

    it("creates an AST tree walker giving it the features AST element from the parser and the listeners it will talk to", function() {
      cucumber.executeFeaturesAgainstSupportCodeLibrary(features, supportCodeLibrary, callback);
      expect(Cucumber.Ast.TreeWalker).toHaveBeenCalledWith(features, supportCodeLibrary, listenerCollection);
    });

    it("asks the tree walker to walk", function() {
      cucumber.executeFeaturesAgainstSupportCodeLibrary(features, supportCodeLibrary, callback);
      expect(treeWalker.walk).toHaveBeenCalledWith(callback);
    });
  });
});
