require('../../support/spec_helper');

describe("Cucumber.Ast.Step", function () {
  var Cucumber = requireLib('cucumber');
  var step, feature;

  beforeEach(function () {
    var stepData = {
      locations: [{line: 1}, {line: 2}],
      text: 'text',
      path: 'path'
    };
    step = Cucumber.Ast.Step(stepData);

    feature = createSpyWithStubs('feature', {getLanguage: 'en', getStepKeywordByLines: 'keyword'});
    var scenario = createSpyWithStubs('scenario', {getFeature: feature});
    step.setScenario(scenario);
  });

  describe("getKeyword()", function () {
    it("returns the keyword of the step", function () {
      expect(step.getKeyword()).toEqual('keyword');
    });
  });

  describe("getName()", function () {
    it("returns the name of the step", function () {
      expect(step.getName()).toEqual('text');
    });
  });

  describe("isHidden()", function () {
    it("returns false for a non hook step", function () {
      expect(step.isHidden()).toBe(false);
    });
  });

  describe("hasUri()", function () {
    it("returns true", function () {
      expect(step.hasUri()).toBe(true);
    });
  });

  describe("getLine()", function () {
    it("returns the last line number", function () {
      expect(step.getLine()).toEqual(2);
    });
  });

  describe("getLines()", function () {
    it("returns all the line numbers", function () {
      expect(step.getLines()).toEqual([1, 2]);
    });
  });

  describe("hasPreviousStep() [setPreviousStep()]", function () {
    it("returns true when a previous step was set", function () {
      var previousStep = createSpy("previous step");
      step.setPreviousStep(previousStep);
      expect(step.hasPreviousStep()).toBe(true);
    });

    it("returns false when no previous step was set", function () {
      expect(step.hasPreviousStep()).toBe(false);
    });
  });

  describe("getPreviousStep() [setPreviousStep()]", function () {
    it("returns the previous step that was set as such", function () {
      var previousStep = createSpy("previous step");
      step.setPreviousStep(previousStep);
      expect(step.getPreviousStep()).toBe(previousStep);
    });
  });

  describe("isOutcomeStep()", function () {
    beforeEach(function () {
      spyOn(step, 'hasOutcomeStepKeyword');
      spyOn(step, 'isRepeatingOutcomeStep');
    });

    it("checks whether the keyword is an outcome step keyword", function () {
      step.isOutcomeStep();
      expect(step.hasOutcomeStepKeyword).toHaveBeenCalled();
    });

    it("is truthy when the keyword is an outcome step keyword", function () {
      step.hasOutcomeStepKeyword.and.returnValue(true);
      expect(step.isOutcomeStep()).toBeTruthy();
    });

    describe("when the keyword is not an outcome step keyword", function () {
      beforeEach(function () {
        step.hasOutcomeStepKeyword.and.returnValue(false);
      });

      it("checks whether the keyword is repeating an outcome step", function () {
        step.isOutcomeStep();
        expect(step.isRepeatingOutcomeStep).toHaveBeenCalled();
      });

      it("it is true when the step is repeating an outcome step", function () {
        step.isRepeatingOutcomeStep.and.returnValue(true);
        expect(step.isOutcomeStep()).toBe(true);
      });
    });
  });

  describe("isEventStep()", function () {
    beforeEach(function () {
      spyOn(step, 'hasEventStepKeyword');
      spyOn(step, 'isRepeatingEventStep');
    });

    it("checks whether the keyword is an event step keyword", function () {
      step.isEventStep();
      expect(step.hasEventStepKeyword).toHaveBeenCalled();
    });

    it("is truthy when the keyword is an event step keyword", function () {
      step.hasEventStepKeyword.and.returnValue(true);
      expect(step.isEventStep()).toBeTruthy();
    });

    describe("when the keyword is not an event step keyword", function () {
      beforeEach(function () {
        step.hasEventStepKeyword.and.returnValue(false);
      });

      it("checks whether the keyword is repeating an event step", function () {
        step.isEventStep();
        expect(step.isRepeatingEventStep).toHaveBeenCalled();
      });

      it("it is true when the step is repeating an event step", function () {
        step.isRepeatingEventStep.and.returnValue(true);
        expect(step.isEventStep()).toBeTruthy();
      });
    });
  });

  describe("hasOutcomeStepKeyword()", function () {
    it("returns true when the keyword is 'Then '", function () {
      feature.getStepKeywordByLines.and.returnValue('Then ');
      expect(step.hasOutcomeStepKeyword()).toBeTruthy();
    });

    it("returns false when the keyword is not 'Then '", function () {
      expect(step.hasOutcomeStepKeyword()).toBeFalsy();
    });
  });

  describe("hasEventStepKeyword()", function () {
    it("returns true when the keyword is 'When '", function () {
      feature.getStepKeywordByLines.and.returnValue('When ');
      expect(step.hasEventStepKeyword()).toBeTruthy();
    });

    it("returns false when the keyword is not 'When '", function () {
      expect(step.hasEventStepKeyword()).toBeFalsy();
    });
  });

  describe("isRepeatingOutcomeStep()", function () {
    beforeEach(function () {
      spyOn(step, 'hasRepeatStepKeyword');
      spyOn(step, 'isPrecededByOutcomeStep');
    });

    it("checks whether the keyword is a repeating keyword", function () {
      step.isRepeatingOutcomeStep();
      expect(step.hasRepeatStepKeyword).toHaveBeenCalled();
    });

    describe("when the keyword is a repeating keyword", function () {
      beforeEach(function () {
        step.hasRepeatStepKeyword.and.returnValue(true);
      });

      it("checks whether the preceding step is an outcome step", function () {
        step.isRepeatingOutcomeStep();
        expect(step.isPrecededByOutcomeStep).toHaveBeenCalled();
      });

      describe("when the step is preceded by an outcome step", function () {
        beforeEach(function () {
          step.isPrecededByOutcomeStep.and.returnValue(true);
        });

        it("returns true", function () {
          expect(step.isRepeatingOutcomeStep()).toBe(true);
        });
      });

      describe("when the step is not preceded by an outcome step", function () {
        beforeEach(function () {
          step.isPrecededByOutcomeStep.and.returnValue(false);
        });

        it("returns false", function () {
          expect(step.isRepeatingOutcomeStep()).toBe(false);
        });
      });
    });

    describe("when the keyword is not a repeating keyword", function () {
      beforeEach(function () {
        step.hasRepeatStepKeyword.and.returnValue(false);
      });

      it("does not check whether the preceding step is an outcome step", function () {
        step.isRepeatingOutcomeStep();
        expect(step.isPrecededByOutcomeStep).not.toHaveBeenCalled();
      });

      it("returns false", function () {
        expect(step.isRepeatingOutcomeStep()).toBe(false);
      });
    });
  });

  describe("isRepeatingEventStep()", function () {
    beforeEach(function () {
      spyOn(step, 'hasRepeatStepKeyword');
      spyOn(step, 'isPrecededByEventStep');
    });

    it("checks whether the keyword is a repeating keyword", function () {
      step.isRepeatingEventStep();
      expect(step.hasRepeatStepKeyword).toHaveBeenCalled();
    });

    describe("when the keyword is a repeating keyword", function () {
      beforeEach(function () {
        step.hasRepeatStepKeyword.and.returnValue(true);
      });

      it("checks whether the preceding step is an event step", function () {
        step.isRepeatingEventStep();
        expect(step.isPrecededByEventStep).toHaveBeenCalled();
      });

      describe("when the step is preceded by an event step", function () {
        beforeEach(function () {
          step.isPrecededByEventStep.and.returnValue(true);
        });

        it("returns true", function () {
          expect(step.isRepeatingEventStep()).toBe(true);
        });
      });

      describe("when the step is not preceded by an event step", function () {
        beforeEach(function () {
          step.isPrecededByEventStep.and.returnValue(false);
        });

        it("returns false", function () {
          expect(step.isRepeatingEventStep()).toBe(false);
        });
      });
    });

    describe("when the keyword is not a repeating keyword", function () {
      beforeEach(function () {
        step.hasRepeatStepKeyword.and.returnValue(false);
      });

      it("does not check whether the preceding step is an event step", function () {
        step.isRepeatingEventStep();
        expect(step.isPrecededByEventStep).not.toHaveBeenCalled();
      });

      it("returns false", function () {
        expect(step.isRepeatingEventStep()).toBe(false);
      });
    });
  });

  describe("hasRepeatStepKeyword()", function () {
    it("returns true when the keyword is 'And '", function () {
      feature.getStepKeywordByLines.and.returnValue('And ');
      expect(step.hasRepeatStepKeyword()).toBeTruthy();
    });

    it("returns true when the keyword is 'But '", function () {
      feature.getStepKeywordByLines.and.returnValue('But ');
      expect(step.hasRepeatStepKeyword()).toBeTruthy();
    });

    it("returns false when the keyword is not 'And ' nor 'But '", function () {
      expect(step.hasRepeatStepKeyword()).toBe(false);
    });
  });

  describe("isPrecededByOutcomeStep()", function () {
    beforeEach(function () {
      spyOn(step, 'hasPreviousStep');
    });

    it("checks whether there is a previous step or not", function () {
      step.isPrecededByOutcomeStep();
      expect(step.hasPreviousStep).toHaveBeenCalled();
    });

    describe("when there are no previous steps", function () {
      beforeEach(function () {
        step.hasPreviousStep.and.returnValue(false);
      });

      it("is falsy", function () {
        expect(step.isPrecededByOutcomeStep()).toBeFalsy();
      });
    });

    describe("when there is a previous step", function () {
      var previousStep;

      beforeEach(function () {
        step.hasPreviousStep.and.returnValue(true);
        previousStep = createSpyWithStubs("previous step", {isOutcomeStep: null});
        spyOn(step, 'getPreviousStep').and.returnValue(previousStep);
      });

      it("gets the previous step", function () {
        step.isPrecededByOutcomeStep();
        expect(step.getPreviousStep).toHaveBeenCalled();
      });

      it("checks whether the previous step is an outcome step or not", function () {
        step.isPrecededByOutcomeStep();
        expect(previousStep.isOutcomeStep).toHaveBeenCalled();
      });

      describe("when the previous step is an outcome step", function () {
        beforeEach(function () {
          previousStep.isOutcomeStep.and.returnValue(true);
        });

        it("is truthy", function () {
          expect(step.isPrecededByOutcomeStep()).toBeTruthy();
        });
      });

      describe("when the previous step is not an outcome step", function () {
        beforeEach(function () {
          previousStep.isOutcomeStep.and.returnValue(false);
        });

        it("is falsy", function () {
          expect(step.isPrecededByOutcomeStep()).toBeFalsy();
        });
      });
    });
  });

  describe("isPrecededByEventStep()", function () {
    beforeEach(function () {
      spyOn(step, 'hasPreviousStep');
    });

    it("checks whether there is a previous step or not", function () {
      step.isPrecededByEventStep();
      expect(step.hasPreviousStep).toHaveBeenCalled();
    });

    describe("when there are no previous steps", function () {
      beforeEach(function () {
        step.hasPreviousStep.and.returnValue(false);
      });

      it("is falsy", function () {
        expect(step.isPrecededByEventStep()).toBeFalsy();
      });
    });

    describe("when there is a previous step", function () {
      var previousStep;

      beforeEach(function () {
        step.hasPreviousStep.and.returnValue(true);
        previousStep = createSpyWithStubs("previous step", {isEventStep: null});
        spyOn(step, 'getPreviousStep').and.returnValue(previousStep);
      });

      it("gets the previous step", function () {
        step.isPrecededByEventStep();
        expect(step.getPreviousStep).toHaveBeenCalled();
      });

      it("checks whether the previous step is an event step or not", function () {
        step.isPrecededByEventStep();
        expect(previousStep.isEventStep).toHaveBeenCalled();
      });

      describe("when the previous step is an event step", function () {
        beforeEach(function () {
          previousStep.isEventStep.and.returnValue(true);
        });

        it("is truthy", function () {
          expect(step.isPrecededByEventStep()).toBeTruthy();
        });
      });

      describe("when the previous step is not an event step", function () {
        beforeEach(function () {
          previousStep.isEventStep.and.returnValue(false);
        });

        it("is falsy", function () {
          expect(step.isPrecededByEventStep()).toBeFalsy();
        });
      });
    });
  });
});
