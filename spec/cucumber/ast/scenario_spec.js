require('../../support/spec_helper');

describe("Cucumber.Ast.Scenario", function () {
  var Cucumber = requireLib('cucumber');
  var scenario, step1, step2, tag1, tag2;

  beforeEach(function () {
    var scenarioData = {
      description: 'description',
      locations: [{path: 'path', line: 1}, {line: 2}],
      name: 'name',
      steps: [
        {step1: 'data'},
        {step2: 'data'}
      ],
      tags: [
        {tag1: 'data'},
        {tag2: 'data'}
      ]
    };

    step1 = createSpyWithStubs('step 1', {setPreviousStep: null, setScenario: null});
    step2 = createSpyWithStubs('step 2', {setPreviousStep: null, setScenario: null});
    spyOn(Cucumber.Ast, 'Step').and.returnValues(step1, step2);

    tag1 = createSpy('tag 1');
    tag2 = createSpy('tag 2');
    spyOn(Cucumber.Ast, 'Tag').and.returnValues(tag1, tag2);

    scenario = Cucumber.Ast.Scenario(scenarioData);
  });

  describe("constructor", function () {
    it('creates steps', function () {
      expect(Cucumber.Ast.Step).toHaveBeenCalledWith({step1: 'data'});
      expect(step1.setPreviousStep).toHaveBeenCalledWith(undefined);
      expect(step1.setScenario).toHaveBeenCalledWith(scenario);

      expect(Cucumber.Ast.Step).toHaveBeenCalledWith({step2: 'data'});
      expect(step2.setPreviousStep).toHaveBeenCalledWith(step1);
      expect(step2.setScenario).toHaveBeenCalledWith(scenario);
    });

    it('creates tags', function () {
      expect(Cucumber.Ast.Tag).toHaveBeenCalledWith({tag1: 'data'});
      expect(Cucumber.Ast.Tag).toHaveBeenCalledWith({tag2: 'data'});
    });
  });

  describe("getKeyword()", function () {
    var feature;

    beforeEach(function() {
      feature = createSpyWithStubs('feature', {getScenarioKeyword: 'keyword'});
      scenario.setFeature(feature);
    });

    it("returns the keyword of the scenario", function () {
      expect(scenario.getKeyword()).toEqual('keyword');
    });
  });

  describe("getName()", function () {
    it("returns the name of the scenario", function () {
      expect(scenario.getName()).toEqual('name');
    });
  });

  describe("getDescription()", function () {
    it("returns the description of the scenario", function () {
      expect(scenario.getDescription()).toEqual('description');
    });
  });

  describe("getUri()", function () {
    it("returns the URI on which the background starts", function () {
      expect(scenario.getUri()).toEqual('path');
    });
  });

  describe("getLine()", function () {
    it("returns the line on which the scenario starts", function () {
      expect(scenario.getLine()).toEqual(1);
    });
  });

  describe("getTags()", function () {
    it("returns the tags", function () {
      expect(scenario.getTags()).toEqual([tag1, tag2]);
    });
  });
});
