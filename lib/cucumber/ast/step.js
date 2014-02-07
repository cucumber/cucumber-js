var Step = function (keyword, name, uri, line) {
    'use strict';
    var Cucumber = require('../../cucumber');
    var docString, dataTable, previousStep;

    var self = {
        setPreviousStep: function setPreviousStep(newPreviousStep) {
            previousStep = newPreviousStep;
        },

        getKeyword: function getKeyword() {
            return keyword;
        },

        getName: function getName() {
            return name;
        },

        getUri: function getUri() {
            return uri;
        },

        getLine: function getLine() {
            return line;
        },

        getPreviousStep: function getPreviousStep() {
            return previousStep;
        },

        hasPreviousStep: function hasPreviousStep() {
            return !!previousStep;
        },

        getAttachment: function getAttachment() {
            var attachment;
            if (self.hasDocString()) {
                attachment = self.getDocString();
            } else if (self.hasDataTable()) {
                attachment = self.getDataTable();
            }
            return attachment;
        },

        getAttachmentContents: function getAttachmentContents() {
            var attachment = self.getAttachment();
            var attachmentContents;
            if (attachment) {
                attachmentContents = attachment.getContents();
            }
            return attachmentContents;
        },

        getDocString: function getDocString() {
            return docString;
        },

        getDataTable: function getDataTable() {
            return dataTable;
        },

        hasAttachment: function hasAttachment() {
            return self.hasDocString() || self.hasDataTable();
        },

        hasDocString: function hasDocString() {
            return !!docString;
        },

        hasDataTable: function hasDataTable() {
            return !!dataTable;
        },

        attachDocString: function attachDocString(_docString) {
            docString = _docString;
        },

        attachDataTable: function attachDataTable(_dataTable) {
            dataTable = _dataTable;
        },

        attachDataTableRow: function attachDataTableRow(row) {
            self.ensureDataTableIsAttached();
            var dataTable = self.getDataTable();
            dataTable.attachRow(row);
        },

        ensureDataTableIsAttached: function ensureDataTableIsAttached() {
            if (!self.getDataTable()) {
                self.attachDataTable(Cucumber.Ast.DataTable());
            }
        },

        isOutcomeStep: function isOutcomeStep() {
            return self.hasOutcomeStepKeyword() || self.isRepeatingOutcomeStep();
        },

        isEventStep: function isEventStep() {
            return self.hasEventStepKeyword() || self.isRepeatingEventStep();
        },

        hasOutcomeStepKeyword: function hasOutcomeStepKeyword() {
            return keyword === Step.OUTCOME_STEP_KEYWORD;
        },

        hasEventStepKeyword: function hasEventStepKeyword() {
            return keyword === Step.EVENT_STEP_KEYWORD;
        },

        isRepeatingOutcomeStep: function isRepeatingOutcomeStep() {
            return self.hasRepeatStepKeyword() && self.isPrecededByOutcomeStep();
        },

        isRepeatingEventStep: function isRepeatingEventStep() {
            return self.hasRepeatStepKeyword() && self.isPrecededByEventStep();
        },

        hasRepeatStepKeyword: function hasRepeatStepKeyword() {
            return keyword === Step.AND_STEP_KEYWORD || keyword === Step.BUT_STEP_KEYWORD || keyword === Step.STAR_STEP_KEYWORD;
        },

        isPrecededByOutcomeStep: function isPrecededByOutcomeStep() {
            return self.hasPreviousStep() ? self.getPreviousStep().isOutcomeStep() : false;
        },

        isPrecededByEventStep: function isPrecededByEventStep() {
            return self.hasPreviousStep() ? self.getPreviousStep().isEventStep() : false;
        },

        acceptVisitor: function acceptVisitor(visitor, callback) {
            self.execute(visitor, function (stepResult) {
                visitor.visitStepResult(stepResult, callback);
            });
        },

        execute: function execute(visitor, callback) {
            var stepDefinition = visitor.lookupStepDefinitionByName(name);
            var world = visitor.getWorld();
            stepDefinition.invoke(self, world, callback);
        }
    };
    return self;
};
Step.EVENT_STEP_KEYWORD = 'When ';
Step.OUTCOME_STEP_KEYWORD = 'Then ';
Step.AND_STEP_KEYWORD = 'And ';
Step.BUT_STEP_KEYWORD = 'But ';
Step.STAR_STEP_KEYWORD = '* ';
module.exports = Step;