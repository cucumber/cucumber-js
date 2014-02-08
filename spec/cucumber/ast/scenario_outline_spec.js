require('../../support/spec_helper');

describe("Cucumber.Ast.ScenarioOutline", function() {
  var Cucumber = requireLib('cucumber');
  var steps;
  var examples;
  var scenario, keyword, name, description, uri, line, lastStep;

  beforeEach(function() {
    keyword     = createSpy("scenario keyword");
    name        = createSpy("scenario name");
    description = createSpy("scenario description");
    uri         = createSpy("uri");
    line        = createSpy("starting scenario line number");
    lastStep    = createSpy("last step");
    steps       = createSpy("step collection");
    examples    = createSpy("examples collection");
    
    spyOnStub(steps, 'add');
    spyOnStub(steps, 'getLast').andReturn(lastStep);
    //spyOn(Cucumber.Type, 'Collection').andReturn(steps);
    
    scenario = Cucumber.Ast.ScenarioOutline(keyword, name, description, uri, line);
  });

  describe("getExamples() [setExamples()]", function() {
    it("returns an empty set when no examples have been set", function() {
      expect(scenario.getExamples()).toEqual([]);
    });

    it("returns the examples", function() {
      scenario.setExamples(examples);
      expect(scenario.getExamples()).toBe(examples);
    });
  });

  describe("acceptVisitor", function() {
    var visitor, callback, data_row;

    beforeEach(function() {
      callback = createSpy("Callback");
    });

    it("instructs the visitor to visit the row steps", function() {
      scenario.acceptVisitor(visitor, callback);
      expect(callback).toHaveBeenCalled();
    });
  });
});
