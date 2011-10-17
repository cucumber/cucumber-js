require('../support/spec_helper');

describe("Cucumber.Parser", function() {
  var Cucumber = require('cucumber');
  var parser, featureSources;
  var features;

  beforeEach(function() {
    features       = createSpy("Root 'features' AST element");
    featureSources = [
      ["(feature:1)", createSpy('first feature source')],
      ["(feature:2)", createSpy('second feature source')]
    ];
    spyOn(Cucumber.Ast, 'Features').andReturn(features);
    parser = Cucumber.Parser(featureSources);
  });

  describe("constructor", function() {
    it("creates a new AST features element", function() {
      expect(Cucumber.Ast.Features).toHaveBeenCalled();
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
      spyOn(parser, 'handleRow');
      eventHandlers = parser.getEventHandlers();
      expect(eventHandlers['row']).toBe(parser.handleRow);
    });
  });

  describe("getCurrentFeature()", function() {
    var lastFeature;

    beforeEach(function() {
      lastFeature = createSpy("Last recorded feature AST element");
      spyOnStub(features, 'getLastFeature').andReturn(lastFeature);
    });

    it("gets the last feature from the root features AST element", function() {
      parser.getCurrentFeature();
      expect(features.getLastFeature).toHaveBeenCalled();
    });

    it("returns the last feature", function() {
      expect(parser.getCurrentFeature()).toEqual(lastFeature);
    });
  });

  describe("getCurrentScenarioOrBackground()", function() {
    var currentFeature;

    beforeEach(function() {
      currentFeature = createSpyWithStubs("Current feature", {getLastScenario: undefined, getBackground: undefined});
      spyOn(parser, 'getCurrentFeature').andReturn(currentFeature);
    });

    it("gets the current feature", function() {
      parser.getCurrentScenarioOrBackground();
      expect(parser.getCurrentFeature).toHaveBeenCalled();
    });

    it("asks the current feature for its last scenario", function() {
      parser.getCurrentScenarioOrBackground();
      expect(currentFeature.getLastScenario).toHaveBeenCalled();
    });

    describe("when there is a last scenario", function() {
      var lastScenario;

      beforeEach(function() {
        lastScenario = createSpy("Last scenario of the feature");
        currentFeature.getLastScenario.andReturn(lastScenario);
      });

      it("returns the last scenario", function() {
        expect(parser.getCurrentScenarioOrBackground()).toBe(lastScenario);
      });
    });

    describe("when there is no current scenario", function() {
      var background;

      beforeEach(function() {
        background = createSpy("background");
        spyOnStub(currentFeature, 'getBackground').andReturn(background);
      });

      it("gets the background", function() {
        parser.getCurrentScenarioOrBackground();
        expect(currentFeature.getBackground).toHaveBeenCalled();
      });

      it("returns the background", function() {
        expect(parser.getCurrentScenarioOrBackground()).toBe(background);
      });
    });

  });

  describe("getCurrentStep()", function() {
    var currentScenario, lastStep;

    beforeEach(function() {
      lastStep = createSpy("Last step of the scenario");
      currentScenario = createSpyWithStubs("Current scenario", {getLastStep: lastStep});
      spyOn(parser, 'getCurrentScenarioOrBackground').andReturn(currentScenario);
    });

    it("gets the current scenario", function() {
      parser.getCurrentStep();
      expect(parser.getCurrentScenarioOrBackground).toHaveBeenCalled();
    });

    it("asks the current scenario for its last step", function() {
      parser.getCurrentStep();
      expect(currentScenario.getLastStep).toHaveBeenCalled();
    });

    it("returns the last step", function() {
      expect(parser.getCurrentStep()).toBe(lastStep);
    });
  });

  describe("handleBackground()", function() {
    var keyword, name, description, line;
    var background, currentFeature;

    beforeEach(function() {
      keyword        = createSpy("'background' keyword");
      name           = createSpy("name of the background");
      description    = createSpy("description of the background");
      line           = createSpy("line number");
      background     = createSpyWithStubs("background AST element");
      currentFeature = createSpyWithStubs("current feature AST element", {addBackground: null});
      spyOn(Cucumber.Ast, 'Background').andReturn(background);
      spyOn(parser, 'getCurrentFeature').andReturn(currentFeature);
    });

    it("creates a new background AST element", function() {
      parser.handleBackground(keyword, name, description, line);
      expect(Cucumber.Ast.Background).toHaveBeenCalledWith(keyword, name, description, line);
    });

    it("gets the current feature", function() {
      parser.handleBackground(keyword, name, description, line);
      expect(parser.getCurrentFeature).toHaveBeenCalled();
    });

    it("adds the background to the current feature", function() {
      parser.handleBackground(keyword, name, description, line);
      expect(currentFeature.addBackground).toHaveBeenCalledWith(background);
    });
  });

  describe("handleComment()", function() {
    it("exists but does nothing", function() {
      parser.handleComment();
    });
  });

  describe("handleDocString()", function() {
    var contentType, string, line;
    var currentStep;

    beforeEach(function() {
      contentType = createSpy("DocString's content type");
      string      = createSpy("DocString's actual string");
      line        = createSpy("line number");
      docString   = createSpy("DocString AST element");
      currentStep = createSpyWithStubs("Current step", {attachDocString: null});
      spyOn(Cucumber.Ast, 'DocString').andReturn(docString);
      spyOn(parser, 'getCurrentStep').andReturn(currentStep);
    });

    it("creates a new DocString AST element", function() {
      parser.handleDocString(contentType, string, line);
      expect(Cucumber.Ast.DocString).toHaveBeenCalledWith(contentType, string, line);
    });

    it("gets the current step AST element", function() {
      parser.handleDocString(contentType, string, line);
      expect(parser.getCurrentStep).toHaveBeenCalled();
    });

    it("attaches the DocString element to the current step", function() {
      parser.handleDocString(contentType, string, line);
      expect(currentStep.attachDocString).toHaveBeenCalledWith(docString);
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
      spyOnStub(features, 'addFeature');
    });

    it("creates a new feature AST element", function() {
      parser.handleFeature(keyword, name, description, line);
      expect(Cucumber.Ast.Feature).toHaveBeenCalledWith(keyword, name, description, line);
    });

    it("adds the new feature to the root features AST element", function() {
      parser.handleFeature(keyword, name, description, line);
      expect(features.addFeature).toHaveBeenCalledWith(feature);
    });
  });

  describe("handleRow()", function() {
    var row, cells, line;
    var currentStep;

    beforeEach(function() {
      row         = createSpy("data table row");
      cells       = createSpy("data table cells");
      line        = createSpy("line");
      currentStep = createSpyWithStubs("Current step", {attachDataTableRow: null});
      spyOn(parser, 'getCurrentStep').andReturn(currentStep);
      spyOn(Cucumber.Ast.DataTable, 'Row').andReturn(row);
    });

    it("gets the current step", function() {
      parser.handleRow(cells, line);
      expect(parser.getCurrentStep).toHaveBeenCalled();
    });

    it("creates a new data table row AST element", function() {
      parser.handleRow(cells, line);
      expect(Cucumber.Ast.DataTable.Row).toHaveBeenCalledWith(cells, line);
    });

    it("adds the data table row to the current step", function() {
      parser.handleRow(cells, line);
      expect(currentStep.attachDataTableRow).toHaveBeenCalledWith(row);
    });
  });

  describe("handleScenario()", function() {
    var keyword, name, description, line, background;
    var scenario, currentFeature;

    beforeEach(function() {
      keyword        = createSpy("'scenario' keyword");
      name           = createSpy("Name of the scenario");
      description    = createSpy("Description of the scenario");
      line           = createSpy("Line number");
      scenario       = createSpyWithStubs("Scenario AST element");
      background     = createSpy("background");
      currentFeature = createSpyWithStubs("Current feature AST element", {addScenario: null, getBackground: background});
      spyOn(Cucumber.Ast, 'Scenario').andReturn(scenario);
      spyOn(parser, 'getCurrentFeature').andReturn(currentFeature);
    });

    it("gets the current feature", function() {
      parser.handleScenario(keyword, name, description, line);
      expect(parser.getCurrentFeature).toHaveBeenCalled();
    });

    it("gets the current background", function() {
      parser.handleScenario(keyword, name, description, line);
      expect(currentFeature.getBackground).toHaveBeenCalled();
    });

    it("creates a new scenario AST element", function() {
      parser.handleScenario(keyword, name, description, line);
      expect(Cucumber.Ast.Scenario).toHaveBeenCalledWith(keyword, name, description, line, background);
    });

    it("adds the scenario to the current feature", function() {
      parser.handleScenario(keyword, name, description, line);
      expect(currentFeature.addScenario).toHaveBeenCalledWith(scenario);
    });
  });

  describe("handleStep()", function() {
    var keyword, name, line;
    var step, currentScenario;

    beforeEach(function() {
      keyword         = createSpy("'step' keyword");
      name            = createSpy("Name of the step");
      line            = createSpy("Line number");
      step            = createSpy("Step AST element");
      currentScenario = createSpyWithStubs("Current scenario AST element", {addStep: null});
      spyOn(Cucumber.Ast, 'Step').andReturn(step);
      spyOn(parser, 'getCurrentScenarioOrBackground').andReturn(currentScenario);
    });

    it("creates a new step AST element", function() {
      parser.handleStep(keyword, name, line);
      expect(Cucumber.Ast.Step).toHaveBeenCalledWith(keyword, name, line);
    });

    it("gets the current scenario or background", function() {
      parser.handleStep(keyword, name, line);
      expect(parser.getCurrentScenarioOrBackground).toHaveBeenCalled();
    });

    it("adds the step to the current scenario", function() {
      parser.handleStep(keyword, name, line);
      expect(currentScenario.addStep).toHaveBeenCalledWith(step);
    });
  });
});
