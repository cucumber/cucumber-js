var ScenarioOutline = function (keyword, name, description, uri, line) {
    'use strict';
    var Cucumber = require('../../cucumber');
    var self = Cucumber.Ast.Scenario(keyword, name, description, uri, line);
    var examples = [];

    self.payload_type = 'scenarioOutline';

    self.setExamples = function (newExamples) {
        examples = newExamples;
    };

    self.getExamples = function () {
        return examples;
    };

    self.applyExampleRow = function (example, steps) {
        return steps.syncMap(function (step) {
            var name = step.getName(),
                table = Cucumber.Ast.DataTable(),
                rows = [],
                hasDocString = step.hasDocString(),
                hasDataTable = step.hasDataTable(),
                oldDocString = hasDocString ? step.getDocString() : null,
                docString = hasDocString ? oldDocString.getContents() : null,
                hashKey;

            if (hasDataTable) {
                step.getDataTable().getRows().syncForEach(function (row) {
                    var newRow = {
                        line: row.getLine(),
                        cells: JSON.stringify(row.raw())
                    };
                    rows.push(newRow);
                });
            }

            function mapRows(origText, replaceText) {
                rows = rows.map(function rowMap(row) {
                    return {
                        line: row.line,
                        cells: row.cells.replace(origText, replaceText)
                    };
                });
            }

            for (hashKey in example) {
                if (Object.prototype.hasOwnProperty.call(example, hashKey)) {
                    var findText = '<' + hashKey + '>';
                    var exampleData = example[hashKey];

                    name = name.replace(findText, exampleData);

                    if (hasDataTable) {
                        mapRows(findText, exampleData);
                    }

                    if (hasDocString) {
                        docString = docString.replace(findText, exampleData);
                    }
                }
            }

            var newStep = Cucumber.Ast.Step(step.getKeyword(), name, step.getLine());

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
        var rows = examples.getDataTable().getRows(),
            firstRow = rows.shift().raw();

        rows.syncForEach(function (row, index) {
            row.example = {};
            row.id = index;
            for (var i = 0, ii = firstRow.length; i < ii; i++) {
                row.example[firstRow[i]] = row.raw()[i];
            }
        });

        rows.forEach(function (row, iterate) {
            self.instructVisitorToVisitRowSteps(visitor, row, iterate);
        }, callback);
    };

    self.instructVisitorToVisitRowSteps = function (visitor, row, callback) {
        visitor.visitRow(row, self, callback);
    };

    self.visitRowSteps = function (visitor, row, callback) {
        self.instructVisitorToVisitBackgroundSteps(visitor, function () {
            var newSteps = self.applyExampleRow(row.example, self.getSteps());
            self.instructVisitorToVisitSteps(visitor, newSteps, callback);
        });
    };

    return self;
};
module.exports = ScenarioOutline;