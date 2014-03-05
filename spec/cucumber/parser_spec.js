require('../support/spec_helper');

describe("Cucumber.Parser", function () {
  var Cucumber = requireLib('cucumber');
  var parser, featureSources;
  var features, astFilter, astAssembler;

  beforeEach(function () {
    features       = createSpy("Root 'features' AST element");
    astFilter      = createSpy("AST filter");
    featureSources = [
      ["(feature:1)", createSpyWithStubs('first feature source', {toString:"first feature source"})],
      ["(feature:2)", createSpyWithStubs('second feature source', {toString:"# language: fr\nsecond feature source"})]
    ];
    astAssembler   = createSpy("AST assembler");
    spyOn(Cucumber.Ast, 'Features').andReturn(features);
    spyOn(Cucumber.Ast, 'Assembler').andReturn(astAssembler);
    parser = Cucumber.Parser(featureSources, astFilter);
  });

  describe("constructor", function () {
    it("creates a new AST features element", function () {
      expect(Cucumber.Ast.Features).toHaveBeenCalled();
    });

    it("instantiates an AST assembler", function () {
      expect(Cucumber.Ast.Assembler).toHaveBeenCalledWith(features, astFilter);
    });
  });

  describe("parse()", function () {
    var Gherkin = require('gherkin');
    var gherkinENLexerConstructor, gherkinFRLexerConstructor, gherkinENLexer, gherkinFRLexer;
    var eventHandlers;

    beforeEach(function () {
      gherkinENLexer = createSpyWithStubs("English gherkin lexer instance", {scan: null});
      gherkinFRLexer = createSpyWithStubs("French gherkin lexer instance", {scan: null});
      gherkinENLexerConstructor = createSpy("English gherkin lexer constructor").andReturn(gherkinENLexer);
      gherkinFRLexerConstructor = createSpy("French gherkin lexer constructor").andReturn(gherkinFRLexer);
      spyOn(Gherkin, 'Lexer').andCallFake(
        function(language){
          if(language == 'en') {
            return gherkinENLexerConstructor;
          } else if(language == 'fr') {
            return gherkinFRLexerConstructor;
          } else {
            throw "Could not instantiate a parser for this language"
          }
        }
      );
      eventHandlers = createSpy("Parser event handlers");
      spyOn(parser, 'getEventHandlers').andReturn(eventHandlers);
      spyOn(parser, 'setCurrentSourceUri');
    });

    it("gets the parse event handlers", function () {
      parser.parse();
      expect(parser.getEventHandlers).toHaveBeenCalled();
    });

    it("creates a gherkin lexer for the English language", function () {
      parser.parse();
      expect(Gherkin.Lexer).toHaveBeenCalledWith('en');
      expect(gherkinENLexerConstructor).toHaveBeenCalledWith(eventHandlers);
    });


    it("creates a gherkin lexer for the French language", function () {
      parser.parse();
      expect(Gherkin.Lexer).toHaveBeenCalledWith('fr');
      expect(gherkinFRLexerConstructor).toHaveBeenCalledWith(eventHandlers);
    });

    it("sets the uri of each feature source", function () {
      parser.parse();
      expect(parser.setCurrentSourceUri).toHaveBeenCalledWith(featureSources[0][0]);
      expect(parser.setCurrentSourceUri).toHaveBeenCalledWith(featureSources[1][0]);
    });

    it("asks the English lexer to scan the first feature source", function () {
      parser.parse();
      expect(gherkinENLexer.scan).toHaveBeenCalledWith(featureSources[0][1]);
    });

    it("asks the French lexer to scan the second feature source", function () {
      parser.parse();
      expect(gherkinFRLexer.scan).toHaveBeenCalledWith(featureSources[1][1]);
    });
    
    it("returns the features root element", function () {
      expect(parser.parse()).toBe(features);
    });
  });

  describe("getCurrentSourceUri() [setCurrentSourceUri()]", function () {
    var uri;

    beforeEach(function () {
      uri = createSpy("uri");
    });

    it("returns the stored current source URI", function () {
      parser.setCurrentSourceUri(uri);
      expect(parser.getCurrentSourceUri()).toBe(uri);
    });
  });

  describe("getEventHandlers()", function () {
    var eventHandlers;

    it("provides a 'feature' handler", function () {
      spyOn(parser, 'handleFeature');
      eventHandlers = parser.getEventHandlers();
      expect(eventHandlers['feature']).toBe(parser.handleFeature);
    });

    it("provides a 'background' handler", function () {
      spyOn(parser, 'handleBackground');
      eventHandlers = parser.getEventHandlers();
      expect(eventHandlers['background']).toBe(parser.handleBackground);
    });

    it("provides a 'scenario' handler", function () {
      spyOn(parser, 'handleScenario');
      eventHandlers = parser.getEventHandlers();
      expect(eventHandlers['scenario']).toBe(parser.handleScenario);
    });

    it("provides a 'step' handler", function () {
      spyOn(parser, 'handleStep');
      eventHandlers = parser.getEventHandlers();
      expect(eventHandlers['step']).toBe(parser.handleStep);
    });

    it("provides a 'doc_string' handler", function () {
      spyOn(parser, 'handleDocString');
      eventHandlers = parser.getEventHandlers();
      expect(eventHandlers['doc_string']).toBe(parser.handleDocString);
    });

    it("provides a 'eof' handler", function () {
      spyOn(parser, 'handleEof');
      eventHandlers = parser.getEventHandlers();
      expect(eventHandlers['eof']).toBe(parser.handleEof);
    });

    it("provides a 'comment' handler", function () {
      spyOn(parser, 'handleComment');
      eventHandlers = parser.getEventHandlers();
      expect(eventHandlers['comment']).toBe(parser.handleComment);
    });

    it("provides a 'row' handler", function () {
      spyOn(parser, 'handleDataTableRow');
      eventHandlers = parser.getEventHandlers();
      expect(eventHandlers['row']).toBe(parser.handleDataTableRow);
    });

    it("provides a 'tag' handler", function () {
      spyOn(parser, 'handleTag');
      eventHandlers = parser.getEventHandlers();
      expect(eventHandlers['tag']).toBe(parser.handleTag);
    });

    it("provides a 'scenario_outline' handler", function () {
      spyOn(parser, 'handleScenarioOutline');
      eventHandlers = parser.getEventHandlers();
      expect(eventHandlers['scenario_outline']).toBe(parser.handleScenarioOutline);
    });

    it("provides an 'examples' handler", function () {
      spyOn(parser, 'handleExamples');
      eventHandlers = parser.getEventHandlers();
      expect(eventHandlers['examples']).toBe(parser.handleExamples);
    });
  });

  describe("handleBackground()", function () {
    var keyword, name, description, line;
    var background;

    beforeEach(function () {
      keyword        = createSpy("'background' keyword");
      name           = createSpy("name of the background");
      description    = createSpy("description of the background");
      uri            = createSpy("uri");
      line           = createSpy("line number");
      background     = createSpyWithStubs("background AST element");
      spyOn(parser, 'getCurrentSourceUri').andReturn(uri);
      spyOn(Cucumber.Ast, 'Background').andReturn(background);
      spyOnStub(astAssembler, 'insertBackground');
    });

    it("gets the current source URI", function () {
      parser.handleBackground(keyword, name, description, line);
      expect(parser.getCurrentSourceUri).toHaveBeenCalled();
    });

    it("creates a new background AST element", function () {
      parser.handleBackground(keyword, name, description, line);
      expect(Cucumber.Ast.Background).toHaveBeenCalledWith(keyword, name, description, uri, line);
    });

    it("tells the AST assembler to insert the background into the tree", function () {
      parser.handleBackground(keyword, name, description, line);
      expect(astAssembler.insertBackground).toHaveBeenCalledWith(background);
    });
  });

  describe("handleComment()", function () {
    it("exists but does nothing", function () {
      parser.handleComment();
    });
  });

  describe("handleDocString()", function () {
    var contentType, string, uri, line;
    var docString;

    beforeEach(function () {
      contentType = createSpy("DocString's content type");
      string      = createSpy("DocString's actual string");
      uri         = createSpy("uri");
      line        = createSpy("line number");
      docString   = createSpy("DocString AST element");
      spyOn(parser, 'getCurrentSourceUri').andReturn(uri);
      spyOn(Cucumber.Ast, 'DocString').andReturn(docString);
      spyOnStub(astAssembler, 'insertDocString');
    });

    it("gets the current source URI", function () {
      parser.handleDocString(contentType, string, line);
      expect(parser.getCurrentSourceUri).toHaveBeenCalled();
    });

    it("creates a new DocString AST element", function () {
      parser.handleDocString(contentType, string, line);
      expect(Cucumber.Ast.DocString).toHaveBeenCalledWith(contentType, string, uri, line);
    });

    it("tells the AST assembler to insert the DocString into the tree", function () {
      parser.handleDocString(contentType, string, line);
      expect(astAssembler.insertDocString).toHaveBeenCalledWith(docString);
    });
  });

  describe("handleEof()", function () {
    beforeEach(function () {
      spyOnStub(astAssembler, 'finish');
    });

    it("tells the assembler to finish its duty", function () {
      parser.handleEof();
      expect(astAssembler.finish).toHaveBeenCalled();
    });
  });

  describe("handleFeature()", function () {
    var keyword, name, description, uri, line;
    var feature;

    beforeEach(function () {
      keyword     = createSpy("'feature' keyword");
      name        = createSpy("Name of the feature");
      description = createSpy("Description of the feature");
      uri         = createSpy("uri");
      line        = createSpy("Line number");
      feature     = createSpyWithStubs("Feature AST element");
      spyOn(parser, 'getCurrentSourceUri').andReturn(uri);
      spyOn(Cucumber.Ast, 'Feature').andReturn(feature);
      spyOnStub(astAssembler, 'insertFeature');
    });

    it("gets the current source URI", function () {
      parser.handleFeature(keyword, name, description, line);
      expect(parser.getCurrentSourceUri).toHaveBeenCalled();
    });

    it("creates a new feature AST element", function () {
      parser.handleFeature(keyword, name, description, line);
      expect(Cucumber.Ast.Feature).toHaveBeenCalledWith(keyword, name, description, uri, line);
    });

    it("tells the AST assembler to insert the feature into the tree", function () {
      parser.handleFeature(keyword, name, description, line);
      expect(astAssembler.insertFeature).toHaveBeenCalledWith(feature);
    });
  });

  describe("handleDataTableRow()", function () {
    var cells, uri, line;
    var dataTableRow;

    beforeEach(function () {
      dataTableRow = createSpy("data table row");
      cells        = createSpy("data table cells");
      uri          = createSpy("uri");
      line         = createSpy("line");
      spyOn(parser, 'getCurrentSourceUri').andReturn(uri);
      spyOn(Cucumber.Ast.DataTable, 'Row').andReturn(dataTableRow);
      spyOnStub(astAssembler, 'insertDataTableRow');
    });

    it("gets the current source URI", function () {
      parser.handleDataTableRow(cells, line);
      expect(parser.getCurrentSourceUri).toHaveBeenCalled();
    });

    it("creates a new data table row AST element", function () {
      parser.handleDataTableRow(cells, line);
      expect(Cucumber.Ast.DataTable.Row).toHaveBeenCalledWith(cells, uri, line);
    });

    it("tells the AST assembler to insert the data table row into the tree", function () {
      parser.handleDataTableRow(cells, line);
      expect(astAssembler.insertDataTableRow).toHaveBeenCalledWith(dataTableRow);
    });
  });

  describe("handleScenario()", function () {
    var keyword, name, description, uri, line;
    var scenario;

    beforeEach(function () {
      keyword     = createSpy("'scenario' keyword");
      name        = createSpy("Name of the scenario");
      description = createSpy("Description of the scenario");
      uri         = createSpy("uri");
      line        = createSpy("Line number");
      scenario    = createSpyWithStubs("Scenario AST element");
      spyOn(parser, 'getCurrentSourceUri').andReturn(uri);
      spyOn(Cucumber.Ast, 'Scenario').andReturn(scenario);
      spyOnStub(astAssembler, 'insertScenario');
    });

    it("gets the current source URI", function () {
      parser.handleScenario(keyword, name, description, line);
      expect(parser.getCurrentSourceUri).toHaveBeenCalled();
    });

    it("creates a new scenario AST element", function () {
      parser.handleScenario(keyword, name, description, line);
      expect(Cucumber.Ast.Scenario).toHaveBeenCalledWith(keyword, name, description, uri, line);
    });

    it("tells the AST assembler to insert the scenario into the tree", function () {
      parser.handleScenario(keyword, name, description, line);
      expect(astAssembler.insertScenario).toHaveBeenCalledWith(scenario);
    });
  });

  describe("handleStep()", function () {
    var keyword, name, uri, line;
    var step;

    beforeEach(function () {
      keyword         = createSpy("'step' keyword");
      name            = createSpy("name of the step");
      uri             = createSpy("uri");
      line            = createSpy("line number");
      step            = createSpy("step AST element");
      spyOn(parser, 'getCurrentSourceUri').andReturn(uri);
      spyOn(Cucumber.Ast, 'Step').andReturn(step);
      spyOnStub(astAssembler, 'insertStep');
    });

    it("gets the current source URI", function () {
      parser.handleStep(keyword, name, line);
      expect(parser.getCurrentSourceUri).toHaveBeenCalled();
    });

    it("creates a new step AST element", function () {
      parser.handleStep(keyword, name, line);
      expect(Cucumber.Ast.Step).toHaveBeenCalledWith(keyword, name, uri, line);
    });

    it("tells the AST assembler to insert the step into the tree", function () {
      parser.handleStep(keyword, name, line);
      expect(astAssembler.insertStep).toHaveBeenCalledWith(step);
    });
  });

  describe("handleTag()", function () {
    var name, uri, line;

    beforeEach(function () {
      name = createSpy("tag name");
      uri  = createSpy("uri");
      line = createSpy("line number");
      tag  = createSpy("tag AST element");
      spyOn(parser, 'getCurrentSourceUri').andReturn(uri);
      spyOn(Cucumber.Ast, 'Tag').andReturn(tag);
      spyOnStub(astAssembler, 'insertTag');
    });

    it("gets the current source URI", function () {
      parser.handleTag(name, line);
      expect(parser.getCurrentSourceUri).toHaveBeenCalled();
    });

    it("creates a new tag AST element", function () {
      parser.handleTag(name, line);
      expect(Cucumber.Ast.Tag).toHaveBeenCalledWith(name, uri, line);
    });

    it("tells the AST assembler to insert the tag into the tree", function () {
      parser.handleTag(name, line);
      expect(astAssembler.insertTag).toHaveBeenCalledWith(tag);
    });
  });

  describe("handleScenarioOutline()", function () {
    it("throws an error", function () {
      expect(parser.handleScenarioOutline).toThrow();
    });
  });

  describe("handleExamples()", function () {
    it("throws an error", function () {
      expect(parser.handleExamples).toThrow();
    });
  });
});
