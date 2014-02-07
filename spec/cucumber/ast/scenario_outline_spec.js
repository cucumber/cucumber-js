require('../../support/spec_helper');

describe('Cucumber.Ast.ScenarioOutline', function () {
    'use strict';
    var Cucumber = requireLib('cucumber');
    var scenario, keyword, name, description, uri, line, examples;

    beforeEach(function () {
        keyword = createSpy('scenario keyword');
        name = createSpy('scenario name');
        description = createSpy('scenario description');
        uri = createSpy('uri');
        line = createSpy('starting scenario line number');
        examples = createSpy('examples collection');

        scenario = Cucumber.Ast.ScenarioOutline(keyword, name, description, uri, line);
    });

    describe('getExamples() [setExamples()]', function () {
        it('returns an empty set when no examples have been set', function () {
            expect(scenario.getExamples()).toEqual([]);
        });

        it('returns the examples', function () {
            scenario.setExamples(examples);
            expect(scenario.getExamples()).toBe(examples);
        });
    });

    describe('acceptVisitor', function () {
        var visitor, callback, dataRow, dataTable;

        beforeEach(function () {
            visitor = createSpyWithStubs('Visitor', {
                visitStep: null
            });

            dataRow = createSpyWithStubs('row', {
                raw: 'data row'
            });
            var rows = Cucumber.Type.Collection();
            rows.add(createSpyWithStubs('row', {
                raw: 'header row'
            }));
            rows.add(dataRow);

            dataTable = createSpyWithStubs('DataTable', {
                getRows: rows
            });
            examples = createSpyWithStubs('Visitor', {
                getDataTable: dataTable
            });
            callback = createSpy('Callback');
            spyOn(scenario, 'instructVisitorToVisitRowSteps');
            scenario.setExamples(examples);
        });

        it('instructs the visitor to visit the row steps', function () {
            scenario.acceptVisitor(visitor, callback);
            expect(scenario.instructVisitorToVisitRowSteps).toHaveBeenCalledWithValueAsNthParameter(visitor, 1);
            expect(scenario.instructVisitorToVisitRowSteps).toHaveBeenCalledWithValueAsNthParameter(dataRow, 2);
            expect(scenario.instructVisitorToVisitRowSteps).toHaveBeenCalledWithAFunctionAsNthParameter(3);
        });
    });
});