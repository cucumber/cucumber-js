require('../../../support/spec_helper');

describe("Cucumber.Ast.Filter.ScenarioAtLineRule", function () {
  var Cucumber = requireLib('cucumber');
  var fs = require('fs');

  var suppliedPaths;

  beforeEach(function () {
    suppliedPaths = ["supplied/path:1", "supplied/path:2", "other/supplied/path"];
    spyOn(fs, 'realpathSync').and.returnValue('/real/path');
  });

  it('gets the real path of any supplied paths with line numbers', function(){
    Cucumber.Ast.Filter.ScenarioAtLineRule(suppliedPaths);
    expect(fs.realpathSync).toHaveBeenCalledWith('supplied/path');
    expect(fs.realpathSync).toHaveBeenCalledWith('supplied/path');
  });

  describe("isSatisfiedByElement()", function () {
    var rule, element;

    beforeEach(function () {
      rule = Cucumber.Ast.Filter.ScenarioAtLineRule(suppliedPaths);
    });

    it("returns true if the uri and line match a supplied path", function(){
      element = createSpyWithStubs("element", {getUri: '/real/path', getLine: 1, getScenarioOutlineLine: null});
      expect(rule.isSatisfiedByElement(element)).toBe(true);
    });

    it("returns true if the uri and scenario outline line match a supplied path", function(){
      element = createSpyWithStubs("element", {getUri: '/real/path', getLine: 4, getScenarioOutlineLine: 2});
      expect(rule.isSatisfiedByElement(element)).toBe(true);
    });

    it("returns false if the uri matches but the line does not", function(){
      element = createSpyWithStubs("element", {getUri: '/real/path', getLine: 3, getScenarioOutlineLine: null});
      expect(rule.isSatisfiedByElement(element)).toBe(false);
    });

    it("returns false if the uri matches a supplied path that didn't specify a line", function(){
      element = createSpyWithStubs("element", {getUri: '/other/real/path', getLine: 1, getScenarioOutlineLine: null});
      expect(rule.isSatisfiedByElement(element)).toBe(true);
    });
  });
});
