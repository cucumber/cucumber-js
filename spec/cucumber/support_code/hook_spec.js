require('../../support/spec_helper');

describe("Cucumber.SupportCode.Hook", function () {
  var Cucumber = requireLib('cucumber');
  var hook, code, options, uri, line, stepDefinition;

  beforeEach(function () {
    code = createSpy("hook code");
    options = {};
    uri = 'uri';
    line = 1;
    stepDefinition = createSpy("step definition");
    spyOn(Cucumber.SupportCode, 'StepDefinition').and.returnValue(stepDefinition);
    hook = Cucumber.SupportCode.Hook(code, options, uri, line);
  });

  describe("constructor", function () {
    it("inherits from Cucumber.SupportCode.StepDefinition", function () {
      expect(Cucumber.SupportCode.StepDefinition).toHaveBeenCalledWith('', {}, code, uri, line);
      expect(hook).toBe(stepDefinition);
    });
  });

  describe("buildInvocationParameters()", function () {
    var step, scenario;

    beforeEach(function () {
      step = createSpy("step");
      scenario = createSpy("scenario");
    });

    it("returns an array containing the scenario", function () {
      expect(hook.buildInvocationParameters(step, scenario)).toEqual([scenario]);
    });
  });

  describe("appliesToScenario()", function () {
    var scenario, astFilter, scenarioEnrolled;

    beforeEach(function () {
      scenarioEnrolled = createSpy("scenario enrolled?");
      astFilter        = createSpyWithStubs("AST filter", { isElementEnrolled: scenarioEnrolled });
      scenario         = createSpy("scenario");
      spyOn(hook, 'getAstFilter').and.returnValue(astFilter);
    });

    it("gets the AST filter", function () {
      hook.appliesToScenario(scenario);
      expect(hook.getAstFilter).toHaveBeenCalled();
    });

    it("asks the AST filter whether the scenario is enrolled or not", function () {
      hook.appliesToScenario(scenario);
      expect(astFilter.isElementEnrolled).toHaveBeenCalledWith(scenario);
    });

    it("returns the AST filter answer", function () {
      expect(hook.appliesToScenario(scenario)).toBe(scenarioEnrolled);
    });
  });

  describe("getAstFilter()", function () {
    var tags, tagGroups, rules, astFilter;

    beforeEach(function () {
      tagGroups = [createSpy("tag group 1"), createSpy("tag group 2")];
      tags      = createSpy("tags");
      options   = {tags: tags};
      hook      = Cucumber.SupportCode.Hook(code, options);
      rules     = [createSpy("rule 1"), createSpy("rule 2")];
      astFilter = createSpy("AST filter");
      spyOn(Cucumber.TagGroupParser, 'getTagGroupsFromStrings').and.returnValue(tagGroups);
      spyOn(Cucumber.Ast, 'Filter').and.returnValue(astFilter);
      spyOnStub(Cucumber.Ast.Filter, 'AnyOfTagsRule').and.returnValues.apply(null, rules);

    });

    it("gets the tag groups from the 'tags' option", function () {
      hook.getAstFilter();
      expect(Cucumber.TagGroupParser.getTagGroupsFromStrings).toHaveBeenCalledWith(tags);
    });

    it("builds a new 'any of tags' AST filter rule based on each tag groupe", function () {
      hook.getAstFilter();
      tagGroups.forEach(function (tagGroup) {
        expect(Cucumber.Ast.Filter.AnyOfTagsRule).toHaveBeenCalledWith(tagGroup);
      });
    });

    it("instantiates AST filter based on the rules", function () {
      hook.getAstFilter();
      expect(Cucumber.Ast.Filter).toHaveBeenCalledWith(rules);
    });

    it("returns the AST filter", function () {
      expect(hook.getAstFilter()).toBe(astFilter);
    });
  });
});
