require('../../support/spec_helper');

describe("Cucumber.SupportCode.Hook", function() {
  var Cucumber = requireLib('cucumber');
  var hook, code, options, tags;

  beforeEach(function() {
    code    = createSpy("hook code");
    options = {};
    hook    = Cucumber.SupportCode.Hook(code, options);
  });

  describe("invokeBesideScenario()", function() {
    var scenario, world, callback;

    beforeEach(function() {
      scenario  = createSpy("scenario");
      world     = createSpy("world");
      callback  = createSpy("callback");
      spyOn(hook, 'appliesToScenario');
    });

    it("checks whether the hook applies to this scenario or not", function() {
      hook.invokeBesideScenario(scenario, world, callback);
      expect(hook.appliesToScenario).toHaveBeenCalledWith(scenario);
    });

    describe("when the hook applies to the scenario ", function() {
      beforeEach(function() {
        hook.appliesToScenario.andReturn(true);
      });

      it("calls the code with the world instance as this and pass it the current scenario", function() {
        hook.invokeBesideScenario(scenario, world, callback);
        expect(code).toHaveBeenCalledWith(scenario, callback);
        expect(code.mostRecentCall.object).toBe(world);
      });

      describe("when the hook function only accepts one parameter", function () {
        beforeEach(function () {
          var codeObservingWrapper = function (callback) {
            code.apply(this, arguments);
          };
          hook = Cucumber.SupportCode.Hook(codeObservingWrapper, options);
        });

        it("doesn't pass the current scenario to the hook function", function() {
          hook.invokeBesideScenario(scenario, world, callback);
          expect(code).not.toHaveBeenCalledWith(scenario, callback);
          expect(code).toHaveBeenCalledWith(callback);
          expect(code.mostRecentCall.object).toBe(world);
        });
      });

      it("does not call back", function() {
        hook.invokeBesideScenario(scenario, world, callback);
        expect(callback).not.toHaveBeenCalled();
      });
    });

    describe("when the hook does not apply to the scenario", function() {
      beforeEach(function() {
        hook.appliesToScenario.andReturn(false);
      });

      it("does not call the code", function() {
        hook.invokeBesideScenario(scenario, world, callback);
        expect(code).not.toHaveBeenCalled();
      });

      it("calls back directly with a post-scenario around hook", function() {
        hook.invokeBesideScenario(scenario, world, callback);
        expect(callback).toHaveBeenCalled();
        expect(callback).toHaveBeenCalledWithAFunctionAsNthParameter(1);
      });

      describe("post-scenario around hook", function() {
        var postScenarioAroundHook, postScenarioAroundHookCallback;

        beforeEach(function() {
          hook.invokeBesideScenario(scenario, world, callback);
          postScenarioAroundHook         = callback.mostRecentCall.args[0];
          postScenarioAroundHookCallback = createSpy("post-scenario around hook callback");
        });

        it("passes a callback to replace the post-scenario hook (in case of an around hook)", function() {
          postScenarioAroundHook(postScenarioAroundHookCallback);
          expect(postScenarioAroundHookCallback).toHaveBeenCalled();
        });
      });
    });
  });

  describe("appliesToScenario()", function() {
    var scenario, astFilter, scenarioEnrolled;

    beforeEach(function() {
      scenarioEnrolled = createSpy("scenario enrolled?");
      astFilter        = createSpyWithStubs("AST filter", { isElementEnrolled: scenarioEnrolled });
      scenario         = createSpy("scenario");
      spyOn(hook, 'getAstFilter').andReturn(astFilter);
    });

    it("gets the AST filter", function() {
      hook.appliesToScenario(scenario);
      expect(hook.getAstFilter).toHaveBeenCalled();
    });

    it("asks the AST filter whether the scenario is enrolled or not", function() {
      hook.appliesToScenario(scenario);
      expect(astFilter.isElementEnrolled).toHaveBeenCalledWith(scenario);
    });

    it("returns the AST filter answer", function() {
      expect(hook.appliesToScenario(scenario)).toBe(scenarioEnrolled);
    });
  });


  describe("getAstFilter()", function() {
    var tags, tagGroups, rules, astFilter;

    beforeEach(function() {
      tagGroups = [createSpy("tag group 1"), createSpy("tag group 2")];
      tags      = createSpy("tags");
      options   = {tags: tags};
      hook      = Cucumber.SupportCode.Hook(code, options);
      rules     = [createSpy("rule 1"), createSpy("rule 2")];
      astFilter = createSpy("AST filter");
      spyOn(Cucumber.TagGroupParser, 'getTagGroupsFromStrings').andReturn(tagGroups);
      spyOn(Cucumber.Ast, 'Filter').andReturn(astFilter);
      spyOnStub(Cucumber.Ast.Filter, 'AnyOfTagsRule').andReturnSeveral(rules);

    });

    it("gets the tag groups from the 'tags' option", function() {
      hook.getAstFilter();
      expect(Cucumber.TagGroupParser.getTagGroupsFromStrings).toHaveBeenCalledWith(tags);
    });

    it("builds a new 'any of tags' AST filter rule based on each tag groupe", function() {
      hook.getAstFilter();
      tagGroups.forEach(function(tagGroup) {
        expect(Cucumber.Ast.Filter.AnyOfTagsRule).toHaveBeenCalledWith(tagGroup);
      });
    });

    it("instantiates AST filter based on the rules", function() {
      hook.getAstFilter();
      expect(Cucumber.Ast.Filter).toHaveBeenCalledWith(rules);
    });

    it("returns the AST filter", function() {
      expect(hook.getAstFilter()).toBe(astFilter);
    });
  });
});
