var Step = function(keyword, name, uri, line) {
  var Cucumber = require('../../cucumber');
  var docString, dataTable, previousStep;

  var self = {
    setPreviousStep: function setPreviousStep(newPreviousStep) {
      previousStep = newPreviousStep;
    },

    isOutlineStep: function isOutlineStep(){
      return false;
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
      var attachment         = self.getAttachment();
      var attachmentContents;
      if (attachment)
        attachmentContents = attachment.getContents();
      return attachmentContents;
    },

    getDocString: function getDocString() { return docString; },

    getDataTable: function getDataTable() { return dataTable; },

    hasAttachment: function hasAttachment() {
      return self.hasDocString() || self.hasDataTable();
    },

    hasDocString: function hasDocString() {
      return !!docString;
    },

    hasDataTable: function hasDataTable() {
      return !!dataTable;
    },

    attachDocString: function attachDocString(_docString) { docString = _docString; },

    attachDataTable: function attachDataTable(_dataTable) { dataTable = _dataTable; },

    attachDataTableRow: function attachDataTableRow(row) {
      self.ensureDataTableIsAttached();
      var dataTable = self.getDataTable();
      dataTable.attachRow(row);
    },

    ensureDataTableIsAttached: function ensureDataTableIsAttached() {
      var dataTable = self.getDataTable();
      if (!dataTable) {
        dataTable = Cucumber.Ast.DataTable();
        self.attachDataTable(dataTable);
      }
    },

    isOutcomeStep: function isOutcomeStep() {
      var isOutcomeStep =
          self.hasOutcomeStepKeyword() || self.isRepeatingOutcomeStep();
      return isOutcomeStep;
    },

    isEventStep: function isEventStep() {
      var isEventStep =
          self.hasEventStepKeyword() || self.isRepeatingEventStep();
      return isEventStep;
    },

    hasOutcomeStepKeyword: function hasOutcomeStepKeyword() {
      var hasOutcomeStepKeyword =
          keyword == Step.OUTCOME_STEP_KEYWORD;
      return hasOutcomeStepKeyword;
    },

    hasEventStepKeyword: function hasEventStepKeyword() {
      var hasEventStepKeyword =
          keyword == Step.EVENT_STEP_KEYWORD;
      return hasEventStepKeyword;
    },

    isRepeatingOutcomeStep: function isRepeatingOutcomeStep() {
      var isRepeatingOutcomeStep =
          self.hasRepeatStepKeyword() && self.isPrecededByOutcomeStep();
      return isRepeatingOutcomeStep;
    },

    isRepeatingEventStep: function isRepeatingEventStep() {
      var isRepeatingEventStep =
          self.hasRepeatStepKeyword() && self.isPrecededByEventStep();
      return isRepeatingEventStep;
    },

    hasRepeatStepKeyword: function hasRepeatStepKeyword() {
      var hasRepeatStepKeyword =
          keyword == Step.AND_STEP_KEYWORD || keyword == Step.BUT_STEP_KEYWORD || keyword == Step.STAR_STEP_KEYWORD;
      return hasRepeatStepKeyword;
    },

    isPrecededByOutcomeStep: function isPrecededByOutcomeStep() {
      var isPrecededByOutcomeStep = false;

      if (self.hasPreviousStep()) {
        var previousStep            = self.getPreviousStep();
        var isPrecededByOutcomeStep = previousStep.isOutcomeStep();
      }
      return isPrecededByOutcomeStep;
    },

    isPrecededByEventStep: function isPrecededByEventStep() {
      var isPrecededByEventStep = false;

      if (self.hasPreviousStep()) {
        var previousStep          = self.getPreviousStep();
        var isPrecededByEventStep = previousStep.isEventStep();
      }
      return isPrecededByEventStep;
    },

    acceptVisitor: function acceptVisitor(visitor, callback) {
      self.execute(visitor, function(stepResult) {
        visitor.visitStepResult(stepResult, callback);
      });
    },

    execute: function execute(visitor, callback) {
      var stepDefinition = visitor.lookupStepDefinitionByName(name);
      var world          = visitor.getWorld();
      stepDefinition.invoke(self, world, callback);
    }
  };
  return self;
};
Step.EVENT_STEP_KEYWORD   = 'When ';
Step.OUTCOME_STEP_KEYWORD = 'Then ';
Step.AND_STEP_KEYWORD     = 'And ';
Step.BUT_STEP_KEYWORD     = 'But ';
Step.STAR_STEP_KEYWORD    = '* ';
module.exports = Step;
