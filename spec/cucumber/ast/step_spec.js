require('../../support/spec_helper');

describe("Cucumber.Ast.Step", function() {
  var Cucumber = require('cucumber');
  var step, keyword, name, line;
  var docString, dataTable;

  beforeEach(function() {
    name      = createSpy("Step name");
    keyword   = createSpy("Step keyword");
    line      = createSpy("Step line");
    docString = createSpy("DocString AST element");
    dataTable = createSpy("data table");
    step      = Cucumber.Ast.Step(keyword, name, line);
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

  describe("getLine()", function() {
    it("returns the line number on which the step lies", function() {
      expect(step.getLine()).toBe(line);
    });
  });

  describe("hasDocString() [attachDocString()]", function() {
    it("returns true when a DocString was attached to the step", function() {
      step.attachDocString(docString);
      expect(step.hasDocString()).toBeTruthy();
    });

    it("returns false when no DocString was attached to the step", function() {
      expect(step.hasDocString()).toBeFalsy();
    });
  });

  describe("getDocString() [attachDocString()]", function() {
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

    it("checks wether a doc string is attached", function() {
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

      it("checks wether a data table is attached", function() {
        step.getAttachment();
        expect(step.hasDataTable).toHaveBeenCalled();
      });

      describe("when a data table is attached", function() {
        beforeEach(function() {
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

      it("creates a new data table AST element", function() {
        step.ensureDataTableIsAttached();
        expect(Cucumber.Ast.DataTable).toHaveBeenCalled();
      });

      it("attaches the new data table AST element to the step", function() {
        step.ensureDataTableIsAttached();
        expect(step.attachDataTable).toHaveBeenCalledWith(dataTable);
      });
    });

    describe("when there is a data table already", function() {
      beforeEach(function() {
        dataTable = createSpy("existing data table");
        step.getDataTable.andReturn(dataTable);
      });

      it("does not create a new data table AST element", function() {
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
    var stepDefinition, world, attachment;
    var visitor, callback;

    beforeEach(function() {
      stepDefinition = createSpy("step definition");
      world          = createSpy("world");
      attachment     = createSpy("attachment");
      visitor        = createSpy("visitor");
      callback       = createSpy("callback received by execute()");
      spyOnStub(stepDefinition, 'invoke');
      spyOnStub(visitor, 'lookupStepDefinitionByName').andReturn(stepDefinition);
      spyOnStub(visitor, 'getWorld').andReturn(world);
      spyOnStub(step, 'getAttachment').andReturn(attachment);
    });

    it("looks up the step definition based on the step string", function() {
      step.execute(visitor, callback);
      expect(visitor.lookupStepDefinitionByName).toHaveBeenCalledWith(name);
    });

    it("gets the current World instance", function() {
      step.execute(visitor, callback);
      expect(visitor.getWorld).toHaveBeenCalled();
    });

    it("gets the step attachement", function() {
      step.execute(visitor, callback);
      expect(step.getAttachment).toHaveBeenCalled();
    });

    it("invokes the step definition with the step name, world, attachment and the callback", function() {
      step.execute(visitor, callback);
      expect(stepDefinition.invoke).toHaveBeenCalledWith(name, world, attachment, callback);
    });
  });
});
