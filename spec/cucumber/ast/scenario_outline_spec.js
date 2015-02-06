require('../../support/spec_helper');

describe("Cucumber.Ast.ScenarioOutline", function () {
  var Cucumber = requireLib('cucumber');
  var steps;
  var examples;
  var scenarioOutline, keyword, name, description, uri, line, lastStep;

  beforeEach(function () {
    keyword     = createSpy("scenario outline keyword");
    name        = createSpy("scenario outline name");
    description = createSpy("scenario outline description");
    uri         = createSpy("uri");
    line        = createSpy("starting scenario outline line number");
    lastStep    = createSpy("last step");
    steps       = createSpy("step collection");
    examples    = createSpy("examples collection");

    spyOnStub(steps, 'add');
    spyOnStub(steps, 'getLast').andReturn(lastStep);

    scenarioOutline = Cucumber.Ast.ScenarioOutline(keyword, name, description, uri, line);
  });

  describe("isScenarioOutline()", function () {
    it("returns true", function () {
      expect(scenarioOutline.isScenarioOutline()).toBeTruthy();
    });
  });

  describe("getExamples() [addExamples()]", function () {
    it("returns an empty set when no examples have been set", function () {
      expect(scenarioOutline.getExamples().length()).toEqual(0);
    });

    it("returns the examples", function () {
      scenarioOutline.addExamples(examples);
      expect(scenarioOutline.getExamples().length()).toEqual(1);
      expect(scenarioOutline.getExamples().getAtIndex(0)).toBe(examples);
    });

    describe("when adding more than 1 set of examples", function () {
      it("returns all the examples", function () {
        var examples2 = createSpy("second examples collection");
        scenarioOutline.addExamples(examples);
        scenarioOutline.addExamples(examples2);
        expect(scenarioOutline.getExamples().length()).toEqual(2);
        expect(scenarioOutline.getExamples().getAtIndex(0)).toBe(examples);
        expect(scenarioOutline.getExamples().getAtIndex(1)).toBe(examples2);
      });
    });
  });

  describe("acceptVisitor", function () {
    var visitor, callback;

    beforeEach(function () {
      callback = createSpy("Callback");
    });

    it("instructs the visitor to visit the row steps", function () {
      scenarioOutline.acceptVisitor(visitor, callback);
      expect(callback).toHaveBeenCalled();
    });
  });
});
