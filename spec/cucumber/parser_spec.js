require('../support/spec_helper');

describe("Cucumber.Parser", function () {
  var Cucumber = requireLib('cucumber');
  var Gherkin = require('gherkin');
  var astFilter, featureSources, gherkinParser, gherkinCompiler, parser;

  beforeEach(function () {
    astFilter = createSpyWithStubs("AST filter", {isElementEnrolled: null});
    featureSources = [
      ['first feature uri', 'first feature source'],
      ['second feature uri', 'second feature source']
    ];
    gherkinParser = createSpyWithStubs("gherkin parser", {parse: null});
    gherkinCompiler = createSpyWithStubs("gherkin compiler", {compile: null});
    spyOnStub(Gherkin, 'Parser').and.returnValue(gherkinParser);
    spyOnStub(Gherkin, 'Compiler').and.returnValue(gherkinCompiler);

    parser = Cucumber.Parser(featureSources, astFilter);
  });

  describe("parse()", function () {
    var gherkinDocument1, gherkinDocument2;
    var feature1Data, feature2Data, pickle1Data, pickle2Data, pickle3Data, pickle4Data;
    var feature1, feature2, scenario1, scenario2, scenario3, scenario4;
    var result;

    beforeEach(function () {
      feature1 = createSpy('feature1');
      feature2 = createSpy('feature2');
      feature1Data = {feature1: 'data'};
      feature2Data = {feature2: 'data'};
      gherkinDocument1 = {feature: feature1Data};
      gherkinDocument2 = {feature: feature2Data};
      pickle1Data = {pickle1: 'data'};
      pickle2Data = {pickle2: 'data'};
      pickle3Data = {pickle3: 'data'};
      pickle4Data = {pickle4: 'data'};
      scenario1 = createSpy('scenario1');
      scenario2 = createSpy('scenario2');
      scenario3 = createSpy('scenario3');
      scenario4 = createSpy('scenario4');
      gherkinParser.parse.and.returnValues(gherkinDocument1, gherkinDocument2);
      gherkinCompiler.compile.and.returnValues([pickle1Data, pickle2Data], [pickle3Data, pickle4Data]);
      spyOnStub(Cucumber.Ast, 'Scenario').and.returnValues(scenario1, scenario2, scenario3, scenario4);
      spyOnStub(Cucumber.Ast, 'Feature').and.returnValues(feature1, feature2);
      astFilter.isElementEnrolled.and.returnValues(true, true, true, false);
      result = parser.parse();
    });

    it("parses the feature sources", function () {
      expect(gherkinParser.parse).toHaveBeenCalledWith('first feature source');
      expect(gherkinParser.parse).toHaveBeenCalledWith('second feature source');
    });

    it("compiles the feature data", function () {
      expect(gherkinCompiler.compile).toHaveBeenCalledWith(gherkinDocument1, 'first feature uri');
      expect(gherkinCompiler.compile).toHaveBeenCalledWith(gherkinDocument2, 'second feature uri');
    });

    it("creates the scenarios", function () {
      expect(Cucumber.Ast.Scenario).toHaveBeenCalledWith(pickle1Data);
      expect(Cucumber.Ast.Scenario).toHaveBeenCalledWith(pickle2Data);
      expect(Cucumber.Ast.Scenario).toHaveBeenCalledWith(pickle3Data);
      expect(Cucumber.Ast.Scenario).toHaveBeenCalledWith(pickle4Data);
    });

    it("checks if each scenario should be enrolled", function () {
      expect(astFilter.isElementEnrolled).toHaveBeenCalledWith(scenario1);
      expect(astFilter.isElementEnrolled).toHaveBeenCalledWith(scenario2);
      expect(astFilter.isElementEnrolled).toHaveBeenCalledWith(scenario3);
      expect(astFilter.isElementEnrolled).toHaveBeenCalledWith(scenario4);
    });

    it("creates the features", function () {
      expect(Cucumber.Ast.Feature).toHaveBeenCalledWith({feature1: 'data', uri: 'first feature uri'}, [scenario1, scenario2]);
      expect(Cucumber.Ast.Feature).toHaveBeenCalledWith({feature2: 'data', uri: 'second feature uri'}, [scenario3]);
    });

    it("returns the features", function () {
      expect(result).toEqual([feature1, feature2]);
    });
  });
});
