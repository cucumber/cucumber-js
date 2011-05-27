require('../../support/spec_helper');

describe("Cucumber.SupportCode.Library", function() {
  var Cucumber = require('cucumber');
  var library, rawSupportCode;
  var stepDefinitionCollection;
  var spiesDuringSupportCodeDefinitionExecution = {};

  beforeEach(function() {
    rawSupportCode = createSpy("Raw support code").andCallFake(function() {
      spiesDuringSupportCodeDefinitionExecution['Given'] = (typeof(Given) !== 'undefined' ? Given : undefined);
      spiesDuringSupportCodeDefinitionExecution['When']  = (typeof(When)  !== 'undefined' ? When  : undefined);
      spiesDuringSupportCodeDefinitionExecution['Then']  = (typeof(Then)  !== 'undefined' ? Then  : undefined);
    });
    stepDefinitionCollection = [
      createSpyWithStubs("First step definition",  {matchesStepName:false}),
      createSpyWithStubs("Second step definition", {matchesStepName:false}),
      createSpyWithStubs("Third step definition",  {matchesStepName:false})
    ];
    spyOnStub(stepDefinitionCollection, 'syncForEach').andCallFake(function(cb) { stepDefinitionCollection.forEach(cb); });
    spyOn(Cucumber.Types, 'Collection').andReturn(stepDefinitionCollection);
  });

  describe("constructor", function() {
    it("creates a collection of step definitions", function() {
      library = Cucumber.SupportCode.Library(rawSupportCode);
      expect(Cucumber.Types.Collection).toHaveBeenCalled();
    });

    describe("before executing the raw support code", function() {
      beforeEach(function() {
        library = Cucumber.SupportCode.Library(rawSupportCode);
      });

      it("binds the global 'Given' to the library", function() {
        var given = spiesDuringSupportCodeDefinitionExecution['Given'];
        expect(given).toBeAFunction();
        expect(given).toBe(library.defineGivenStep);
      });

      it("binds the global 'When' to the library", function() {
        var given = spiesDuringSupportCodeDefinitionExecution['When'];
        expect(given).toBeAFunction();
        expect(given).toBe(library.defineWhenStep);
      });

      it("binds the global 'Then' to the library", function() {
        var given = spiesDuringSupportCodeDefinitionExecution['Then'];
        expect(given).toBeAFunction();
        expect(given).toBe(library.defineThenStep);
      });
    });
    
    it("executes the raw support code", function() {
      library = Cucumber.SupportCode.Library(rawSupportCode);
      expect(rawSupportCode).toHaveBeenCalled();
    });

    describe("after executing the raw support code", function() {
      it("restores the global 'Given' to its original value", function() {
        var originalGiven = createSpy("Original Given");
        Given             = originalGiven;
        Cucumber.SupportCode.Library(rawSupportCode);
        expect(Given).toBe(originalGiven);
      });
      
      it("restores the global 'When' to its original value", function() {
        var originalWhen = createSpy("Original When");
        When             = originalWhen;
        Cucumber.SupportCode.Library(rawSupportCode);
        expect(When).toBe(originalWhen);
      });
      
      it("restores the global 'Then' to its original value", function() {
        var originalThen = createSpy("Original Then");
        Then             = originalThen;
        Cucumber.SupportCode.Library(rawSupportCode);
        expect(Then).toBe(originalThen);
      });
    });
  });
  
  describe("lookupStepDefinitionByName()", function() {
    var stepName;

    beforeEach(function() {
      library  = Cucumber.SupportCode.Library(rawSupportCode);
      stepName = createSpy("Step name");
    });
    
    it("asks each step definition in the library if they match the step name", function() {
      library.lookupStepDefinitionByName(stepName);
      stepDefinitionCollection.forEach(function(stepDefinition) {
        expect(stepDefinition.matchesStepName).toHaveBeenCalledWith(stepName);
      });
    });

    it("returns the step definition that matches the name", function() {
      var matchingStepDefinition  = stepDefinitionCollection[1];
      matchingStepDefinition.matchesStepName.andReturn(true);
      expect(library.lookupStepDefinitionByName(stepName)).toBe(matchingStepDefinition);
    });
  });

  function describeStepDefiner(methodName) {
    describe(methodName + "()", function() {
      var stepRegexp, stepCode;
      var stepDefinition;
      
      beforeEach(function() {
        library        = Cucumber.SupportCode.Library(rawSupportCode);
        stepRegexp     = createSpy("Step name");
        stepCode       = createSpy("Step code");
        stepDefinition = createSpy("Step definition");
        spyOn(Cucumber.SupportCode, 'StepDefinition').andReturn(stepDefinition);
        spyOnStub(stepDefinitionCollection, 'add');
      });

      it("creates a step definition", function() {
        library[methodName](stepRegexp, stepCode);
        expect(Cucumber.SupportCode.StepDefinition).toHaveBeenCalledWith(stepRegexp, stepCode);
      });
      
      it("adds the step definition to the step definition collection", function() {
        library[methodName](stepRegexp, stepCode);
        expect(stepDefinitionCollection.add).toHaveBeenCalledWith(stepDefinition);
      });
    });
  };
  
  describeStepDefiner('defineGivenStep');
  describeStepDefiner('defineWhenStep');
  describeStepDefiner('defineThenStep');
});

