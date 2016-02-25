function Step(keyword, name, uri, line) {
  var Cucumber = require('../../cucumber');
  var docString, dataTable, previousStep, scenario;

  var self = {
    getScenario: function getScenario() {
      return scenario;
    },

    setScenario: function setScenario(newScenario) {
      scenario = newScenario;
    },

    setPreviousStep: function setPreviousStep(newPreviousStep) {
      previousStep = newPreviousStep;
    },

    isHidden: function isHidden() {
      return false;
    },

    isOutlineStep: function isOutlineStep() {
      return false;
    },

    getKeyword: function getKeyword() {
      return keyword;
    },

    getName: function getName() {
      return name;
    },

    hasUri: function hasUri() {
      return true;
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
      var result = false;

      if (self.hasPreviousStep()) {
        var previousStep = self.getPreviousStep();
        result           = previousStep.isOutcomeStep();
      }
      return result;
    },

    isPrecededByEventStep: function isPrecededByEventStep() {
      var result = false;

      if (self.hasPreviousStep()) {
        var previousStep          = self.getPreviousStep();
        result = previousStep.isEventStep();
      }
      return result;
    }
  };
  return self;
}

Step.EVENT_STEP_KEYWORD   = 'When ';
Step.OUTCOME_STEP_KEYWORD = 'Then ';
Step.AND_STEP_KEYWORD     = 'And ';
Step.BUT_STEP_KEYWORD     = 'But ';
Step.STAR_STEP_KEYWORD    = '* ';

module.exports = Step;
