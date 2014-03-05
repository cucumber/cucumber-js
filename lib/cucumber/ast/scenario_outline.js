var ScenarioOutline = function (keyword, name, description, uri, line) {
  var Cucumber = require('../../cucumber');
  var self = Cucumber.Ast.Scenario(keyword, name, description, uri, line);
  var examples = [];

  self.payloadType = 'scenarioOutline';

  self.setExamples = function (newExamples) {
    examples = newExamples;
  };

  function buildScenario(row) {
    var newSteps = self.applyExampleRow(row.example, self.getSteps());
    var subScenario = Cucumber.Ast.Scenario(keyword, name, description, uri, line);
    subScenario.setSteps(newSteps);
    return subScenario;
  }

  self.buildScenarios = function () {
    var rows = examples.getDataTable().getRows();
    var firstRow = rows.shift().raw();

    rows.syncForEach(function (row, index) {
      row.example = {};
      row.id = index;
      for (var i = 0, ii = firstRow.length; i < ii; i++) {
        row.example[firstRow[i]] = row.raw()[i];
      }
    });

    var scenarios = Cucumber.Type.Collection();
    rows.syncForEach(function (row) {
      scenarios.add(buildScenario(row));
    });
    return scenarios;
  };

  self.getExamples = function () {
    return examples;
  };

  self.applyExampleRow = function (example, steps) {
    return steps.syncMap(function (step) {
      var name = step.getName();
      var table = Cucumber.Ast.DataTable();
      var rows = [];
      var hasDocString = step.hasDocString();
      var hasDataTable = step.hasDataTable();
      var oldDocString = hasDocString ? step.getDocString() : null;
      var docString = hasDocString ? oldDocString.getContents() : null;

      if (hasDataTable) {
        step.getDataTable().getRows().syncForEach(function (row) {
          var newRow = {
            line: row.getLine(),
            cells: JSON.stringify(row.raw())
          };
          rows.push(newRow);
        });
      }

      for (var hashKey in example) {
        if (Object.prototype.hasOwnProperty.call(example, hashKey)) {
          var findText = '<' + hashKey + '>';
          var exampleData = example[hashKey];

          name = name.replace(findText, exampleData);

          if (hasDataTable) {
            rows = rows.map(function (row) {
              return {
                line: row.line,
                cells: row.cells.replace(findText, exampleData)
              };
            });
          }

          if (hasDocString) {
            docString = docString.replace(findText, exampleData);
          }
        }
      }

      var newStep = Cucumber.Ast.OutlineStep(step.getKeyword(), name, uri, step.getLine());
      newStep.setOriginalStep(Cucumber.Ast.Step(step.getKeyword(), step.getName(), step.getUri(), step.getLine()));

      if (hasDataTable) {
        rows.forEach(function (row) {
          table.attachRow(Cucumber.Ast.DataTable.Row(JSON.parse(row.cells), row.line));
        });
        newStep.attachDataTable(table);
      }

      if (hasDocString) {
        newStep.attachDocString(Cucumber.Ast.DocString(oldDocString.getContentType(), docString, oldDocString.getLine()));
      }
      return newStep;
    });
  };

  self.acceptVisitor = function (visitor, callback) {
    callback();
  };

  return self;
};
module.exports = ScenarioOutline;
