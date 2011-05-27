require('../support/spec_helper');

describe("Cucumber.Parser", function() {
  var Cucumber = require('cucumber');
  var parser, featuresSource;
  var features;
  
  beforeEach(function() {
    features       = createSpy("Root 'features' AST element");
    spyOn(Cucumber.Ast, 'Features').andReturn(features);
    featuresSource = createSpy('features source string');
    parser         = Cucumber.Parser(featuresSource);
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

    it("asks the lexer to scan the features source", function() {
      parser.parse();
      expect(gherkinLexer.scan).toHaveBeenCalledWith(featuresSource);
    });

    it("returns the features root element", function() {
      expect(parser.parse()).toBe(features);
    });
  });

  describe("getEventHandlers()", function() {
    var eventHandlers;
    
    it("tells to bind 'feature' to handleFeature()", function() {
      spyOn(parser, 'handleFeature');
      eventHandlers = parser.getEventHandlers();
      expect(eventHandlers['feature']).toBe(parser.handleFeature);
    });

    it("tells to bind 'scenario' to handleScenario()", function() {
      spyOn(parser, 'handleScenario');
      eventHandlers = parser.getEventHandlers();
      expect(eventHandlers['scenario']).toBe(parser.handleScenario);
    });

    it("tells to bind 'step' to handleStep()", function() {
      spyOn(parser, 'handleStep');
      eventHandlers = parser.getEventHandlers();
      expect(eventHandlers['step']).toBe(parser.handleStep);
    });

    it("tells to bind 'py_string' to handlePyString()", function() {
      spyOn(parser, 'handlePyString');
      eventHandlers = parser.getEventHandlers();
      expect(eventHandlers['py_string']).toBe(parser.handlePyString);
    });

    it("tells to bind 'eof' to handleEof()", function() {
      spyOn(parser, 'handleEof');
      eventHandlers = parser.getEventHandlers();
      expect(eventHandlers['eof']).toBe(parser.handleEof);
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

  describe("getCurrentScenario()", function() {
    var currentFeature, lastScenario;

    beforeEach(function() {
      lastScenario   = createSpy("Last scenario of the feature");
      currentFeature = createSpyWithStubs("Current feature", {getLastScenario: lastScenario});
      spyOn(parser, 'getCurrentFeature').andReturn(currentFeature);
    });

    it("gets the current feature", function() {
      parser.getCurrentScenario();
      expect(parser.getCurrentFeature).toHaveBeenCalled();
    });

    it("asks the current feature for its last scenario", function() {
      parser.getCurrentScenario();
      expect(currentFeature.getLastScenario).toHaveBeenCalled();
    });

    it("returns the last scenario", function() {
      expect(parser.getCurrentScenario()).toBe(lastScenario);
    });
  });

  describe("getCurrentStep()", function() {
    var currentScenario, lastStep;

    beforeEach(function() {
      lastStep = createSpy("Last step of the scenario");
      currentScenario = createSpyWithStubs("Current scenario", {getLastStep: lastStep});
      spyOn(parser, 'getCurrentScenario').andReturn(currentScenario);
    });

    it("gets the current scenario", function() {
      parser.getCurrentStep();
      expect(parser.getCurrentScenario).toHaveBeenCalled();
    });

    it("asks the current scenario for its last step", function() {
      parser.getCurrentStep();
      expect(currentScenario.getLastStep).toHaveBeenCalled();
    });

    it("returns the last step", function() {
      expect(parser.getCurrentStep()).toBe(lastStep);
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
  
  describe("handleScenario()", function() {
    var keyword, name, description, line;
    var scenario, currentFeature;
    
    beforeEach(function() {
      keyword        = createSpy("'scenario' keyword");
      name           = createSpy("Name of the scenario");
      description    = createSpy("Description of the scenario");
      line           = createSpy("Line number");
      scenario       = createSpyWithStubs("Scenario AST element");
      currentFeature = createSpyWithStubs("Current feature AST element", {addScenario: null});
      spyOn(Cucumber.Ast, 'Scenario').andReturn(scenario);
      spyOn(parser, 'getCurrentFeature').andReturn(currentFeature);
    });

    it("creates a new scenario AST element", function() {
      parser.handleScenario(keyword, name, description, line);
      expect(Cucumber.Ast.Scenario).toHaveBeenCalledWith(keyword, name, description, line);
    });

    it("gets the current feature", function() {
      parser.handleScenario(keyword, name, description, line);
      expect(parser.getCurrentFeature).toHaveBeenCalled();
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
      spyOn(parser, 'getCurrentScenario').andReturn(currentScenario);
    });

    it("creates a new step AST element", function() {
      parser.handleStep(keyword, name, line);
      expect(Cucumber.Ast.Step).toHaveBeenCalledWith(keyword, name, line);
    });

    it("gets the current scenario", function() {
      parser.handleStep(keyword, name, line);
      expect(parser.getCurrentScenario).toHaveBeenCalled();
    });

    it("adds the step to the current scenario", function() {
      parser.handleStep(keyword, name, line);
      expect(currentScenario.addStep).toHaveBeenCalledWith(step);
    });
  });

  describe("handlePyString()", function() {
    var string, line;
    var currentStep;

    beforeEach(function() {
      string      = createSpy("PY string's actual string");
      line        = createSpy("Line number");
      pyString    = createSpy("PY string AST element");
      currentStep = createSpyWithStubs("Current step", {attachPyString: null});
      spyOn(Cucumber.Ast, 'PyString').andReturn(pyString);
      spyOn(parser, 'getCurrentStep').andReturn(currentStep);
    });

    it("creates a new PY string AST element", function() {
      parser.handlePyString(string, line);
      expect(Cucumber.Ast.PyString).toHaveBeenCalledWith(string, line);
    });

    it("gets the current step AST element", function() {
      parser.handlePyString(string, line);
      expect(parser.getCurrentStep).toHaveBeenCalled();
    });

    it("attaches the PY string element to the current step", function() {
      parser.handlePyString(string, line);
      expect(currentStep.attachPyString).toHaveBeenCalledWith(pyString);
    });
  });

  describe("handleEof()", function() {
    it("exists but does nothing", function() {
      parser.handleEof();
    });
  });
});
