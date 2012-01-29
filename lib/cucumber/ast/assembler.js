var Assembler = function(features) {
  var self = {
    getCurrentFeature: function getCurrentFeature() {
      return features.getLastFeature();
    },

    getCurrentScenarioOrBackground: function getCurrentScenarioOrBackground() {
      var currentFeature       = self.getCurrentFeature();
      var scenarioOrBackground = currentFeature.getLastScenario();
      if (!scenarioOrBackground)
        scenarioOrBackground = currentFeature.getBackground();
      return scenarioOrBackground;
    },

    getCurrentStep: function getCurrentStep() {
      var currentScenarioOrBackground = self.getCurrentScenarioOrBackground();
      var lastStep                    = currentScenarioOrBackground.getLastStep();
      return lastStep;
    },

    insertBackground: function insertBackground(background) {
      var currentFeature = self.getCurrentFeature();
      currentFeature.addBackground(background);
    },

    insertDataTableRow: function insertDataTableRow(dataTableRow) {
      var currentStep = self.getCurrentStep();
      currentStep.attachDataTableRow(dataTableRow);
    },

    insertDocString: function insertDocString(docString) {
      var currentStep = self.getCurrentStep();
      currentStep.attachDocString(docString);
    },

    insertFeature: function insertFeature(feature) {
      features.addFeature(feature);
    },

    insertScenario: function insertScenario(scenario) {
      var currentFeature = self.getCurrentFeature();
      currentFeature.addScenario(scenario);
    },

    insertStep: function insertStep(step) {
      var currentScenarioOrBackground = self.getCurrentScenarioOrBackground();
      currentScenarioOrBackground.addStep(step);
    }
  };
  return self;
};

module.exports = Assembler;