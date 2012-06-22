require('../../support/spec_helper');

describe("Cucumber.Ast.Background", function() {
  var Cucumber = requireLib('cucumber');
  var steps;
  var background, keyword, name, description, uri, line, lastStep;

  beforeEach(function() {
    keyword     = createSpy("background keyword");
    name        = createSpy("background name");
    description = createSpy("background description");
    uri         = createSpy("uri");
    line        = createSpy("starting background line number");
    lastStep    = createSpy("Last step");
    steps       = createSpy("Step collection");
    spyOnStub(steps, 'add');
    spyOnStub(steps, 'getLast').andReturn(lastStep);
    spyOn(Cucumber.Type, 'Collection').andReturn(steps);
    background = Cucumber.Ast.Background(keyword, name, description, uri, line);
  });

  describe("constructor", function() {
    it("creates a new collection to store steps", function() {
      expect(Cucumber.Type.Collection).toHaveBeenCalled();
    });
  });

  describe("getKeyword()", function() {
    it("returns the keyword of the background", function() {
      expect(background.getKeyword()).toBe(keyword);
    });
  });

  describe("getName()", function() {
    it("returns the name of the background", function() {
      expect(background.getName()).toBe(name);
    });
  });

  describe("getDescription()", function() {
    it("returns the description of the background", function() {
      expect(background.getDescription()).toBe(description);
    });
  });

  describe("getUri()", function() {
    it("returns the URI on which the background starts", function() {
      expect(background.getUri()).toBe(uri);
    });
  });

  describe("getLine()", function() {
    it("returns the line on which the background starts", function() {
      expect(background.getLine()).toBe(line);
    });
  });

  describe("addStep()", function() {
    var step, lastStep;

    beforeEach(function() {
      step = createSpyWithStubs("step AST element", {setPreviousStep: null});
      lastStep = createSpy("last step");
      spyOn(background, 'getLastStep').andReturn(lastStep);
    });

    it("gets the last step", function() {
      background.addStep(step);
      expect(background.getLastStep).toHaveBeenCalled();
    });

    it("sets the last step as the previous step", function() {
      background.addStep(step);
      expect(step.setPreviousStep).toHaveBeenCalledWith(lastStep);
    });

    it("adds the step to the steps (collection)", function() {
      background.addStep(step);
      expect(steps.add).toHaveBeenCalledWith(step);
    });
  });

  describe("getLastStep()", function() {
    it("gets the last step from the collection", function() {
      background.getLastStep();
      expect(steps.getLast).toHaveBeenCalled();
    });

    it("returns that last step from the collection", function() {
      expect(background.getLastStep()).toBe(lastStep);
    });
  });

  describe("getSteps()", function() {
    it("returns the steps", function() {
      expect(background.getSteps()).toBe(steps);
    });
  });
});
