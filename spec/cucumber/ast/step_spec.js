require('../../support/spec_helper');

describe("Cucumber.Ast.Step", function() {
  var Cucumber = requireLib('cucumber');
  var step, keyword, name, uri, line;

  beforeEach(function() {
    name         = createSpy("name");
    keyword      = createSpy("keyword");
    uri          = createSpy("uri");
    line         = createSpy("line");
    step         = Cucumber.Ast.Step(keyword, name, uri, line);
  });

  describe("getKeyword()", function() {
    it("returns the keyword of the step", function() {
      expect(step.getKeyword()).toBe(keyword);
    });
  });

  describe("getName()", function() {
    it("returns the name of the step", function() {
      expect(step.getName()).toBe(name);
    });
  });

  describe("IsOutlineStep()", function() {
    it("returns false for a non outline step", function() {
      expect(step.isOutlineStep()).toBe(false);
    });
  });

  describe("getUri()", function() {
    it("returns the URI on which the background starts", function() {
      expect(step.getUri()).toBe(uri);
    });
  });

  describe("getLine()", function() {
    it("returns the line number on which the step lies", function() {
      expect(step.getLine()).toBe(line);
    });
  });

  describe("hasPreviousStep() [setPreviousStep()]", function() {
    it("returns true when a previous step was set", function() {
      var previousStep = createSpy("previous step");
      step.setPreviousStep(previousStep);
      expect(step.hasPreviousStep()).toBeTruthy();
    });

    it("returns false when no previous step was set", function() {
      expect(step.hasPreviousStep()).toBeFalsy();
    });
  });

  describe("getPreviousStep() [setPreviousStep()]", function() {
    it("returns the previous step that was set as such", function() {
      var previousStep = createSpy("previous step");
      step.setPreviousStep(previousStep);
      expect(step.getPreviousStep()).toBe(previousStep);
    });
  });

  describe("hasDocString() [attachDocString()]", function() {
    var docString;

    beforeEach(function() {
      docString = createSpy("DocString");
    });

    it("returns true when a DocString was attached to the step", function() {
      step.attachDocString(docString);
      expect(step.hasDocString()).toBeTruthy();
    });

    it("returns false when no DocString was attached to the step", function() {
      expect(step.hasDocString()).toBeFalsy();
    });
  });

  describe("getDocString() [attachDocString()]", function() {
    var docString;

    beforeEach(function() {
      docString = createSpy("DocString");
    });

    it("returns the DocString that was attached to the step through attachDocString()", function() {
      step.attachDocString(docString);
      expect(step.getDocString()).toBe(docString);
    });
  });

  describe("getAttachment()", function() {
    beforeEach(function() {
      spyOn(step, 'hasDocString');
      spyOn(step, 'hasDataTable');
    });

    it("checks whether a doc string is attached", function() {
      step.getAttachment();
      expect(step.hasDocString).toHaveBeenCalled();
    });

    describe("when there is a doc string attached", function() {
      var docString;

      beforeEach(function() {
        docString = createSpy("doc string");
        step.hasDocString.andReturn(true);
        spyOn(step, 'getDocString').andReturn(docString);
      });

      it("gets the attached doc string", function() {
        step.getAttachment();
        expect(step.getDocString).toHaveBeenCalled();
      });

      it("returns the doc string", function() {
        expect(step.getAttachment()).toBe(docString);
      });
    });

    describe("when no doc string is attached", function() {
      beforeEach(function() {
        step.hasDocString.andReturn(false);
      });

      it("checks whether a data table is attached", function() {
        step.getAttachment();
        expect(step.hasDataTable).toHaveBeenCalled();
      });

      describe("when a data table is attached", function() {
        var dataTable;

        beforeEach(function() {
          dataTable = createSpy("data table");
          step.hasDataTable.andReturn(true);
          spyOn(step, 'getDataTable').andReturn(dataTable);
        });

        it("gets the data table", function() {
          step.getAttachment();
          expect(step.getDataTable).toHaveBeenCalled();
        });

        it("returns the data table", function() {
          expect(step.getAttachment()).toBe(dataTable);
        });
      });

      describe("when no data table is attached", function() {
        it("does not return anything", function() {
          expect(step.getAttachment()).toBeUndefined();
        });
      });
    });
  });

  describe("getAttachmentContents()", function() {
    beforeEach(function() {
      spyOn(step, 'getAttachment');
    });

    it("gets the attachment", function() {
      step.getAttachmentContents();
      expect(step.getAttachment).toHaveBeenCalled();
    });

    describe("when there is an attachment", function() {
      var attachment, attachmentContents;

      beforeEach(function() {
        attachmentContents = createSpy("step attachment contents");
        attachment         = createSpyWithStubs("step attachment", {getContents: attachmentContents});
        step.getAttachment.andReturn(attachment);
      });

      it("gets the attachment contents", function() {
        step.getAttachmentContents();
        expect(attachment.getContents).toHaveBeenCalled();
      });

      it("returns the attachment contents", function() {
        expect(step.getAttachmentContents()).toBe(attachmentContents);
      });
    });

    describe("when there is no attachement", function() {
      it("returns nothing", function() {
        expect(step.getAttachmentContents()).toBeUndefined();
      });
    });
  });

  describe("hasAttachment()", function() {
    beforeEach(function() {
      spyOn(step, 'hasDocString');
      spyOn(step, 'hasDataTable');
    });

    it("checks whether the step has a doc string attached or not", function() {
      step.hasAttachment();
      expect(step.hasDocString).toHaveBeenCalled();
    });

    describe("when there is a doc string attached", function() {
      beforeEach(function() {
        step.hasDocString.andReturn(true);
      });

      it("is truthy", function() {
        expect(step.hasAttachment()).toBeTruthy();
      });
    });

    describe("when there is no doc string attached", function() {
      beforeEach(function() {
        step.hasDocString.andReturn(false);
      });

      it("checks whether the step has a data table attached or not", function() {
        step.hasAttachment();
        expect(step.hasDataTable).toHaveBeenCalled();
      });

      describe("when there is a data table attached", function() {
        beforeEach(function() {
          step.hasDataTable.andReturn(true);
        });

        it("is truthy", function() {
          expect(step.hasAttachment()).toBeTruthy();
        });
      });

      describe("when there is no data table attached", function() {
        beforeEach(function() {
          step.hasDataTable.andReturn(false);
        });

        it("is truthy", function() {
          expect(step.hasAttachment()).toBeFalsy();
        });
      });
    });
  });

  describe("attachDataTableRow()", function() {
    var row, dataTable;

    beforeEach(function() {
      row       = createSpy("data table row");
      dataTable = createSpyWithStubs("data table", {attachRow: null});
      spyOn(step, 'ensureDataTableIsAttached');
      spyOn(step, 'getDataTable').andReturn(dataTable);
    });

    it("ensures there is a data table attached already", function() {
      step.attachDataTableRow(row);
      expect(step.ensureDataTableIsAttached).toHaveBeenCalled();
    });

    it("gets the attached data table", function() {
      step.attachDataTableRow(row);
      expect(step.getDataTable).toHaveBeenCalled();
    });

    it("attaches the row to the data table", function() {
      step.attachDataTableRow(row);
      expect(dataTable.attachRow).toHaveBeenCalledWith(row);
    });
  });

  describe("ensureDataTableIsAttached()", function() {
    var dataTable;

    beforeEach(function() {
      spyOn(step, 'getDataTable');
      spyOn(step, 'attachDataTable');
      spyOn(Cucumber.Ast, 'DataTable')
    });

    it("gets the current data table", function() {
      step.ensureDataTableIsAttached();
      expect(step.getDataTable).toHaveBeenCalled();
    });

    describe("when there is no data table yet", function() {
      beforeEach(function() {
        dataTable = createSpy("new data table");
        step.getDataTable.andReturn(undefined);
        Cucumber.Ast.DataTable.andReturn(dataTable);
      });

      it("creates a new data table", function() {
        step.ensureDataTableIsAttached();
        expect(Cucumber.Ast.DataTable).toHaveBeenCalled();
      });

      it("attaches the new data table to the step", function() {
        step.ensureDataTableIsAttached();
        expect(step.attachDataTable).toHaveBeenCalledWith(dataTable);
      });
    });

    describe("when there is a data table already", function() {
      beforeEach(function() {
        dataTable = createSpy("existing data table");
        step.getDataTable.andReturn(dataTable);
      });

      it("does not create a new data table", function() {
        step.ensureDataTableIsAttached();
        expect(Cucumber.Ast.DataTable).not.toHaveBeenCalled();
      });

      it("does not attach a data table to the step", function() {
        step.ensureDataTableIsAttached();
        expect(step.attachDataTable).not.toHaveBeenCalledWith(dataTable);
      });
    });
  });

  describe("hasDataTable() [attachDataTable()]", function() {
    var dataTable;

    beforeEach(function() {
      dataTable = createSpy("data table");
    });

    it("returns true when a data table was attached to the step", function() {
      step.attachDataTable(dataTable);
      expect(step.hasDataTable()).toBeTruthy();
    });

    it("returns false when no DocString was attached to the step", function() {
      expect(step.hasDataTable()).toBeFalsy();
    });
  });

  describe("getDataTable() [attachDataTable()]", function() {
    it("returns the attached data table when one was attached", function() {
      var dataTable;
      step.attachDataTable(dataTable);
      expect(step.getDataTable()).toBe(dataTable);
    });

    it("returns 'undefined' when no data table was attached", function() {
      expect(step.getDataTable()).toBeUndefined();
    });
  });

  describe("isOutcomeStep()", function() {
    beforeEach(function() {
      spyOn(step, 'hasOutcomeStepKeyword');
      spyOn(step, 'isRepeatingOutcomeStep');
    });

    it("checks whether the keyword is an outcome step keyword", function() {
      step.isOutcomeStep();
      expect(step.hasOutcomeStepKeyword).toHaveBeenCalled();
    });

    it("is truthy when the keyword is an outcome step keyword", function() {
      step.hasOutcomeStepKeyword.andReturn(true);
      expect(step.isOutcomeStep()).toBeTruthy();
    });

    describe("when the keyword is not an outcome step keyword", function() {
      beforeEach(function() {
        step.hasOutcomeStepKeyword.andReturn(false);
      });

      it("checks whether the keyword is repeating an outcome step", function() {
        step.isOutcomeStep();
        expect(step.isRepeatingOutcomeStep).toHaveBeenCalled();
      });

      it("it is true when the step is repeating an outcome step", function() {
        step.isRepeatingOutcomeStep.andReturn(true);
        expect(step.isOutcomeStep()).toBeTruthy();
      });
    });
  });

  describe("isEventStep()", function() {
    beforeEach(function() {
      spyOn(step, 'hasEventStepKeyword');
      spyOn(step, 'isRepeatingEventStep');
    });

    it("checks whether the keyword is an event step keyword", function() {
      step.isEventStep();
      expect(step.hasEventStepKeyword).toHaveBeenCalled();
    });

    it("is truthy when the keyword is an event step keyword", function() {
      step.hasEventStepKeyword.andReturn(true);
      expect(step.isEventStep()).toBeTruthy();
    });

    describe("when the keyword is not an event step keyword", function() {
      beforeEach(function() {
        step.hasEventStepKeyword.andReturn(false);
      });

      it("checks whether the keyword is repeating an event step", function() {
        step.isEventStep();
        expect(step.isRepeatingEventStep).toHaveBeenCalled();
      });

      it("it is true when the step is repeating an event step", function() {
        step.isRepeatingEventStep.andReturn(true);
        expect(step.isEventStep()).toBeTruthy();
      });
    });
  });

  describe("hasOutcomeStepKeyword()", function() {
    it("returns true when the keyword is 'Then '", function() {
      step = Cucumber.Ast.Step('Then ', name, line);
      expect(step.hasOutcomeStepKeyword()).toBeTruthy();
    });

    it("returns false when the keyword is not 'Then '", function() {
      expect(step.hasOutcomeStepKeyword()).toBeFalsy();
    });
  });

  describe("hasEventStepKeyword()", function() {
    it("returns true when the keyword is 'When '", function() {
      step = Cucumber.Ast.Step('When ', name, line);
      expect(step.hasEventStepKeyword()).toBeTruthy();
    });

    it("returns false when the keyword is not 'When '", function() {
      expect(step.hasEventStepKeyword()).toBeFalsy();
    });
  });

  describe("isRepeatingOutcomeStep()", function() {
    beforeEach(function() {
      spyOn(step, 'hasRepeatStepKeyword');
      spyOn(step, 'isPrecededByOutcomeStep');
    });

    it("checks whether the keyword is a repeating keyword", function() {
      step.isRepeatingOutcomeStep();
      expect(step.hasRepeatStepKeyword).toHaveBeenCalled();
    });

    describe("when the keyword is a repeating keyword", function() {
      beforeEach(function() {
        step.hasRepeatStepKeyword.andReturn(true);
      });

      it("checks whether the preceding step is an outcome step", function() {
        step.isRepeatingOutcomeStep();
        expect(step.isPrecededByOutcomeStep).toHaveBeenCalled();
      });

      describe("when the step is preceded by an outcome step", function() {
        beforeEach(function() {
          step.isPrecededByOutcomeStep.andReturn(true);
        });

        it("returns true", function() {
          expect(step.isRepeatingOutcomeStep()).toBeTruthy();
        });
      });

      describe("when the step is not preceded by an outcome step", function() {
        beforeEach(function() {
          step.isPrecededByOutcomeStep.andReturn(false);
        });

        it("returns false", function() {
          expect(step.isRepeatingOutcomeStep()).toBeFalsy();
        });
      });
    });

    describe("when the keyword is not a repeating keyword", function() {
      beforeEach(function() {
        step.hasRepeatStepKeyword.andReturn(false);
      });

      it("does not check whether the preceding step is an outcome step", function() {
        step.isRepeatingOutcomeStep();
        expect(step.isPrecededByOutcomeStep).not.toHaveBeenCalled();
      });

      it("returns false", function() {
        expect(step.isRepeatingOutcomeStep()).toBeFalsy();
      });
    });
  });

  describe("isRepeatingEventStep()", function() {
    beforeEach(function() {
      spyOn(step, 'hasRepeatStepKeyword');
      spyOn(step, 'isPrecededByEventStep');
    });

    it("checks whether the keyword is a repeating keyword", function() {
      step.isRepeatingEventStep();
      expect(step.hasRepeatStepKeyword).toHaveBeenCalled();
    });

    describe("when the keyword is a repeating keyword", function() {
      beforeEach(function() {
        step.hasRepeatStepKeyword.andReturn(true);
      });

      it("checks whether the preceding step is an event step", function() {
        step.isRepeatingEventStep();
        expect(step.isPrecededByEventStep).toHaveBeenCalled();
      });

      describe("when the step is preceded by an event step", function() {
        beforeEach(function() {
          step.isPrecededByEventStep.andReturn(true);
        });

        it("returns true", function() {
          expect(step.isRepeatingEventStep()).toBeTruthy();
        });
      });

      describe("when the step is not preceded by an event step", function() {
        beforeEach(function() {
          step.isPrecededByEventStep.andReturn(false);
        });

        it("returns false", function() {
          expect(step.isRepeatingEventStep()).toBeFalsy();
        });
      });
    });

    describe("when the keyword is not a repeating keyword", function() {
      beforeEach(function() {
        step.hasRepeatStepKeyword.andReturn(false);
      });

      it("does not check whether the preceding step is an event step", function() {
        step.isRepeatingEventStep();
        expect(step.isPrecededByEventStep).not.toHaveBeenCalled();
      });

      it("returns false", function() {
        expect(step.isRepeatingEventStep()).toBeFalsy();
      });
    });
  });

  describe("hasRepeatStepKeyword()", function() {
    it("returns true when the keyword is 'And '", function() {
      step = Cucumber.Ast.Step('And ', name, line);
      expect(step.hasRepeatStepKeyword()).toBeTruthy();
    });

    it("returns true when the keyword is 'But '", function() {
      step = Cucumber.Ast.Step('But ', name, line);
      expect(step.hasRepeatStepKeyword()).toBeTruthy();
    });

    it("returns true when the keyword is '* '", function() {
      step = Cucumber.Ast.Step('* ', name, line);
      expect(step.hasRepeatStepKeyword()).toBeTruthy();
    });

    it("returns false when the keyword is not 'And ' nor 'But '", function() {
      expect(step.hasRepeatStepKeyword()).toBeFalsy();
    });
  });

  describe("isPrecededByOutcomeStep()", function() {
    beforeEach(function() {
      spyOn(step, 'hasPreviousStep');
    });

    it("checks whether there is a previous step or not", function() {
      step.isPrecededByOutcomeStep();
      expect(step.hasPreviousStep).toHaveBeenCalled();
    });

    describe("when there are no previous steps", function() {
      beforeEach(function() {
        step.hasPreviousStep.andReturn(false);
      });

      it("is falsy", function() {
        expect(step.isPrecededByOutcomeStep()).toBeFalsy();
      });
    });

    describe("when there is a previous step", function() {
      var previousStep;

      beforeEach(function() {
        step.hasPreviousStep.andReturn(true);
        previousStep = createSpyWithStubs("previous step", {isOutcomeStep: null});
        spyOn(step, 'getPreviousStep').andReturn(previousStep);
      });

      it("gets the previous step", function() {
        step.isPrecededByOutcomeStep();
        expect(step.getPreviousStep).toHaveBeenCalled();
      });

      it("checks whether the previous step is an outcome step or not", function() {
        step.isPrecededByOutcomeStep();
        expect(previousStep.isOutcomeStep).toHaveBeenCalled();
      });

      describe("when the previous step is an outcome step", function() {
        beforeEach(function() {
          previousStep.isOutcomeStep.andReturn(true);
        });

        it("is truthy", function() {
          expect(step.isPrecededByOutcomeStep()).toBeTruthy();
        });
      });

      describe("when the previous step is not an outcome step", function() {
        beforeEach(function() {
          previousStep.isOutcomeStep.andReturn(false);
        });

        it("is falsy", function() {
          expect(step.isPrecededByOutcomeStep()).toBeFalsy();
        });
      });
    });
  });

  describe("isPrecededByEventStep()", function() {
    beforeEach(function() {
      spyOn(step, 'hasPreviousStep');
    });

    it("checks whether there is a previous step or not", function() {
      step.isPrecededByEventStep();
      expect(step.hasPreviousStep).toHaveBeenCalled();
    });

    describe("when there are no previous steps", function() {
      beforeEach(function() {
        step.hasPreviousStep.andReturn(false);
      });

      it("is falsy", function() {
        expect(step.isPrecededByEventStep()).toBeFalsy();
      });
    });

    describe("when there is a previous step", function() {
      var previousStep;

      beforeEach(function() {
        step.hasPreviousStep.andReturn(true);
        previousStep = createSpyWithStubs("previous step", {isEventStep: null});
        spyOn(step, 'getPreviousStep').andReturn(previousStep);
      });

      it("gets the previous step", function() {
        step.isPrecededByEventStep();
        expect(step.getPreviousStep).toHaveBeenCalled();
      });

      it("checks whether the previous step is an event step or not", function() {
        step.isPrecededByEventStep();
        expect(previousStep.isEventStep).toHaveBeenCalled();
      });

      describe("when the previous step is an event step", function() {
        beforeEach(function() {
          previousStep.isEventStep.andReturn(true);
        });

        it("is truthy", function() {
          expect(step.isPrecededByEventStep()).toBeTruthy();
        });
      });

      describe("when the previous step is not an event step", function() {
        beforeEach(function() {
          previousStep.isEventStep.andReturn(false);
        });

        it("is falsy", function() {
          expect(step.isPrecededByEventStep()).toBeFalsy();
        });
      });
    });
  });

  describe("acceptVisitor()", function() {
    var visitor, callback;

    beforeEach(function() {
      visitor  = createSpyWithStubs("Visitor", {visitStepResult: null});
      callback = createSpy("Callback");
      spyOn(step, 'execute');
    });

    it("executes the step with a callback", function() {
      step.acceptVisitor(visitor, callback);
      expect(step.execute).toHaveBeenCalled();
      expect(step.execute).toHaveBeenCalledWithValueAsNthParameter(visitor, 1);
      expect(step.execute).toHaveBeenCalledWithAFunctionAsNthParameter(2);
    });

    describe("after the step was executed", function() {
      var executeCallback;
      var stepResult;

      beforeEach(function() {
        step.acceptVisitor(visitor, callback);
        stepResult = createSpy("Step execution result");
        executeCallback = step.execute.mostRecentCall.args[1];
      });

      it("tells the visitor to visit the step result", function() {
        executeCallback(stepResult);
        expect(visitor.visitStepResult).toHaveBeenCalledWith(stepResult, callback);
      });
    });
  });

  describe("execute()", function() {
    var stepDefinition, world;
    var visitor, callback;

    beforeEach(function() {
      stepDefinition = createSpy("step definition");
      world          = createSpy("world");
      visitor        = createSpy("visitor");
      callback       = createSpy("callback received by execute()");
      spyOnStub(stepDefinition, 'invoke');
      spyOnStub(visitor, 'lookupStepDefinitionByName').andReturn(stepDefinition);
      spyOnStub(visitor, 'getWorld').andReturn(world);
    });

    it("looks up the step definition based on the step string", function() {
      step.execute(visitor, callback);
      expect(visitor.lookupStepDefinitionByName).toHaveBeenCalledWith(name);
    });

    it("gets the current World instance", function() {
      step.execute(visitor, callback);
      expect(visitor.getWorld).toHaveBeenCalled();
    });

    it("invokes the step definition", function() {
      step.execute(visitor, callback);
      expect(stepDefinition.invoke).toHaveBeenCalledWith(step, world, callback);
    });
  });
});
