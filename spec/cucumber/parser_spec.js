require('../support/spec_helper');

describe("Cucumber.Parser", function() {
  var Cucumber = requireLib('cucumber');
  var parser, featureSources;
  var features, astFilter, astAssembler;

  beforeEach(function() {
    features       = createSpy("Root 'features' AST element");
    astFilter      = createSpy("AST filter");
    featureSources = [
      ["(feature:1)", createSpy('first feature source')],
      ["(feature:2)", createSpy('second feature source')]
    ];
    astAssembler   = createSpy("AST assembler");
    spyOn(Cucumber.Ast, 'Features').andReturn(features);
    spyOn(Cucumber.Ast, 'Assembler').andReturn(astAssembler);
    parser = Cucumber.Parser(featureSources, astFilter);
  });

  describe("constructor", function() {
    it("creates a new AST features element", function() {
      expect(Cucumber.Ast.Features).toHaveBeenCalled();
    });

    it("instantiates an AST assembler", function() {
      expect(Cucumber.Ast.Assembler).toHaveBeenCalledWith(features, astFilter);
    });
  });

  describe("parse()", function() {
    var Gherkin = require('gherkin');
    var gherkinLexerConstructor, gherkinLexer;
    var eventHandlers;

    beforeEach(function() {
      gherkinLexer            = createSpyWithStubs("Gherkin lexer instance", {scan: null});
      gherkinLexerConstructor = createSpy("Gherkin lexer module").andReturn(gherkinLexer);
      eventHandlers           = createSpy("Parser event handlers");
      spyOn(Gherkin, 'Lexer').andReturn(gherkinLexerConstructor);
      spyOn(parser, 'getEventHandlers').andReturn(eventHandlers);
    });

    it("loads the gherkin lexer module for English", function() {
      parser.parse();
      expect(Gherkin.Lexer).toHaveBeenCalledWith('en');
    });

    it("gets the parse event handlers", function() {
      parser.parse();
      expect(parser.getEventHandlers).toHaveBeenCalled();
    });

    it("creates a gherkin lexer", function() {
      parser.parse();
      expect(gherkinLexerConstructor).toHaveBeenCalledWith(eventHandlers);
    });

    it("asks the lexer to scan each feature source", function() {
      parser.parse();
      expect(gherkinLexer.scan).toHaveBeenCalledWith(featureSources[0][1]);
      expect(gherkinLexer.scan).toHaveBeenCalledWith(featureSources[1][1]);
    });

    it("returns the features root element", function() {
      expect(parser.parse()).toBe(features);
    });
  });

  describe("getEventHandlers()", function() {
    var eventHandlers;

    it("provides a 'feature' handler", function() {
      spyOn(parser, 'handleFeature');
      eventHandlers = parser.getEventHandlers();
      expect(eventHandlers['feature']).toBe(parser.handleFeature);
    });

    it("provides a 'background' handler", function() {
      spyOn(parser, 'handleBackground');
      eventHandlers = parser.getEventHandlers();
      expect(eventHandlers['background']).toBe(parser.handleBackground);
    });

    it("provides a 'scenario' handler", function() {
      spyOn(parser, 'handleScenario');
      eventHandlers = parser.getEventHandlers();
      expect(eventHandlers['scenario']).toBe(parser.handleScenario);
    });

    it("provides a 'step' handler", function() {
      spyOn(parser, 'handleStep');
      eventHandlers = parser.getEventHandlers();
      expect(eventHandlers['step']).toBe(parser.handleStep);
    });

    it("provides a 'doc_string' handler", function() {
      spyOn(parser, 'handleDocString');
      eventHandlers = parser.getEventHandlers();
      expect(eventHandlers['doc_string']).toBe(parser.handleDocString);
    });

    it("provides a 'eof' handler", function() {
      spyOn(parser, 'handleEof');
      eventHandlers = parser.getEventHandlers();
      expect(eventHandlers['eof']).toBe(parser.handleEof);
    });

    it("provides a 'comment' handler", function() {
      spyOn(parser, 'handleComment');
      eventHandlers = parser.getEventHandlers();
      expect(eventHandlers['comment']).toBe(parser.handleComment);
    });

    it("provides a 'row' handler", function() {
      spyOn(parser, 'handleDataTableRow');
      eventHandlers = parser.getEventHandlers();
      expect(eventHandlers['row']).toBe(parser.handleDataTableRow);
    });

    it("provides a 'tag' handler", function() {
      spyOn(parser, 'handleTag');
      eventHandlers = parser.getEventHandlers();
      expect(eventHandlers['tag']).toBe(parser.handleTag);
    });
  });

  describe("handleBackground()", function() {
    var keyword, name, description, line;
    var background;

    beforeEach(function() {
      keyword        = createSpy("'background' keyword");
      name           = createSpy("name of the background");
      description    = createSpy("description of the background");
      line           = createSpy("line number");
      background     = createSpyWithStubs("background AST element");
      spyOn(Cucumber.Ast, 'Background').andReturn(background);
      spyOnStub(astAssembler, 'insertBackground');
    });

    it("creates a new background AST element", function() {
      parser.handleBackground(keyword, name, description, line);
      expect(Cucumber.Ast.Background).toHaveBeenCalledWith(keyword, name, description, line);
    });

    it("tells the AST assembler to insert the background into the tree", function() {
      parser.handleBackground(keyword, name, description, line);
      expect(astAssembler.insertBackground).toHaveBeenCalledWith(background);
    });
  });

  describe("handleComment()", function() {
    it("exists but does nothing", function() {
      parser.handleComment();
    });
  });

  describe("handleDocString()", function() {
    var contentType, string, line;
    var docString;

    beforeEach(function() {
      contentType = createSpy("DocString's content type");
      string      = createSpy("DocString's actual string");
      line        = createSpy("line number");
      docString   = createSpy("DocString AST element");
      spyOn(Cucumber.Ast, 'DocString').andReturn(docString);
      spyOnStub(astAssembler, 'insertDocString');
    });

    it("creates a new DocString AST element", function() {
      parser.handleDocString(contentType, string, line);
      expect(Cucumber.Ast.DocString).toHaveBeenCalledWith(contentType, string, line);
    });

    it("tells the AST assembler to insert the DocString into the tree", function() {
      parser.handleDocString(contentType, string, line);
      expect(astAssembler.insertDocString).toHaveBeenCalledWith(docString);
    });
  });

  describe("handleEof()", function() {
    it("exists but does nothing", function() {
      parser.handleEof();
    });
  });

  describe("handleFeature()", function() {
    var keyword, name, description, line;
    var feature;

    beforeEach(function() {
      keyword     = createSpy("'feature' keyword");
      name        = createSpy("Name of the feature");
      description = createSpy("Description of the feature");
      line        = createSpy("Line number");
      feature     = createSpyWithStubs("Feature AST element");
      spyOn(Cucumber.Ast, 'Feature').andReturn(feature);
      spyOnStub(astAssembler, 'insertFeature');
    });

    it("creates a new feature AST element", function() {
      parser.handleFeature(keyword, name, description, line);
      expect(Cucumber.Ast.Feature).toHaveBeenCalledWith(keyword, name, description, line);
    });

    it("tells the AST assembler to insert the feature into the tree", function() {
      parser.handleFeature(keyword, name, description, line);
      expect(astAssembler.insertFeature).toHaveBeenCalledWith(feature);
    });
  });

  describe("handleDataTableRow()", function() {
    var cells, line;
    var dataTableRow;

    beforeEach(function() {
      dataTableRow = createSpy("data table row");
      cells        = createSpy("data table cells");
      line         = createSpy("line");
      spyOn(Cucumber.Ast.DataTable, 'Row').andReturn(dataTableRow);
      spyOnStub(astAssembler, 'insertDataTableRow');
    });

    it("creates a new data table row AST element", function() {
      parser.handleDataTableRow(cells, line);
      expect(Cucumber.Ast.DataTable.Row).toHaveBeenCalledWith(cells, line);
    });

    it("tells the AST assembler to insert the data table row into the tree", function() {
      parser.handleDataTableRow(cells, line);
      expect(astAssembler.insertDataTableRow).toHaveBeenCalledWith(dataTableRow);
    });
  });

  describe("handleScenario()", function() {
    var keyword, name, description, line;
    var scenario;

    beforeEach(function() {
      keyword        = createSpy("'scenario' keyword");
      name           = createSpy("Name of the scenario");
      description    = createSpy("Description of the scenario");
      line           = createSpy("Line number");
      scenario       = createSpyWithStubs("Scenario AST element");
      spyOn(Cucumber.Ast, 'Scenario').andReturn(scenario);
      spyOnStub(astAssembler, 'insertScenario');
    });

    it("creates a new scenario AST element", function() {
      parser.handleScenario(keyword, name, description, line);
      expect(Cucumber.Ast.Scenario).toHaveBeenCalledWith(keyword, name, description, line);
    });

    it("tells the AST assembler to insert the scenario into the tree", function() {
      parser.handleScenario(keyword, name, description, line);
      expect(astAssembler.insertScenario).toHaveBeenCalledWith(scenario);
    });
  });

  describe("handleStep()", function() {
    var keyword, name, line;
    var step;

    beforeEach(function() {
      keyword         = createSpy("'step' keyword");
      name            = createSpy("name of the step");
      line            = createSpy("line number");
      step            = createSpy("step AST element");
      spyOn(Cucumber.Ast, 'Step').andReturn(step);
      spyOnStub(astAssembler, 'insertStep');
    });

    it("creates a new step AST element", function() {
      parser.handleStep(keyword, name, line);
      expect(Cucumber.Ast.Step).toHaveBeenCalledWith(keyword, name, line);
    });

    it("tells the AST assembler to insert the step into the tree", function() {
      parser.handleStep(keyword, name, line);
      expect(astAssembler.insertStep).toHaveBeenCalledWith(step);
    });
  });

  describe("handleTag()", function() {
    var name, line;

    beforeEach(function() {
      name = createSpy("tag name");
      line = createSpy("line number");
      tag  = createSpy("tag AST element");
      spyOn(Cucumber.Ast, 'Tag').andReturn(tag);
      spyOnStub(astAssembler, 'insertTag');
    });

    it("creates a new tag AST element", function() {
      parser.handleTag(name, line);
      expect(Cucumber.Ast.Tag).toHaveBeenCalledWith(name, line);
    });

    it("tells the AST assembler to insert the tag into the tree", function() {
      parser.handleTag(name, line);
      expect(astAssembler.insertTag).toHaveBeenCalledWith(tag);
    });
  });
});
